"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBoardSchema, type Board, type CreateBoardInput, type PaginatedResult } from "@webbriks/shared-types";
import { apiRequest, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/hooks/use-fetch";

export default function BoardsPage() {
  const { user, logout } = useAuth();
  const { data, isLoading, error, refetch } = useFetch<PaginatedResult<Board>>("/boards");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBoardInput>({ resolver: zodResolver(createBoardSchema) });

  const onCreateBoard = async (values: CreateBoardInput) => {
    setServerError(null);
    try {
      await apiRequest<Board>("/boards", { method: "POST", data: values });
      reset();
      refetch();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your boards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as {user?.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Log out
        </button>
      </header>

      <form onSubmit={handleSubmit(onCreateBoard)} className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-1">
          <input
            type="text"
            placeholder="New board title"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-400"
            {...register("title")}
          />
          {errors.title && <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {isSubmitting ? "Creating..." : "Create board"}
        </button>
      </form>
      {serverError && <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>}

      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading boards...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {data && data.items.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">You don&apos;t have any boards yet.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.items.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="font-medium">{board.title}</p>
                  {board.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{board.description}</p>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {board.ownerId === user?.id ? "OWNER" : "SHARED"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
