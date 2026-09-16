"""Read-only S7 client. Never writes to the PLC — read_area only."""
import logging

import snap7

logger = logging.getLogger(__name__)


class PlcClient:
    def __init__(self, ip: str, rack: int, slot: int):
        self.ip = ip
        self.rack = rack
        self.slot = slot
        self._client = snap7.client.Client()
        self._connected = False

    def connect(self) -> bool:
        try:
            self._client.connect(self.ip, self.rack, self.slot)
            self._connected = self._client.get_connected()
            if self._connected:
                logger.info("Connected to PLC %s (rack=%s, slot=%s)", self.ip, self.rack, self.slot)
            return self._connected
        except Exception:
            logger.exception("Failed to connect to PLC %s", self.ip)
            self._connected = False
            return False

    def disconnect(self):
        try:
            self._client.disconnect()
        except Exception:
            logger.exception("Error disconnecting from PLC")
        finally:
            self._connected = False

    def is_connected(self) -> bool:
        try:
            return self._client.get_connected()
        except Exception:
            return False

    def read_db(self, db_number: int, size: int) -> bytes | None:
        """Read `size` bytes from DB `db_number`. Read-only — no write_area is ever called."""
        if not self.is_connected():
            if not self.connect():
                return None
        try:
            return self._client.db_read(db_number, 0, size)
        except Exception:
            logger.exception("Failed to read DB%s from PLC %s", db_number, self.ip)
            self._connected = False
            return None
