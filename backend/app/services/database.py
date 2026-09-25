import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in .env")

client = MongoClient(MONGODB_URI)

db = client["emergency_ai"]

users_collection = db["users"]
incidents_collection = db["incidents"]
agent_reports_collection = db["agent_reports"]
coordination_collection = db["coordination_results"]
action_plans_collection = db["action_plans"]
sms_logs_collection = db["sms_logs"]


def test_database_connection():
    try:
        client.admin.command("ping")
        print("MongoDB connection successful!")
        return True
    except Exception as e:
        print("MongoDB connection error:", e)
        return False


def create_incident(incident_data: dict):
    result = incidents_collection.insert_one(incident_data)
    return str(result.inserted_id)
