const COLOMBIA_TZ = "America/Bogota";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: COLOMBIA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const weekdayIndex: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export type ColombiaDateParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
};

export function getColombiaDateParts(base: Date = new Date()): ColombiaDateParts {
  const parts = partsFormatter.formatToParts(base);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayIndex[get("weekday")] ?? 1,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getColombiaTodayIso(base: Date = new Date()): string {
  const { year, month, day } = getColombiaDateParts(base);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export type WeekDay = {
  day: string;
  date: number;
  iso: string;
  active: boolean;
};

const workweekLabels = ["Lun", "Mar", "Mie", "Jue", "Vie"];

export function getColombiaWorkweek(base: Date = new Date()): WeekDay[] {
  const today = getColombiaDateParts(base);
  const daysFromMonday = today.weekday - 1;
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const mondayUtc = todayUtc - daysFromMonday * 86400000;

  return workweekLabels.map((day, index) => {
    const cellUtc = mondayUtc + index * 86400000;
    const cell = new Date(cellUtc);
    const cellDay = cell.getUTCDate();
    const cellIso = `${cell.getUTCFullYear()}-${pad(cell.getUTCMonth() + 1)}-${pad(cellDay)}`;
    return {
      day,
      date: cellDay,
      iso: cellIso,
      active: cellIso === getColombiaTodayIso(base),
    };
  });
}
