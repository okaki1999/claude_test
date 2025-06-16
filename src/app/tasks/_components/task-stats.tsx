"use client";

import { api } from "~/trpc/react";

export function TaskStats() {
  const { data: stats, isLoading } = api.task.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      name: "Total Tasks",
      value: stats.total,
      color: "bg-blue-500",
    },
    {
      name: "Completed",
      value: stats.completed,
      color: "bg-green-500",
    },
    {
      name: "Pending",
      value: stats.pending,
      color: "bg-yellow-500",
    },
    {
      name: "Overdue",
      value: stats.overdue,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.color}`}>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3-12h.375c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125V6.375c0-.621.504-1.125 1.125-1.125Z"
                  />
                </svg>
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      {stats.total > 0 && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Completion Rate</h3>
              <p className="text-sm text-gray-500">Overall task completion progress</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-300 ease-in-out"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
          
          {/* Priority Breakdown */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Priority Distribution</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-red-600">{stats.priorityBreakdown.HIGH}</p>
                <p className="text-xs text-gray-500">High</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-yellow-600">{stats.priorityBreakdown.MEDIUM}</p>
                <p className="text-xs text-gray-500">Medium</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">{stats.priorityBreakdown.LOW}</p>
                <p className="text-xs text-gray-500">Low</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}