import type { Board, BoardAccessLevel } from "./board.js";
import type { Column } from "./column.js";
import type { Task } from "./task.js";
import type { BoardMember } from "./board-member.js";

export type ColumnWithTasks = Column & {
  tasks: Task[];
};

export type BoardAggregate = Board & {
  myRole: BoardAccessLevel;
  columns: ColumnWithTasks[];
  members: BoardMember[];
};
