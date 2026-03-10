import client from "./client";
import type { Task } from "../types/api";

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
