from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

import config
from api import db

app = FastAPI(title="report-plc API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # local dev only, no auth yet
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/tags/latest")
def tags_latest():
    return db.get_latest(db.tags_collection) or {}


@app.get("/api/alarms/latest")
def alarms_latest():
    return db.get_latest(db.alarms_collection) or {}


@app.get("/api/tags/history")
def tags_history(
    limit: int = Query(50, ge=1, le=1000),
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
):
    return db.get_history(db.tags_collection, limit, start, end)


@app.get("/api/alarms/history")
def alarms_history(
    limit: int = Query(50, ge=1, le=1000),
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
):
    return db.get_history(db.alarms_collection, limit, start, end)


@app.get("/api/config")
def get_config():
    return {
        "plc_ip": config.PLC_IP,
        "plc_rack": config.PLC_RACK,
        "plc_slot": config.PLC_SLOT,
        "db_number": config.DB_NUMBER,
        "poll_interval_seconds": config.POLL_INTERVAL_SECONDS,
        "mongo_db_name": config.MONGO_DB_NAME,
        "collections": {"tags": config.COLLECTION_TAGS, "alarms": config.COLLECTION_ALARMS},
    }
