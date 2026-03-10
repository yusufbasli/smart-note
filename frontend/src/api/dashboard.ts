import client from "./client";
import type { Task, CategorySummary } from "../types/api";

export const dashboardApi = {
  tasksToday: (date?: string) =>
    client
      .get<Task[]>("/dashboard/tasks/today", { params: date ? { date } : undefined })
      .then((r) => r.data),

  // Backend returns {category: count} dict — convert to CategorySummary[]
  summary: () =>
    client.get<Record<string, number>>("/dashboard/summary").then((r) =>
      Object.entries(r.data).map(([category, count]) => ({ category, count }))
    ),
};
