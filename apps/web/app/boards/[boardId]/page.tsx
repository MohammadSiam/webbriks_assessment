"use client";

import { use } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnSchema, type BoardAggregate, type CreateColumnInput } from "@webbriks/shared-types";
import { apiRequest, ApiError } from "@/lib/api-client";
import { useFetch } from "@/lib/hooks/use-fetch";
import { ColumnBlock } from "@/components/board/column-block";

export default function BoardDetailPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const { data: board, isLoading, error, refetch } = useFetch<BoardAggregate>(`/boards/${boardId}`);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateColumnInput>({ resolver: zodResolver(createColumnSchema) });

  const canEdit = board?.myRole === "OWNER" || board?.myRole === "EDITOR";

  const onAddColumn = async (values: CreateColumnInput) => {
    try {
      await apiRequest(`/boards/${boardId}/columns`, { method: "POST", data: values });
      reset();
      refetch();
    } catch (err) {
      setError("title", { message: err instanceof ApiError ? err.message : "Something went wrong." });
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

      <div className="mx-auto flex w-full max-w-6xl gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <ColumnBlock key={column.id} column={column} canEdit={canEdit} onChanged={refetch} />
        ))}

        {canEdit && (
          <form
            onSubmit={handleSubmit(onAddColumn)}
            className="flex w-72 shrink-0 flex-col gap-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-700"
          >
            <input
              type="text"
              placeholder="New column title"
              className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-400"
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
            >
              {isSubmitting ? "Adding..." : "Add column"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
