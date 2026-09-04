"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { BoardWithRole, PaginatedResult } from "@webbriks/shared-types";
import { apiRequest } from "@/lib/api-client";
import { useFetch } from "@/lib/hooks/use-fetch";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { BoardCreateModal } from "@/components/board/board-create-modal";
import { BoardEditModal } from "@/components/board/board-edit-modal";

export default function BoardsPage() {
  const { data, isLoading, error, refetch } = useFetch<PaginatedResult<BoardWithRole>>("/boards");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardWithRole | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDelete = async (board: BoardWithRole) => {
    if (!window.confirm(`Delete board "${board.title}"? This also deletes its columns and tasks.`)) {
      return;
    }
    await apiRequest(`/boards/${board.id}`, { method: "DELETE" });
    refetch();
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your boards</h1>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          <Plus size={14} /> New board
        </button>
      </header>

      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading boards...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {data && data.items.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You don&apos;t have any boards yet. Create one to get started.
        </p>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.items.map((board) => (
            <li
              key={board.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
            >
              <Link href={`/boards/${board.id}`} className="flex-1 min-w-0">
                <p className="truncate font-medium">{board.title}</p>
                {board.description && (
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{board.description}</p>
                )}
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{board.myRole}</span>
                {board.myRole !== "VIEWER" && (
                  <DropdownMenu
                    open={openMenuId === board.id}
                    onOpenChange={(open) => setOpenMenuId(open ? board.id : null)}
                    triggerLabel="Board actions"
                    triggerClassName="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    trigger={<MoreVertical size={16} />}
                  >
                    <DropdownMenuItem onClick={() => setEditingBoard(board)}>
                      <Pencil size={14} /> Edit
                    </DropdownMenuItem>
                    {board.myRole === "OWNER" && (
                      <DropdownMenuItem onClick={() => handleDelete(board)} danger>
                        <Trash2 size={14} /> Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isCreateModalOpen && (
        <BoardCreateModal onClose={() => setIsCreateModalOpen(false)} onCreated={refetch} />
      )}

      {editingBoard && (
        <BoardEditModal board={editingBoard} onClose={() => setEditingBoard(null)} onSaved={refetch} />
      )}
    </main>
  );
}
