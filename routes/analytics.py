from flask import Blueprint, request, session
from bson import ObjectId
from database import get_db
from utils import send_json, to_dict, parse_json
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)
db = get_db()

@analytics_bp.route('/dashboard', methods=['GET'])
def dashboard():
    stats = {
        'total_events': db.events.count_documents({}),
        'total_students': db.users.count_documents({'role': 'student'}),
        'total_staff': db.users.count_documents({'role': 'staff'}),
        'total_registrations': db.event_registrations.count_documents({'registration_status': {'$ne': 'cancelled'}}),
        'total_departments': db.departments.count_documents({}),
        'total_participants': db.users.count_documents({'role': 'participant'}),
        'upcoming_events': db.events.count_documents({'status': 'upcoming'}),
        'completed_events': db.events.count_documents({'status': 'completed'})
    }

    # Dept chart
    dept_agg = db.departments.aggregate([
        {'$lookup': {'from': 'events', 'localField': '_id', 'foreignField': 'department_id', 'as': 'evs'}},
        {'$project': {'department_name': 1, 'event_count': {'$size': '$evs'}}},
        {'$sort': {'event_count': -1}}
    ])
    stats['dept_chart'] = parse_json(list(dept_agg))

    # Recent regs
    recent_regs = db.event_registrations.aggregate([
        {'$sort': {'created_at': -1}},
        {'$limit': 8},
        {'$lookup': {'from': 'users', 'localField': 'user_id', 'foreignField': '_id', 'as': 'u'}},
        {'$unwind': '$u'},
        {'$lookup': {'from': 'events', 'localField': 'event_id', 'foreignField': '_id', 'as': 'e'}},
        {'$unwind': '$e'},
        {'$project': {'created_at': 1, 'user_name': '$u.name', 'user_role': '$u.role', 'event_name': '$e.event_name'}}
    ])
    stats['recent_registrations'] = parse_json(list(recent_regs))

    # Recent events
    recent_evs = db.events.aggregate([
        {'$sort': {'created_at': -1}},
        {'$limit': 5},
        {'$lookup': {'from': 'departments', 'localField': 'department_id', 'foreignField': '_id', 'as': 'd'}},
        {'$unwind': {'path': '$d', 'preserveNullAndEmptyArrays': True}},
        {'$project': {'event_name': 1, 'event_date': 1, 'status': 1, 'location': 1, 'department_name': '$d.department_name'}}
    ])
    stats['recent_events'] = parse_json(list(recent_evs))

    # Trend
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    trend = db.event_registrations.aggregate([
        {'$match': {'created_at': {'$gte': six_months_ago}}},
        {'$group': {
            '_id': {'year': {'$year': '$created_at'}, 'month': {'$month': '$created_at'}},
            'count': {'$sum': 1},
            'date': {'$first': '$created_at'}
        }},
        {'$sort': {'date': 1}},
        {'$project': {'_id': 0, 'month': {'$dateToString': {'format': '%b %Y', 'date': '$date'}}, 'count': 1}}
    ])
    stats['trend'] = parse_json(list(trend))

    return send_json({'success': True, 'data': stats})

@analytics_bp.route('/reports', methods=['GET'])
def reports():
    rtype = request.args.get('type', 'event_wise')
    
    if rtype == 'event_wise':
        data = db.events.aggregate([
            {'$lookup': {'from': 'event_registrations', 'localField': '_id', 'foreignField': 'event_id', 'as': 'r'}},
            {'$project': {
                'event_name': 1, 'event_date': 1, 'location': 1, 'status': 1, 'capacity': 1,
                'total_registered': {'$size': {'$filter': {'input': '$r', 'as': 'x', 'cond': {'$ne': ['$$x.registration_status', 'cancelled']}}}},
                'attended': {'$size': {'$filter': {'input': '$r', 'as': 'x', 'cond': {'$eq': ['$$x.attendance_status', 'present']}}}}
            }},
            {'$sort': {'event_date': -1}}
        ])
        return send_json({'success': True, 'type': 'event_wise', 'data': [to_dict(d) for d in data]})

    if rtype == 'department_wise':
        data = db.departments.aggregate([
            {'$lookup': {'from': 'events', 'localField': '_id', 'foreignField': 'department_id', 'as': 'evs'}},
            {'$lookup': {'from': 'users', 'localField': '_id', 'foreignField': 'department_id', 'as': 'usrs'}},
            {
                '$lookup': {
                    'from': 'event_registrations',
                    'let': {'dept_id': '$_id'},
                    'pipeline': [
                        {'$lookup': {'from': 'events', 'localField': 'event_id', 'foreignField': '_id', 'as': 'e'}},
                        {'$unwind': '$e'},
                        {'$match': {'$expr': {'$and': [{'$eq': ['$e.department_id', '$$dept_id']}, {'$ne': ['$registration_status', 'cancelled']}]}}}
                    ],
                    'as': 'regs'
                }
            },
            {'$project': {
                'department_name': 1,
                'total_events': {'$size': '$evs'},
                'total_registrations': {'$size': '$regs'},
                'total_students': {'$size': {'$filter': {'input': '$usrs', 'as': 'u', 'cond': {'$eq': ['$$u.role', 'student']}}}}
            }},
            {'$sort': {'total_registrations': -1}}
        ])
        return send_json({'success': True, 'type': 'department_wise', 'data': [to_dict(d) for d in data]})

    if rtype == 'attendance':
        event_id = request.args.get('event_id')
        match = {}
        if event_id: match['event_id'] = ObjectId(event_id)
        
        data = db.event_registrations.aggregate([
            {'$match': match},
            {'$lookup': {'from': 'users', 'localField': 'user_id', 'foreignField': '_id', 'as': 'u'}},
            {'$unwind': '$u'},
            {'$lookup': {'from': 'events', 'localField': 'event_id', 'foreignField': '_id', 'as': 'e'}},
            {'$unwind': '$e'},
            {'$project': {
                'name': '$u.name', 'email': '$u.email', 'username': '$u.username', 'user_role': '$u.role',
                'event_name': '$e.event_name', 'attendance_status': 1, 'registration_status': 1, 'created_at': 1,
                'event_date': '$e.event_date'
            }},
            {'$sort': {'event_date': -1, 'name': 1}}
        ])
        return send_json({'success': True, 'type': 'attendance', 'data': [to_dict(d) for d in data]})
    return send_json({'success': False, 'message': 'Unknown report type'}, 400)
