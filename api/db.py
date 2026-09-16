import sys
from pathlib import Path

from pymongo import MongoClient, DESCENDING

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import config  # noqa: E402

_client = MongoClient(config.MONGO_URI)
_db = _client[config.MONGO_DB_NAME]
tags_collection = _db[config.COLLECTION_TAGS]
alarms_collection = _db[config.COLLECTION_ALARMS]


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["timestamp"] = doc["timestamp"].isoformat()
    return doc


def get_latest(collection) -> dict | None:
    doc = collection.find_one(sort=[("timestamp", DESCENDING)])
    return serialize(doc) if doc else None


def get_history(collection, limit: int) -> list[dict]:
    cursor = collection.find(sort=[("timestamp", DESCENDING)], limit=limit)
    return [serialize(doc) for doc in cursor]
