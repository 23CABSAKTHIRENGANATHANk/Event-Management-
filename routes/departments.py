from flask import Blueprint, request, session
from bson import ObjectId
from database import get_db
from utils import send_json, to_dict
from datetime import datetime

dept_bp = Blueprint('departments', __name__)
db = get_db()

@dept_bp.route('', methods=['GET'])
def get_departments():
    depts = list(db.departments.find().sort('department_name', 1))
    return send_json({'success': True, 'data': [to_dict(d) for d in depts]})

@dept_bp.route('', methods=['POST'])
def create_department():
    if session.get('role') != 'admin':
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    db.departments.insert_one({
        'department_name': data['department_name'],
        'description': data.get('description', ''),
        'created_at': datetime.utcnow()
    })
    return send_json({'success': True, 'message': 'Department created'})

@dept_bp.route('', methods=['PUT'])
def update_department():
    if session.get('role') != 'admin':
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    db.departments.update_one(
        {'_id': ObjectId(data['id'])},
        {'$set': {
            'department_name': data['department_name'],
            'description': data.get('description', '')
        }}
    )
    return send_json({'success': True, 'message': 'Department updated'})

@dept_bp.route('', methods=['DELETE'])
def delete_department():
    if session.get('role') != 'admin':
        return send_json({'success': False, 'message': 'Unauthorized'}, 403)
    
    data = request.get_json()
    db.departments.delete_one({'_id': ObjectId(data['id'])})
    return send_json({'success': True, 'message': 'Department deleted'})
