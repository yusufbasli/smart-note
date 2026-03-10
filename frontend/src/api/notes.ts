import client from "./client";
import type { Note, NoteWithTasks } from "../types/api";

export interface ListNotesParams {
  skip?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const notesApi = {
  list: (params?: ListNotesParams) =>
    client.get<Note[]>("/notes", { params }).then((r) => r.data),

  get: (id: string) =>
    client.get<NoteWithTasks>(`/notes/${id}`).then((r) => r.data),

  create: (data: { title: string; content: string }) =>
    client.post<Note>("/notes", data).then((r) => r.data),

  update: (id: string, data: { title?: string; content?: string }) =>
    client.patch<Note>(`/notes/${id}`, data).then((r) => r.data),

  delete: (id: string) => client.delete(`/notes/${id}`),

  analyze: (id: string) =>
    client.post<NoteWithTasks>(`/notes/${id}/analyze`).then((r) => r.data),
};
