"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { addBoardMemberSchema, type AddBoardMemberInput, type BoardMember, type BoardRole } from "@webbriks/shared-types";
import { apiRequest, ApiError } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";

export function ShareBoardDialog({
  boardId,
  members,
  onClose,
  onChanged,
}: {
  boardId: string;
  members: BoardMember[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddBoardMemberInput>({
    resolver: zodResolver(addBoardMemberSchema),
    defaultValues: { role: "VIEWER" },
  });

  const onAddMember = async (values: AddBoardMemberInput) => {
    try {
      await apiRequest(`/boards/${boardId}/members`, { method: "POST", data: values });
      reset({ email: "", role: "VIEWER" });
      onChanged();
    } catch (err) {
      setError("email", { message: err instanceof ApiError ? err.message : "Something went wrong." });
    }
  };

  const handleRoleChange = async (userId: string, role: BoardRole) => {
    await apiRequest(`/boards/${boardId}/members/${userId}`, { method: "PATCH", data: { role } });
    onChanged();
  };

  const handleRemove = async (userId: string, label: string) => {
    if (!window.confirm(`Remove ${label} from this board?`)) {
      return;
    }
    await apiRequest(`/boards/${boardId}/members/${userId}`, { method: "DELETE" });
    onChanged();
  };

  return (
    <Modal title="Share board" onClose={onClose}>
      <form onSubmit={handleSubmit(onAddMember)} className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <input
            type="email"
            placeholder="Email address"
            autoFocus
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-gray-400"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
        </div>
        <select
          className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-gray-400"
          {...register("role")}
        >
          <option value="VIEWER">Viewer</option>
          <option value="EDITOR">Editor</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>

      <ul className="mt-4 flex flex-col gap-2">
        {members.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Not shared with anyone yet.</p>
        )}
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700"
          >
            <div className="flex flex-col">
              <span>{member.user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.userId, e.target.value as BoardRole)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-gray-400"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemove(member.userId, member.user.email)}
                aria-label={`Remove ${member.user.email}`}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
