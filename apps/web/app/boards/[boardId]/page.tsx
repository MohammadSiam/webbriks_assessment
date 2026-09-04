"use client";

import { use, useState } from "react";
import Link from "next/link";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import type { BoardAggregate } from "@webbriks/shared-types";
import { apiRequest, ApiError } from "@/lib/api-client";
import { useFetch } from "@/lib/hooks/use-fetch";
import { ColumnBlock } from "@/components/board/column-block";
import { ColumnCreateModal } from "@/components/board/column-create-modal";

export default function BoardDetailPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const { data: board, isLoading, error, refetch, setData } = useFetch<BoardAggregate>(`/boards/${boardId}`);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  const canEdit = board?.myRole === "OWNER" || board?.myRole === "EDITOR";

  const handleDragEnd = async (result: DropResult) => {
    setDragError(null);
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const snapshot = board;
    if (!snapshot) {
      return;
    }

    setData((prev) => {
      if (!prev) {
        return prev;
      }
      const sourceColIndex = prev.columns.findIndex((col) => col.id === source.droppableId);
      const destColIndex = prev.columns.findIndex((col) => col.id === destination.droppableId);
      if (sourceColIndex === -1 || destColIndex === -1) {
        return prev;
      }

      const columns = [...prev.columns];
      const sourceCol = columns[sourceColIndex];
      const sourceTasks = [...sourceCol.tasks];
      const [movedTask] = sourceTasks.splice(source.index, 1);

      if (sourceColIndex === destColIndex) {
        sourceTasks.splice(destination.index, 0, movedTask);
        columns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
      } else {
        columns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
        const destCol = columns[destColIndex];
        const destTasks = [...destCol.tasks];
        destTasks.splice(destination.index, 0, { ...movedTask, columnId: destCol.id });
        columns[destColIndex] = { ...destCol, tasks: destTasks };
      }

      return { ...prev, columns };
    });

    try {
      await apiRequest(`/tasks/${draggableId}/move`, {
        method: "PATCH",
        data: { targetColumnId: destination.droppableId, targetIndex: destination.index },
      });
    } catch (err) {
      setData(snapshot);
      setDragError(err instanceof ApiError ? err.message : "Could not move the task. Please try again.");
    }
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-gray-500 dark:text-gray-400">Loading board...</p>;
  }

  if (error || !board) {
    return <p className="p-8 text-sm text-red-600 dark:text-red-400">{error ?? "Board not found."}</p>;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div>
          <Link href="/boards" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            &larr; Back to boards
          </Link>
          <h1 className="text-xl font-semibold">{board.title}</h1>
        </div>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{board.myRole}</span>
      </header>

      {dragError && (
        <p className="mx-auto w-full max-w-6xl rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {dragError}
        </p>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="mx-auto flex w-full max-w-6xl gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <ColumnBlock key={column.id} column={column} canEdit={canEdit} onChanged={refetch} />
          ))}

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsAddColumnModalOpen(true)}
              className="flex h-fit w-72 shrink-0 items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 p-3 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
            >
              <Plus size={14} /> Add column
            </button>
          )}
        </div>
      </DragDropContext>

      {isAddColumnModalOpen && (
        <ColumnCreateModal
          boardId={boardId}
          onClose={() => setIsAddColumnModalOpen(false)}
          onCreated={refetch}
        />
      )}
    </main>
  );
}
