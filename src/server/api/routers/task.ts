import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Priority } from "@prisma/client";

// Zod schema for task validation
const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
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
        userId: ctx.session.user.id!,
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
          userId: ctx.session.user.id!,
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
          title: input.title,
          description: input.description,
          priority: input.priority,
          category: input.category,
          dueDate: input.dueDate,
          userId: ctx.session.user.id!,
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
          userId: ctx.session.user.id!,
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
          userId: ctx.session.user.id!,
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
          userId: ctx.session.user.id!,
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
        userId: ctx.session.user.id!,
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
      HIGH: tasks.filter((task) => task.priority === Priority.HIGH).length,
      MEDIUM: tasks.filter((task) => task.priority === Priority.MEDIUM).length,
      LOW: tasks.filter((task) => task.priority === Priority.LOW).length,
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