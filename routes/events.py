from flask import Blueprint, request, session
from bson import ObjectId
from database import get_db
from utils import send_json, to_dict
from datetime import datetime

events_bp = Blueprint('events', __name__)
db = get_db()

@events_bp.route('', methods=['GET'])
def get_events():
    event_id = request.args.get('id')
    status = request.args.get('status')
    
    query = {}
    if event_id: query['_id'] = ObjectId(event_id)
    if status: query['status'] = status

    pipeline = [
        {'$match': query},
        {
            '$lookup': {
                'from': 'departments',
                'localField': 'department_id',
                'foreignField': '_id',
                'as': 'dept'
            }
        },
        {'$unwind': {'path': '$dept', 'preserveNullAndEmptyArrays': True}},
        {
            '$lookup': {
                'from': 'event_registrations',
                'localField': '_id',
                'foreignField': 'event_id',
                'as': 'regs'
            }
        },
        {
            '$addFields': {
                'registered_count': {
                    '$size': {
                        '$filter': {
                            'input': '$regs',
                            'as': 'r',
                            'cond': {'$ne': ['$$r.registration_status', 'cancelled']}
                        }
                    }
                }
            }
        },
        {'$sort': {'event_date': -1}}
    ]
    
    events = list(db.events.aggregate(pipeline))
    result = []
    for e in events:
        d = to_dict(e)
        d['department_name'] = e['dept']['department_name'] if 'dept' in e and e['dept'] else None
        result.append(d)
        
    if event_id and result:
        return send_json({'success': True, 'data': result[0]})
    return send_json({'success': True, 'data': result})

@events_bp.route('', methods=['POST'])
def create_event():
    if session.get('role') not in ['admin', 'staff']:
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    event = {
        'event_name': data['event_name'],
        'description': data.get('description', ''),
        'event_date': datetime.strptime(data['event_date'], '%Y-%m-%d'),
        'registration_deadline': datetime.strptime(data['registration_deadline'], '%Y-%m-%d') if data.get('registration_deadline') else None,
        'location': data.get('location', ''),
        'department_id': ObjectId(data['department_id']) if data.get('department_id') else None,
        'staff_id': ObjectId(data['staff_id']) if data.get('staff_id') else None,
        'capacity': int(data.get('capacity', 100)),
        'status': data.get('status', 'upcoming'),
        'created_at': datetime.utcnow()
    }
    db.events.insert_one(event)
    return send_json({'success': True, 'message': 'Event created'})

@events_bp.route('', methods=['PUT'])
def update_event():
    if session.get('role') not in ['admin', 'staff']:
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    update_data = {
        'event_name': data['event_name'],
        'description': data.get('description', ''),
        'event_date': datetime.strptime(data['event_date'], '%Y-%m-%d'),
        'registration_deadline': datetime.strptime(data['registration_deadline'], '%Y-%m-%d') if data.get('registration_deadline') else None,
        'location': data.get('location', ''),
        'department_id': ObjectId(data['department_id']) if data.get('department_id') else None,
        'staff_id': ObjectId(data['staff_id']) if data.get('staff_id') else None,
        'capacity': int(data.get('capacity', 100)),
        'status': data.get('status', 'upcoming')
    }
    db.events.update_one({'_id': ObjectId(data['id'])}, {'$set': update_data})
    return send_json({'success': True, 'message': 'Event updated'})

@events_bp.route('', methods=['DELETE'])
def delete_event():
    if session.get('role') not in ['admin', 'staff']:
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    db.events.delete_one({'_id': ObjectId(data['id'])})
    # Also delete registrations?
    db.event_registrations.delete_many({'event_id': ObjectId(data['id'])})
    return send_json({'success': True, 'message': 'Event deleted'})
