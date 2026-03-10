import client from "./client";
import type { Task, CategorySummary } from "../types/api";

export const dashboardApi = {
  tasksToday: (date?: string) =>
    client
      .get<Task[]>("/dashboard/tasks/today", { params: date ? { date } : undefined })
      .then((r) => r.data),

  summary: () =>
    client.get<CategorySummary[]>("/dashboard/summary").then((r) => r.data),
};
