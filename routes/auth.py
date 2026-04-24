from flask import Blueprint, request, session
import bcrypt
from database import get_db
from utils import send_json, to_dict
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
db = get_db()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.users.find_one({'username': username})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8') if isinstance(user['password'], str) else user['password']):
        session['user_id'] = str(user['_id'])
        session['role'] = user['role']
        session['name'] = user['name']
        return send_json({'success': True, 'logged_in': True, 'message': 'Login successful', 'user': to_dict(user)})
    
    return send_json({'success': False, 'message': 'Invalid credentials'}, 401)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ('name', 'email', 'username', 'password')):
        return send_json({'success': False, 'message': 'Missing required fields'}, 400)

    if db.users.find_one({'$or': [{'email': data['email']}, {'username': data['username']}]}):
        return send_json({'success': False, 'message': 'User already exists'}, 409)

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = {
        'name': data['name'],
        'email': data['email'],
        'username': data['username'],
        'password': hashed,
        'role': data.get('role', 'participant'),
        'department_id': None,
        'created_at': datetime.utcnow()
    }
    db.users.insert_one(user)
    return send_json({'success': True, 'message': 'Registration successful'})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return send_json({'success': True, 'message': 'Logged out'})

@auth_bp.route('/session', methods=['GET'])
def get_session():
    if 'user_id' in session:
        return send_json({
            'success': True, 
            'logged_in': True,
            'user': {
                'id': session['user_id'],
                'role': session['role'],
                'name': session['name']
            }
        })
    return send_json({'success': False, 'logged_in': False, 'message': 'No session'}, 401)
