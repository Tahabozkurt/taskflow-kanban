export type Board = {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
};

export type KanbanColumn = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
};

export type KanbanCard = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};
