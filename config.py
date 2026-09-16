import os

from dotenv import load_dotenv

load_dotenv()

USE_SIMULATOR = os.getenv("USE_SIMULATOR", "false").strip().lower() in ("1", "true", "yes")

PLC_IP = os.getenv("PLC_IP", "192.168.111.112")
PLC_RACK = int(os.getenv("PLC_RACK", "0"))
PLC_SLOT = int(os.getenv("PLC_SLOT", "1"))
DB_NUMBER = int(os.getenv("DB_NUMBER", "200"))
DB_READ_SIZE = 56  # covers all tags up to offset 54.7 (Alarm_M08), rounded to even

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "report-plc")
COLLECTION_TAGS = "tags_data"
COLLECTION_ALARMS = "tags_alarm"

POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "60"))

LOG_FILE = os.getenv("LOG_FILE", "plc_reader.log")
