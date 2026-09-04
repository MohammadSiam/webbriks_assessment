"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, type CreateTaskInput } from "@webbriks/shared-types";
import { apiRequest, ApiError } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";

export function TaskCreateModal({
  columnId,
  onClose,
  onCreated,
}: {
  columnId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({ resolver: zodResolver(createTaskSchema) });

  const onSubmit = async (values: CreateTaskInput) => {
    try {
      await apiRequest(`/columns/${columnId}/tasks`, { method: "POST", data: values });
      onCreated();
      onClose();
    } catch (err) {
      setError("title", { message: err instanceof ApiError ? err.message : "Something went wrong." });
    }
  };

  return (
    <Modal title="Add task" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="new-task-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="new-task-title"
            autoFocus
            className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-400"
            {...register("title")}
          />
          {errors.title && <p className="text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="new-task-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="new-task-description"
            rows={3}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-400"
            {...register("description")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {isSubmitting ? "Adding..." : "Add task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
