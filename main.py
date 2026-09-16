import logging
import time

import config
from db200_parser import parse_alarm_tags, parse_other_tags
from mongo_writer import MongoWriter, now_utc
from plc_client import PlcClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler(config.LOG_FILE, encoding="utf-8")],
)
logger = logging.getLogger("main")


def poll_once(plc: PlcClient, mongo: MongoWriter):
    data = plc.read_db(config.DB_NUMBER, config.DB_READ_SIZE)
    if data is None:
        logger.warning("Skipping cycle: could not read DB%s", config.DB_NUMBER)
        return

    timestamp = now_utc()
    other_tags = parse_other_tags(data)
    alarm_tags = parse_alarm_tags(data)

    mongo.write_tags(other_tags, timestamp)
    mongo.write_alarms(alarm_tags, timestamp)
    logger.info("Poll OK at %s", timestamp.isoformat())


def main():
    plc = PlcClient(config.PLC_IP, config.PLC_RACK, config.PLC_SLOT)
    mongo = MongoWriter(
        config.MONGO_URI, config.MONGO_DB_NAME, config.COLLECTION_TAGS, config.COLLECTION_ALARMS
    )

    logger.info(
        "Starting PLC reader: ip=%s rack=%s slot=%s db=%s interval=%ss",
        config.PLC_IP, config.PLC_RACK, config.PLC_SLOT, config.DB_NUMBER, config.POLL_INTERVAL_SECONDS,
    )

    while True:
        try:
            poll_once(plc, mongo)
        except Exception:
            logger.exception("Unexpected error during poll cycle")
        time.sleep(config.POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Stopped by user")
