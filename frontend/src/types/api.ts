// ─── Shared API types (mirrors backend Pydantic schemas) ─────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Task {
  id: string;
  note_id: string;
  task_text: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  ai_category: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteWithTasks extends Note {
  tasks: Task[];
}

export interface DashboardTask extends Task {
  note_title?: string;
}

export interface CategorySummary {
  category: string | null;
  count: number;
}
