import os

from dotenv import load_dotenv
from pymongo import MongoClient


# Load environment variables from backend/.env
load_dotenv()


# Get MongoDB connection string
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in .env")


# Create MongoDB client
client = MongoClient(MONGODB_URI)


# Emergency AI Coordinator database
db = client["emergency_ai"]


# Collections
incidents_collection = db["incidents"]
agent_reports_collection = db["agent_reports"]
coordination_collection = db["coordination_results"]
action_plans_collection = db["action_plans"]
sms_logs_collection = db["sms_logs"]


def test_database_connection():
    """
    Test connection to MongoDB Atlas.
    """
    try:
        client.admin.command("ping")
        print("MongoDB connection successful!")
        return True

    except Exception as e:
        print("MongoDB connection error:", e)
        return False


def create_incident(incident_data: dict):
    """
    Insert an incident into MongoDB.
    """
    result = incidents_collection.insert_one(incident_data)

    return str(result.inserted_id)