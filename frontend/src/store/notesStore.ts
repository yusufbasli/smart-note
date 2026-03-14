import { create } from "zustand";
import { notesApi } from "../api/notes";
import { tasksApi } from "../api/tasks";
import type { Note, NoteWithTasks, Task } from "../types/api";

interface NotesState {
  notes: Note[];
  currentNote: NoteWithTasks | null;
  isLoading: boolean;
  // Actions
  fetchNotes: (params?: { category?: string; search?: string }) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (title: string, content: string, ai_category?: string) => Promise<Note>;
  updateNote: (id: string, data: { title?: string; content?: string; ai_category?: string | null }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  analyzeNote: (id: string) => Promise<void>;
  toggleTask: (noteId: string, task: Task) => Promise<void>;
  addTask: (noteId: string, data: { task_text: string; due_date?: string; is_recurring?: boolean }) => Promise<void>;
  updateTask: (noteId: string, taskId: string, data: { task_text?: string; due_date?: string | null; is_recurring?: boolean }) => Promise<void>;
  deleteTask: (noteId: string, taskId: string) => Promise<void>;
  clearCurrentNote: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,

  fetchNotes: async (params) => {
    set({ isLoading: true });
    try {
      const notes = await notesApi.list(params);
      set({ notes });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNote: async (id) => {
    set({ isLoading: true });
    try {
      const note = await notesApi.get(id);
      set({ currentNote: note });
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (title, content, ai_category?) => {
    const note = await notesApi.create({ title, content, ...(ai_category ? { ai_category } : {}) });
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  updateNote: async (id, data) => {
    const updated = await notesApi.update(id, data);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
      currentNote: s.currentNote?.id === id ? { ...s.currentNote, ...updated } : s.currentNote,
    }));
  },

  deleteNote: async (id) => {
    await notesApi.delete(id);
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      currentNote: s.currentNote?.id === id ? null : s.currentNote,
    }));
  },

  analyzeNote: async (id) => {
    const updated = await notesApi.analyze(id);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
      currentNote: updated,
    }));
  },

  toggleTask: async (noteId, task) => {
    const updated = await tasksApi.update(noteId, task.id, {
      is_completed: !task.is_completed,
    });
    set((s) => {
      if (!s.currentNote) return {};
      return {
        currentNote: {
          ...s.currentNote,
          tasks: s.currentNote.tasks.map((t) => (t.id === task.id ? updated : t)),
        },
      };
    });
  },

  addTask: async (noteId, data) => {
    const created = await tasksApi.create(noteId, data);
    set((s) => {
      if (!s.currentNote || s.currentNote.id !== noteId) return {};
      return {
        currentNote: {
          ...s.currentNote,
          tasks: [...s.currentNote.tasks, created],
        },
      };
    });
  },

  updateTask: async (noteId, taskId, data) => {
    const updated = await tasksApi.update(noteId, taskId, data);
    set((s) => {
      if (!s.currentNote || s.currentNote.id !== noteId) return {};
      return {
        currentNote: {
          ...s.currentNote,
          tasks: s.currentNote.tasks.map((t) => (t.id === taskId ? updated : t)),
        },
      };
    });
  },

  deleteTask: async (noteId, taskId) => {
    await tasksApi.delete(noteId, taskId);
    set((s) => {
      if (!s.currentNote || s.currentNote.id !== noteId) return {};
      return {
        currentNote: {
          ...s.currentNote,
          tasks: s.currentNote.tasks.filter((t) => t.id !== taskId),
        },
      };
    });
  },

  clearCurrentNote: () => set({ currentNote: null }),
}));
