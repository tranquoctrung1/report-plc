export const FREQ_TAGS = [
  { key: "M02_Hz", label: "Máy trộn (M02)" },
  { key: "M07_Hz", label: "Làm nguội (M07)" },
  { key: "M5.1_Hz", label: "Quạt làm nguội M5.1" },
  { key: "M5.2_Hz", label: "Quạt làm nguội M5.2" },
  { key: "M5.3_Hz", label: "Quạt làm nguội M5.3" },
  { key: "M5.4_Hz", label: "Quạt làm nguội M5.4" },
  { key: "M5.5_Hz", label: "Quạt làm nguội M5.5" },
  { key: "M5.6_Hz", label: "Quạt làm nguội M5.6" },
  { key: "M5.7_Hz", label: "Quạt làm nguội M5.7" },
];

export const TRIGGER_TAGS = [
  { key: "SS1", label: "Nạp liệu máy trộn" },
  { key: "SS2", label: "Van Pre1" },
  { key: "SS3", label: "Van Pre2" },
  { key: "SS4", label: "Van Pre3" },
  { key: "SS5", label: "Xả liệu máy trộn" },
  { key: "SS6", label: "Spare" },
  { key: "SS7", label: "SS7" },
  { key: "SS8", label: "SS8" },
];

export const CIP_TAGS = [
  { key: "Tig_CIP", label: "Trạng thái CIP" },
  { key: "Temp_PV", label: "Nhiệt độ bồn nóng" },
  { key: "Time_PV", label: "Thời gian CIP" },
  { key: "ID_RCP", label: "Số mẻ sản xuất" },
];

export const ALARM_TAGS = [
  "Alarm_M01", "Alarm_M03", "Alarm_M04", "Alarm_M6.1", "Alarm_M6.2", "Alarm_M6.3",
  "Alarm_M09", "Alarm_M10", "Alarm_M11", "Alarm_M13", "Alarm_M14", "Alarm_M15",
  "Alarm_M5.1", "Alarm_M5.2", "Alarm_M5.3", "Alarm_M5.4", "Alarm_M5.5", "Alarm_M5.6",
  "Alarm_M5.7", "Alarm_M02", "Alarm_M07", "Alarm_M08",
].map((key) => ({ key, label: key.replace("Alarm_", "") }));

export const ALL_TAGS = [...TRIGGER_TAGS, ...FREQ_TAGS, ...CIP_TAGS, ...ALARM_TAGS];

export const FREQ_KEYS = FREQ_TAGS.map((t) => t.key);
export const ALARM_KEYS = ALARM_TAGS.map((t) => t.key);
