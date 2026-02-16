import express from "express";
import { Task } from "../model/model.task"
import { z } from "zod";
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware"
import { redisClient } from "../config/redis"

dotenv.config();

const taskRouter = express.Router();
taskRouter.use(express.json());

// Zod schemas for validation
const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    status: z.enum(["pending", "completed"]).optional(),
    dueDate: z.string().optional(), // ISO date string
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(["pending", "completed"]).optional(),
    dueDate: z.string().optional(),
});

// Create a new task
taskRouter.post('/', authMiddleware, async function (req, res) {
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: validation.error.issues
        });
    }

    const { title, description, status, dueDate } = validation.data;

    try {
        const newTask = await Task.create({
            title,
            description,
            status: status || "pending",
            dueDate: dueDate ? new Date(dueDate) : undefined,
            owner: req.userId  // ✅ User ID from authMiddleware
        });

        // Invalidate cache
        if (req.userId) {
            await redisClient.del(`tasks:${req.userId}`);
        }

        return res.status(201).json({
            message: "Task created successfully",
            task: newTask
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create task",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// List tasks for the logged-in user
taskRouter.get('/', authMiddleware, async function (req, res) {
    try {
        const cacheKey = `tasks:${req.userId}`;

        // Check Redis cache
        const cachedTasks = await redisClient.get(cacheKey);
        if (cachedTasks) {
            return res.status(200).json({
                message: "Successfully fetched tasks (from cache)",
                tasks: JSON.parse(cachedTasks)
            });
        }

        // Get ALL tasks owned by the authenticated user
        const tasks = await Task.find({ owner: req.userId });

        // Save to Redis (expire in 1 hour)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));

        return res.status(200).json({
            message: "Successfully fetched tasks",
            tasks: tasks  // Returns array of tasks
        });
    }
    catch (err) {
        console.error("Failed to fetch tasks", err);
        return res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
})



//update a task
taskRouter.put('/:id', authMiddleware, async function (req, res) {
    const updatedData = updateTaskSchema.safeParse(req.body);

    // Validate input first
    if (!updatedData.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: updatedData.error.issues
        });
    }

    try {
        // Update task only if it belongs to the authenticated user
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.userId },  // Find by ID AND owner
            updatedData.data,
            { new: true }  // Return the updated document
        );

        // Invalidate cache
        if (req.userId) {
            await redisClient.del(`tasks:${req.userId}`);
        }

        if (!task) {
            return res.status(404).json({
                message: "Task not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Task updated successfully",
            task: task
        });
    }
    catch (err) {
        console.error("Failed to update task", err);
        return res.status(500).json({
            message: "Failed to update task"
        });
    }
})

//delete a task
taskRouter.delete('/:id', authMiddleware, async function (req, res) {
    try {
        // Delete task only if it belongs to the authenticated user
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.userId  // Ensure user owns the task
        });

        // Invalidate cache
        if (req.userId) {
            await redisClient.del(`tasks:${req.userId}`);
        }

        if (!task) {
            return res.status(404).json({
                message: "Task not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully",
            task: task  // Return the deleted task
        });
    }
    catch (err) {
        console.error("Failed to delete task", err);
        return res.status(500).json({
            message: "Failed to delete task"
        });
    }
})

export default taskRouter;