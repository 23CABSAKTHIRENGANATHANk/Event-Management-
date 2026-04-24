from flask import Blueprint, request, session
from bson import ObjectId
import bcrypt
from database import get_db
from utils import send_json, to_dict
from datetime import datetime

users_bp = Blueprint('users', __name__)
db = get_db()

@users_bp.route('', methods=['GET'])
def get_users():
    role_filter = request.args.get('role')
    query = {}
    if role_filter:
        query['role'] = role_filter

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
        {'$sort': {'name': 1}}
    ]
    
    users = list(db.users.aggregate(pipeline))
    result = []
    for u in users:
        d = to_dict(u)
        d['department_name'] = u['dept']['department_name'] if 'dept' in u and u['dept'] else None
        result.append(d)
        
    return send_json({'success': True, 'data': result})

@users_bp.route('', methods=['POST'])
def create_user():
    if session.get('role') != 'admin':
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = {
        'name': data['name'],
        'email': data['email'],
        'username': data['username'],
        'password': hashed,
        'role': data['role'],
        'department_id': ObjectId(data['department_id']) if data.get('department_id') else None,
        'created_at': datetime.utcnow()
    }
    db.users.insert_one(user)
    return send_json({'success': True, 'message': 'User created'})

@users_bp.route('', methods=['PUT'])
def update_user():
    if session.get('role') != 'admin':
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    update_data = {
        'name': data['name'],
        'email': data['email'],
        'username': data['username'],
        'role': data['role'],
        'department_id': ObjectId(data['department_id']) if data.get('department_id') else None
    }
    if data.get('password'):
        update_data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
    db.users.update_one({'_id': ObjectId(data['id'])}, {'$set': update_data})
    return send_json({'success': True, 'message': 'User updated'})

@users_bp.route('', methods=['DELETE'])
def delete_user():
    if session.get('role') != 'admin':
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    db.users.delete_one({'_id': ObjectId(data['id'])})
    return send_json({'success': True, 'message': 'User deleted'})
