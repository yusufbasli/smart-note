import client from "./client";
import type { Task } from "../types/api";

export type TaskPeriod = "today" | "tomorrow" | "week" | "all";

export const tasksApi = {
  list: (noteId: string) =>
    client.get<Task[]>(`/notes/${noteId}/tasks`).then((r) => r.data),

  create: (noteId: string, data: { task_text: string; due_date?: string }) =>
    client.post<Task>(`/notes/${noteId}/tasks`, data).then((r) => r.data),

  update: (
    noteId: string,
    taskId: string,
    data: { task_text?: string; is_completed?: boolean; due_date?: string | null }
  ) =>
    client
      .patch<Task>(`/notes/${noteId}/tasks/${taskId}`, data)
      .then((r) => r.data),

  delete: (noteId: string, taskId: string) =>
    client.delete(`/notes/${noteId}/tasks/${taskId}`),
};

// Dashboard / standalone tasks — not linked to a specific note
export const dashboardTasksApi = {
  list: (period: TaskPeriod, include_completed = true) =>
    client
      .get<Task[]>("/tasks/", { params: { period, include_completed } })
      .then((r) => r.data),

  create: (task_text: string, due_date?: string, is_recurring = false) =>
    client.post<Task>("/tasks/", { task_text, due_date, is_recurring }).then((r) => r.data),

  update: (
    id: string,
    data: { task_text?: string; is_completed?: boolean; due_date?: string | null }
  ) => client.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),

  remove: (id: string) => client.delete(`/tasks/${id}`),
};
