import type {
  FinanceItem,
  HouseholdEvent,
  MarketBudget,
  MarketItem,
  OverviewMetric,
  ProjectTask,
} from "../types";

export const overviewMetrics: OverviewMetric[] = [
  { label: "Citas hoy", value: "3", tone: "calendar" },
  { label: "Pagos pendientes", value: "$420", tone: "finances" },
  { label: "Lista mercado", value: "18", tone: "market" },
  { label: "Tareas urgentes", value: "5", tone: "tasks" },
];

export const todayEvents: HouseholdEvent[] = [
  {
    id: "event-1",
    title: "Revision odontologica de Sofia",
    meta: "Clinica Norte",
    time: "09:30",
    tone: "calendar",
  },
  {
    id: "event-2",
    title: "Pago administracion",
    meta: "Vence hoy",
    time: "12:00",
    tone: "finances",
  },
  {
    id: "event-3",
    title: "Comprar frutas y limpieza",
    meta: "Mercado semanal",
    time: "18:00",
    tone: "market",
  },
];

export const calendarEvents: HouseholdEvent[] = [
  ...todayEvents,
  {
    id: "event-4",
    title: "Mantenimiento aire acondicionado",
    meta: "Tecnico confirmado",
    time: "Manana 10:00",
    tone: "tasks",
  },
  {
    id: "event-5",
    title: "Entrega proyecto escolar",
    meta: "Materiales listos",
    time: "Vie 07:00",
    tone: "calendar",
  },
];

export const financeItems: FinanceItem[] = [
  {
    id: "fin-1",
    title: "Administracion",
    amount: "$420.000",
    status: "Pendiente",
    due: "Hoy",
  },
  {
    id: "fin-2",
    title: "Servicios publicos",
    amount: "$286.500",
    status: "Programado",
    due: "22 Ago",
  },
  {
    id: "fin-3",
    title: "Impuesto predial",
    amount: "$1.240.000",
    status: "Recordar",
    due: "30 Ago",
  },
];

export const marketItems: MarketItem[] = [
  { id: "m-1", name: "Huevos", category: "Despensa", quantity: "30 und" },
  { id: "m-2", name: "Leche deslactosada", category: "Lacteos", quantity: "4 bolsas" },
  { id: "m-3", name: "Detergente", category: "Aseo", quantity: "2 L" },
  { id: "m-4", name: "Manzanas", category: "Frutas", quantity: "1 kg", checked: true },
  { id: "m-5", name: "Papel higienico", category: "Hogar", quantity: "12 rollos" },
];

export const marketBudget: MarketBudget = {
  month: "Agosto",
  budget: 1200000,
  spent: 760000,
  planned: 310000,
  currency: "COP",
};

export const projectTasks: ProjectTask[] = [
  {
    id: "task-1",
    title: "Cambiar filtro de agua",
    owner: "Luis",
    status: "Urgente",
    due: "Hoy",
  },
  {
    id: "task-2",
    title: "Organizar documentos de impuestos",
    owner: "Casa",
    status: "En progreso",
    due: "Esta semana",
  },
  {
    id: "task-3",
    title: "Cotizar pintura habitacion",
    owner: "Ana",
    status: "Pendiente",
    due: "Sabado",
  },
];
