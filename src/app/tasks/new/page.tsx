import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { TaskForm } from "../_components/task-form";

export default async function NewTaskPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new task to your list
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <TaskForm mode="create" />
        </div>
      </div>
    </div>
  );
}