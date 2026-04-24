import os
from pymongo import MongoClient
from dotenv import load_dotenv
import sys

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "event_management")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Trigger a connection to check if server is available
    client.server_info() 
    db = client[DB_NAME]
    print(f"✅ Connected to MongoDB Database: {DB_NAME}")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
    print("\n💡 Tip: Make sure MongoDB is installed and running on your system.")
    print("💡 Tip: Check your MONGO_URI in the .env file.")
    sys.exit(1)

def get_db():
    return db
