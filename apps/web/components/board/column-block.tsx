"use client";

import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { ColumnWithTasks } from "@webbriks/shared-types";
import { apiRequest } from "@/lib/api-client";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TaskItem } from "./task-item";
import { TaskCreateModal } from "./task-create-modal";
import { ColumnEditModal } from "./column-edit-modal";

export function ColumnBlock({
  column,
  canEdit,
  onChanged,
}: {
  column: ColumnWithTasks;
  canEdit: boolean;
  onChanged: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeleteColumn = async () => {
    if (!window.confirm(`Delete column "${column.title}"? This also deletes its tasks.`)) {
      return;
    }
    await apiRequest(`/columns/${column.id}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">{column.title}</h2>
          {column.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{column.description}</p>
          )}
        </div>
        {canEdit && (
          <DropdownMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            triggerLabel="Column actions"
            triggerClassName="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            trigger={<MoreVertical size={16} />}
          >
            <DropdownMenuItem onClick={() => setIsAddTaskModalOpen(true)}>
              <Plus size={14} /> Add task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
              <Pencil size={14} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteColumn} danger>
              <Trash2 size={14} /> Delete
            </DropdownMenuItem>
          </DropdownMenu>
        )}
      </div>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <ul ref={provided.innerRef} {...provided.droppableProps} className="flex min-h-8 flex-col gap-2">
            {column.tasks.map((task, index) => (
              <TaskItem key={task.id} task={task} index={index} canEdit={canEdit} onChanged={onChanged} />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>

      {canEdit && (
        <button
          type="button"
          onClick={() => setIsAddTaskModalOpen(true)}
          className="flex items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Plus size={14} /> Add task
        </button>
      )}

      {isAddTaskModalOpen && (
        <TaskCreateModal
          columnId={column.id}
          onClose={() => setIsAddTaskModalOpen(false)}
          onCreated={onChanged}
        />
      )}

      {isEditModalOpen && (
        <ColumnEditModal column={column} onClose={() => setIsEditModalOpen(false)} onSaved={onChanged} />
      )}
    </div>
  );
}
