import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_session import Session
from database import get_db
from routes.auth import auth_bp
from routes.departments import dept_bp
from routes.users import users_bp
from routes.events import events_bp
from routes.registrations import regs_bp
from routes.analytics import analytics_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.getenv("SECRET_KEY", "super-secret-key")

# Session Config
# In production (Vercel), we use standard Flask signed cookies
if not os.getenv("VERCEL"):
    app.config['SESSION_TYPE'] = 'filesystem'
    Session(app)
else:
    # Vercel handles sessions via signed cookies automatically with secret_key
    pass

CORS(app, supports_credentials=True)

# Register Blueprints with /api prefix
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dept_bp, url_prefix='/api/departments')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(events_bp, url_prefix='/api/events')
app.register_blueprint(regs_bp, url_prefix='/api/registrations')
app.register_blueprint(analytics_bp, url_prefix='/api')

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"🚀 Server starting on http://localhost:{port}")
    
    try:
        from waitress import serve
        serve(app, host='0.0.0.0', port=port)
    except ImportError:
        print("⚠️ Waitress not found, falling back to Flask dev server...")
        debug = os.getenv("DEBUG", "True") == "True"
        app.run(debug=debug, host='0.0.0.0', port=port, use_reloader=False)
