from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

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
def tags_history(limit: int = Query(50, ge=1, le=1000)):
    return db.get_history(db.tags_collection, limit)


@app.get("/api/alarms/history")
def alarms_history(limit: int = Query(50, ge=1, le=1000)):
    return db.get_history(db.alarms_collection, limit)
