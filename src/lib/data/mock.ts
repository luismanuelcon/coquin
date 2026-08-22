import type {
  FinanceItem,
  FinanceBudgetState,
  HouseholdEvent,
  MarketBudget,
  MarketPurchase,
  OverviewMetric,
  ProjectTask,
} from "../types";

export const overviewMetrics: OverviewMetric[] = [
  { label: "Citas hoy", value: "3", detail: "Agenda inmediata", tone: "calendar" },
  { label: "Pagos pendientes", value: "$420k", detail: "Administracion", tone: "finances" },
  { label: "Mercado usado", value: "63%", detail: "$440k disponibles", tone: "market" },
  { label: "Tareas urgentes", value: "1", detail: "Para hoy", tone: "tasks" },
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
    title: "Actualizar presupuesto de mercado",
    meta: "$760.000 usados de $1.200.000",
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

export const financeBudgetState: FinanceBudgetState = {
  settings: {
    cutoffDay: 20,
    currency: "COP",
  },
  activePeriodId: "period-2026-08-20",
  periods: [
    {
      id: "period-2026-07-20",
      startDate: "2026-07-20",
      endDate: "2026-08-19",
      incomes: [
        { id: "income-previous-1", concept: "Salario", amount: 6400000 },
        { id: "income-previous-2", concept: "Ingreso adicional", amount: 450000 },
      ],
      items: [
        { id: "item-previous-1", concept: "Administracion", amount: 420000, fixed: true, status: "paid" },
        { id: "item-previous-2", concept: "Servicios publicos", amount: 286500, fixed: true, status: "paid" },
        { id: "item-previous-3", concept: "Seguro hogar", amount: 180000, fixed: true, status: "pending" },
      ],
      miscExpenses: [
        { id: "misc-previous-1", date: "2026-08-02", concept: "Almuerzo", amount: 32000, category: "Comida" },
      ],
    },
    {
      id: "period-2026-08-20",
      startDate: "2026-08-20",
      endDate: "2026-09-19",
      incomes: [
        { id: "income-current-1", concept: "Salario", amount: 6200000 },
        { id: "income-current-2", concept: "Ingreso adicional", amount: 350000 },
      ],
      items: [
        { id: "item-current-1", concept: "Administracion", amount: 420000, fixed: true, status: "pending" },
        { id: "item-current-2", concept: "Servicios publicos", amount: 286500, fixed: true, status: "paid" },
        { id: "item-current-3", concept: "Impuesto predial", amount: 1240000, fixed: false, status: "pending" },
      ],
      miscExpenses: [
        { id: "misc-current-1", date: "2026-08-21", concept: "Cafe", amount: 8000, category: "Comida" },
        { id: "misc-current-2", date: "2026-08-22", concept: "Parqueadero", amount: 12000, category: "Transporte" },
      ],
    },
  ],
};

export const marketBudget: MarketBudget = {
  month: "Agosto",
  budget: 1200000,
  currency: "COP",
};

export const marketPurchases: MarketPurchase[] = [
  {
    id: "purchase-1",
    date: "2026-08-02",
    detail: "Compra de carnes para la semana",
    category: "Carnes",
    amount: 185000,
  },
  {
    id: "purchase-2",
    date: "2026-08-05",
    detail: "Verduras y frutas",
    category: "Verduras",
    amount: 92000,
  },
  {
    id: "purchase-3",
    date: "2026-08-09",
    detail: "Productos de aseo",
    category: "Aseo",
    amount: 134000,
  },
  {
    id: "purchase-4",
    date: "2026-08-14",
    detail: "Despensa mensual",
    category: "Despensa",
    amount: 248000,
  },
  {
    id: "purchase-5",
    date: "2026-08-18",
    detail: "Leche, queso y yogures",
    category: "Lacteos",
    amount: 101000,
  },
];

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
