"use client";

import Link from "next/link";
import { FolderKanban, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/boards" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <FolderKanban size={20} />
          Webbriks Kanban
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">{user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
