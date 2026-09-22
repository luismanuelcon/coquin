const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown) => typeof v === "string" && v.trim().length > 0 && v.length <= 500;
const amount = (v: unknown) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0 && v <= 1e12;
const optionalText = (v: unknown) => v === undefined || (typeof v === "string" && v.length <= 500);
const optionalBool = (v: unknown) => v === undefined || typeof v === "boolean";
const date = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
function list(v: unknown, check: (row: Record<string, unknown>) => boolean): boolean {
  if (!Array.isArray(v) || v.length > 10000) return false;
  const ids = new Set<string>();
  return v.every(row => {
    if (!object(row) || !text(row.id) || ids.has(String(row.id))) return false;
    ids.add(String(row.id));
    return check(row);
  });
}
export function validateData(module: string, v: unknown): boolean {
  if (module === "calendar") return list(v, row => text(row.title) && text(row.time) && date(row.date) &&
    typeof row.meta === "string" && row.meta.length <= 500 && ["calendar", "finances", "market", "tasks", "home"].includes(String(row.tone)));
  if (module === "tasks") return list(v, row => text(row.title) && text(row.owner) && date(row.due) &&
    ["Pendiente", "En progreso", "Urgente", "Completada"].includes(String(row.status)));
  if (!object(v)) return false;
  if (module === "market") return amount(v.budget) && list(v.purchases, row =>
    text(row.detail) && date(row.date) && amount(row.amount) && Number(row.amount) > 0 &&
    ["Aseo", "Carnes", "Verduras", "Despensa", "Lacteos", "Hogar", "Otro"].includes(String(row.category)));
  if (module !== "finances" || !object(v.settings) || v.settings.currency !== "COP" ||
    !Number.isInteger(v.settings.cutoffDay) || Number(v.settings.cutoffDay) < 1 ||
    Number(v.settings.cutoffDay) > 31 || !text(v.activePeriodId)) return false;
  return list(v.periods, row => date(row.startDate) && date(row.endDate) &&
    String(row.startDate) <= String(row.endDate) &&
    list(row.incomes, item => text(item.concept) && amount(item.amount) && optionalText(item.note)) &&
    list(row.items, item => text(item.concept) && amount(item.amount) &&
      typeof item.fixed === "boolean" && ["paid", "pending"].includes(String(item.status)) && optionalText(item.note)) &&
    list(row.miscExpenses, item => text(item.concept) && amount(item.amount) && date(item.date) &&
      optionalText(item.note) && optionalText(item.category) && optionalBool(item.weekend) && optionalBool(item.owed))) &&
    (v.periods as Record<string, unknown>[]).some(period => period.id === v.activePeriodId);
}
