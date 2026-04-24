from flask import Blueprint, request, session
from bson import ObjectId
from database import get_db
from utils import send_json, to_dict
from datetime import datetime

regs_bp = Blueprint('registrations', __name__)
db = get_db()

@regs_bp.route('', methods=['GET'])
def get_registrations():
    event_id = request.args.get('event_id')
    user_id = request.args.get('user_id')
    role = session.get('role')

    match = {}
    if role in ['student', 'participant']:
        match['user_id'] = ObjectId(session['user_id'])
    elif event_id:
        match['event_id'] = ObjectId(event_id)
    elif user_id:
        match['user_id'] = ObjectId(user_id)

    pipeline = [
        {'$match': match},
        {
            '$lookup': {
                'from': 'users',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'user'
            }
        },
        {'$unwind': '$user'},
        {
            '$lookup': {
                'from': 'events',
                'localField': 'event_id',
                'foreignField': '_id',
                'as': 'event'
            }
        },
        {'$unwind': '$event'},
        {'$sort': {'created_at': -1}}
    ]
    
    regs = list(db.event_registrations.aggregate(pipeline))
    result = []
    for r in regs:
        d = to_dict(r)
        d.update({
            'name': r['user']['name'],
            'email': r['user']['email'],
            'username': r['user']['username'],
            'user_role': r['user']['role'],
            'event_name': r['event']['event_name'],
            'event_date': r['event']['event_date'].strftime('%Y-%m-%d'),
            'location': r['event'].get('location', '')
        })
        result.append(d)
        
    return send_json({'success': True, 'data': result})

@regs_bp.route('', methods=['POST'])
def register():
    data = request.get_json()
    event_id = ObjectId(data['event_id'])
    user_id = ObjectId(data.get('user_id', session.get('user_id')))

    if db.event_registrations.find_one({'user_id': user_id, 'event_id': event_id}):
        return send_json({'success': False, 'message': 'Already registered'}, 409)

    event = db.events.find_one({'_id': event_id})
    count = db.event_registrations.count_documents({
        'event_id': event_id,
        'registration_status': {'$ne': 'cancelled'}
    })
    
    if event and count >= event.get('capacity', 100):
        return send_json({'success': False, 'message': 'Event full'}, 400)

    db.event_registrations.insert_one({
        'user_id': user_id,
        'event_id': event_id,
        'registration_status': 'confirmed',
        'attendance_status': 'not_marked',
        'created_at': datetime.utcnow()
    })
    return send_json({'success': True, 'message': 'Registered successfully'})

@regs_bp.route('', methods=['PUT'])
def update_registration():
    if session.get('role') not in ['admin', 'staff']:
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    db.event_registrations.update_one(
        {'_id': ObjectId(data['id'])},
        {'$set': {
            'attendance_status': data.get('attendance_status', 'not_marked'),
            'registration_status': data.get('registration_status', 'confirmed')
        }}
    )
    return send_json({'success': True, 'message': 'Registration updated'})

@regs_bp.route('', methods=['DELETE'])
def cancel_registration():
    data = request.get_json()
    db.event_registrations.delete_one({'_id': ObjectId(data['id'])})
    return send_json({'success': True, 'message': 'Cancelled successfully'})
