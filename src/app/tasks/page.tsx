import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { TaskList } from "./_components/task-list";
import { TaskStats } from "./_components/task-stats";

export default async function TasksPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // Prefetch task data
  void api.task.getAll.prefetch();
  void api.task.getStats.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your tasks and stay organized
                </p>
              </div>
              <div className="mt-4 flex md:ml-4 md:mt-0">
                <Link
                  href="/tasks/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  New Task
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <TaskStats />
          </div>

          {/* Tasks */}
          <div className="space-y-6">
            <TaskList />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}