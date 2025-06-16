"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();

  const toggleMutation = api.task.toggleComplete.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
      void utils.task.getStats.invalidate();
    },
  });

  const deleteMutation = api.task.delete.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
      void utils.task.getStats.invalidate();
      setIsDeleting(false);
    },
  });

  const handleToggleComplete = () => {
    toggleMutation.mutate({ id: task.id });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      deleteMutation.mutate({ id: task.id });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
        task.completed ? "opacity-75" : ""
      } ${isOverdue ? "border-red-300" : "border-gray-200"}`}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={toggleMutation.isPending}
          className={`mt-1 h-5 w-5 rounded border-2 transition-colors ${
            task.completed
              ? "border-green-500 bg-green-500"
              : "border-gray-300 hover:border-green-500"
          } ${toggleMutation.isPending ? "opacity-50" : ""}`}
        >
          {task.completed && (
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3
                className={`text-lg font-medium ${
                  task.completed ? "line-through text-gray-500" : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    task.completed ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {task.description}
                </p>
              )}
              
              {/* Meta information */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {/* Priority */}
                <span
                  className={`inline-flex rounded-full px-2 py-1 font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>

                {/* Category */}
                {task.category && (
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800">
                    {task.category}
                  </span>
                )}

                {/* Due date */}
                {task.dueDate && (
                  <span
                    className={`inline-flex rounded-full px-2 py-1 font-medium ${
                      isOverdue
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="ml-4 flex space-x-2">
              <Link
                href={`/tasks/${task.id}/edit`}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting || deleteMutation.isPending}
                className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}