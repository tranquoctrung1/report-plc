"""Parse DB200 (Data_Web) raw bytes into two dicts: other tags and alarm tags.

Offsets taken from DB_Web.pdf (S7-1200, DB200, Data_Web).
"""
from snap7.util import get_bool, get_real, get_dint


def parse_other_tags(data: bytes) -> dict:
    return {
        # Data_Triger (offset 0.0)
        "SS1": get_bool(data, 0, 0),
        "SS2": get_bool(data, 0, 1),
        "SS3": get_bool(data, 0, 2),
        "SS4": get_bool(data, 0, 3),
        "SS5": get_bool(data, 0, 4),
        "SS6": get_bool(data, 0, 5),
        "SS7": get_bool(data, 0, 6),
        "SS8": get_bool(data, 0, 7),
        # Data_Value (offset 2.0)
        "M02_Hz": get_real(data, 2),
        "M07_Hz": get_real(data, 6),
        "M5.1_Hz": get_real(data, 10),
        "M5.2_Hz": get_real(data, 14),
        "M5.3_Hz": get_real(data, 18),
        "M5.4_Hz": get_real(data, 22),
        "M5.5_Hz": get_real(data, 26),
        "M5.6_Hz": get_real(data, 30),
        "M5.7_Hz": get_real(data, 34),
        "ID_RCP": get_dint(data, 38),
        # CIP (offset 42.0)
        "Tig_CIP": get_bool(data, 42, 0),
        "Temp_PV": get_real(data, 44),
        "Time_PV": get_real(data, 48),
    }


def parse_alarm_tags(data: bytes) -> dict:
    # Alarm_List (offset 52.0), 19 bools across bytes 52-54
    return {
        "Alarm_M01": get_bool(data, 52, 0),
        "Alarm_M03": get_bool(data, 52, 1),
        "Alarm_M04": get_bool(data, 52, 2),
        "Alarm_M6.1": get_bool(data, 52, 3),
        "Alarm_M6.2": get_bool(data, 52, 4),
        "Alarm_M6.3": get_bool(data, 52, 5),
        "Alarm_M09": get_bool(data, 52, 6),
        "Alarm_M10": get_bool(data, 52, 7),
        "Alarm_M11": get_bool(data, 53, 0),
        "Alarm_M13": get_bool(data, 53, 1),
        "Alarm_M14": get_bool(data, 53, 2),
        "Alarm_M15": get_bool(data, 53, 3),
        "Alarm_M5.1": get_bool(data, 53, 4),
        "Alarm_M5.2": get_bool(data, 53, 5),
        "Alarm_M5.3": get_bool(data, 53, 6),
        "Alarm_M5.4": get_bool(data, 53, 7),
        "Alarm_M5.5": get_bool(data, 54, 0),
        "Alarm_M5.6": get_bool(data, 54, 1),
        "Alarm_M5.7": get_bool(data, 54, 2),
        "Alarm_M02": get_bool(data, 54, 3),
        "Alarm_M07": get_bool(data, 54, 4),
        "Alarm_M08": get_bool(data, 54, 5),
    }
