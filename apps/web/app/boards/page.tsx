"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function BoardsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
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
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Log out
        </button>
      </header>

      <p className="text-sm text-gray-500 dark:text-gray-400">You don&apos;t have any boards yet.</p>
    </main>
  );
}
