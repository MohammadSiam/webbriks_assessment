"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@webbriks/shared-types";
import { apiRequest } from "@/lib/api-client";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TaskEditModal } from "./task-edit-modal";

export function TaskItem({
  task,
  index,
  canEdit,
  onChanged,
}: {
  task: Task;
  index: number;
  canEdit: boolean;
  onChanged: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete task "${task.title}"?`)) {
      return;
    }
    await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ opacity: snapshot.isDragging ? 0.6 : 1, ...provided.draggableProps.style }}
            className="group flex cursor-grab items-start gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-950"
          >
            <div className="flex-1">
              <p>{task.title}</p>
              {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
              )}
            </div>
            {canEdit && (
              <DropdownMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                triggerLabel="Task actions"
                triggerClassName={`text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 ${
                  menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                }`}
                trigger={<MoreVertical size={16} />}
              >
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Pencil size={14} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} danger>
                  <Trash2 size={14} /> Delete
                </DropdownMenuItem>
              </DropdownMenu>
            )}
          </li>
        )}
      </Draggable>

      {isEditModalOpen && (
        <TaskEditModal task={task} onClose={() => setIsEditModalOpen(false)} onSaved={onChanged} />
      )}
    </>
  );
}
