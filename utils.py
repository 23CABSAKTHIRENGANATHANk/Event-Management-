from flask import jsonify
from bson import ObjectId
from datetime import datetime

def send_json(data, status=200):
    return jsonify(data), status

def parse_json(data):
    if isinstance(data, list):
        return [parse_json(item) for item in data]
    if isinstance(data, dict):
        return {k: parse_json(v) for k, v in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, datetime):
        return data.strftime("%Y-%m-%d %H:%M:%S")
    return data

def to_dict(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return parse_json(doc)
