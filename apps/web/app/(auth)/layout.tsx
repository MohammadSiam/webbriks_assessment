"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/boards");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
        <FolderKanban size={22} />
        Webbriks Kanban
      </div>
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {children}
      </div>
    </main>
  );
}
