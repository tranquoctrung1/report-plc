"""Fake data generator: mimics DB200 shape, writes to Mongo every POLL_INTERVAL_SECONDS.
Use when real PLC is not reachable, so the API/client can be developed against real-shaped data.
"""
import logging
import random
import time

import config
from mongo_writer import MongoWriter, now_utc

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("simulator.log", encoding="utf-8")],
)
logger = logging.getLogger("simulator")

OTHER_TAG_NAMES = [
    "SS1", "SS2", "SS3", "SS4", "SS5", "SS6", "SS7", "SS8",
]
HZ_TAG_NAMES = [
    "M02_Hz", "M07_Hz", "M5.1_Hz", "M5.2_Hz", "M5.3_Hz",
    "M5.4_Hz", "M5.5_Hz", "M5.6_Hz", "M5.7_Hz",
]
ALARM_TAG_NAMES = [
    "Alarm_M01", "Alarm_M03", "Alarm_M04", "Alarm_M6.1", "Alarm_M6.2", "Alarm_M6.3",
    "Alarm_M09", "Alarm_M10", "Alarm_M11", "Alarm_M13", "Alarm_M14", "Alarm_M15",
    "Alarm_M5.1", "Alarm_M5.2", "Alarm_M5.3", "Alarm_M5.4", "Alarm_M5.5", "Alarm_M5.6",
    "Alarm_M5.7", "Alarm_M02", "Alarm_M07", "Alarm_M08",
]


def fake_other_tags() -> dict:
    tags = {name: random.random() < 0.5 for name in OTHER_TAG_NAMES}
    for name in HZ_TAG_NAMES:
        tags[name] = round(random.uniform(0.0, 50.0), 2)
    tags["ID_RCP"] = random.randint(1, 9999)
    tags["Tig_CIP"] = random.random() < 0.2
    tags["Temp_PV"] = round(random.uniform(20.0, 90.0), 2)
    tags["Time_PV"] = round(random.uniform(0.0, 600.0), 2)
    return tags


def fake_alarm_tags() -> dict:
    # most alarms off, occasionally one fires, to look realistic
    return {name: random.random() < 0.05 for name in ALARM_TAG_NAMES}


def main():
    mongo = MongoWriter(
        config.MONGO_URI, config.MONGO_DB_NAME, config.COLLECTION_TAGS, config.COLLECTION_ALARMS
    )
    logger.info("Starting simulator: interval=%ss db=%s", config.POLL_INTERVAL_SECONDS, config.MONGO_DB_NAME)

    while True:
        try:
            timestamp = now_utc()
            mongo.write_tags(fake_other_tags(), timestamp)
            mongo.write_alarms(fake_alarm_tags(), timestamp)
            logger.info("Simulated poll OK at %s", timestamp.isoformat())
        except Exception:
            logger.exception("Unexpected error during simulated poll")
        time.sleep(config.POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Stopped by user")
