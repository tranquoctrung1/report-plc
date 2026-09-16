import logging
from datetime import datetime, timezone

from pymongo import MongoClient

logger = logging.getLogger(__name__)


class MongoWriter:
    def __init__(self, uri: str, db_name: str, tags_collection: str, alarms_collection: str):
        self._client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        self._db = self._client[db_name]
        self.tags_collection = self._db[tags_collection]
        self.alarms_collection = self._db[alarms_collection]

    def ping(self) -> bool:
        try:
            self._client.admin.command("ping")
            return True
        except Exception:
            logger.exception("Mongo ping failed")
            return False

    def write_tags(self, tags: dict, timestamp: datetime):
        doc = {"timestamp": timestamp, **tags}
        try:
            self.tags_collection.insert_one(doc)
        except Exception:
            logger.exception("Failed to insert into %s", self.tags_collection.name)

    def write_alarms(self, alarms: dict, timestamp: datetime):
        doc = {"timestamp": timestamp, **alarms}
        try:
            self.alarms_collection.insert_one(doc)
        except Exception:
            logger.exception("Failed to insert into %s", self.alarms_collection.name)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
