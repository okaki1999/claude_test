import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Zod schema for task validation
const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  category: z.string().max(50).optional(),
  dueDate: z.date().optional(),
});

const taskUpdateSchema = taskCreateSchema.partial().extend({
  completed: z.boolean().optional(),
});

export const taskRouter = createTRPCRouter({
  // Get all tasks for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: [
        { completed: "asc" }, // Show incomplete tasks first
        { createdAt: "desc" }, // Then order by creation date
      ],
    });
  }),

  // Get a single task by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    }),

  // Create a new task
  create: protectedProcedure
    .input(taskCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update an existing task
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: taskUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the task belongs to the current user
      const existingTask = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingTask) {
        throw new Error("Task not found");
      }

      return await ctx.db.task.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  // Toggle task completion status
  toggleComplete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return await ctx.db.task.update({
        where: { id: input.id },
        data: { completed: !task.completed },
      });
    }),

  // Delete a task
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the task belongs to the current user
      const existingTask = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingTask) {
        throw new Error("Task not found");
      }

      return await ctx.db.task.delete({
        where: { id: input.id },
      });
    }),

  // Get tasks statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        completed: true,
        priority: true,
        dueDate: true,
      },
    });

    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    
    const overdue = tasks.filter(
      (task) => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < new Date()
    ).length;

    const priorityBreakdown = {
      HIGH: tasks.filter((task) => task.priority === "HIGH").length,
      MEDIUM: tasks.filter((task) => task.priority === "MEDIUM").length,
      LOW: tasks.filter((task) => task.priority === "LOW").length,
    };

    return {
      total,
      completed,
      pending,
      overdue,
      priorityBreakdown,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }),
});