"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { ColumnWithTasks } from "@webbriks/shared-types";
import { apiRequest, ApiError } from "@/lib/api-client";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TaskItem } from "./task-item";
import { TaskCreateModal } from "./task-create-modal";

export function ColumnBlock({
  column,
  canEdit,
  onChanged,
}: {
  column: ColumnWithTasks;
  canEdit: boolean;
  onChanged: () => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const handleSaveTitle = async () => {
    setTitleError(null);
    try {
      await apiRequest(`/columns/${column.id}`, { method: "PATCH", data: { title } });
      setIsEditingTitle(false);
      onChanged();
    } catch (err) {
      setTitleError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  const handleDeleteColumn = async () => {
    if (!window.confirm(`Delete column "${column.title}"? This also deletes its tasks.`)) {
      return;
    }
    await apiRequest(`/columns/${column.id}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
      {isEditingTitle ? (
        <div className="flex flex-col gap-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm font-medium text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-400"
          />
          {titleError && <p className="text-xs text-red-600 dark:text-red-400">{titleError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveTitle}
              aria-label="Save column title"
              className="text-gray-900 dark:text-gray-100"
            >
              <Save size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingTitle(false);
                setTitle(column.title);
              }}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{column.title}</h2>
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
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Pencil size={14} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteColumn} danger>
                <Trash2 size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenu>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {column.tasks.map((task) => (
          <TaskItem key={task.id} task={task} canEdit={canEdit} onChanged={onChanged} />
        ))}
      </ul>

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
    </div>
  );
}
