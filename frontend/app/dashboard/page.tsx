'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api, { endpoints } from '@/config/api';
import { Task } from '@/types';

export default function Dashboard() {
    const { isAuthenticated, loading, logout, user } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    // Create Task State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated) {
            fetchTasks();
        }
    }, [isAuthenticated, loading, router]);

    const fetchTasks = async () => {
        try {
            const res = await api.get(endpoints.tasks.list);
            setTasks(res.data.tasks);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError('');

        try {
            const res = await api.post(endpoints.tasks.create, {
                title,
                description,
                status: 'pending'
            });
            // Add new task to list
            setTasks([res.data.task, ...tasks]);
            // Reset form
            setTitle('');
            setDescription('');
        } catch (error: any) {
            setCreateError(error.response?.data?.message || 'Failed to create task');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(endpoints.tasks.delete(id));
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error("Failed to delete task", error);
            alert("Failed to delete task");
        }
    };

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        // Optimistic update
        setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));

        try {
            await api.put(endpoints.tasks.update(id), { status: newStatus });
        } catch (error) {
            // Revert on error
            console.error("Failed to update status", error);
            setTasks(tasks.map(t => t._id === id ? { ...t, status: currentStatus as 'pending' | 'completed' } : t));
            alert("Failed to update status");
        }
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
            {/* Navbar */}
            <nav className="bg-white shadow dark:bg-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Task Tracker</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 dark:text-gray-300">Welcome, {user?.fname}</span>
                            <button
                                onClick={logout}
                                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Create Task Form */}
                <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Task</h2>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        {createError && (
                            <div className="text-red-500 text-sm">{createError}</div>
                        )}
                        <div>
                            <input
                                type="text"
                                placeholder="Task Title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <textarea
                                placeholder="Description"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                                rows={3}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isCreating ? 'Creating...' : 'Add Task'}
                        </button>
                    </form>
                </div>

                {/* Filters */}
                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1 rounded-md text-sm ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-3 py-1 rounded-md text-sm ${filter === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                    >
                        Completed
                    </button>
                </div>

                {/* Task List */}
                {isLoadingTasks ? (
                    <div className="text-center py-10">Loading tasks...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTasks.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-10">No tasks found.</div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div key={task._id} className="bg-white dark:bg-zinc-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-zinc-700">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={task.title}>
                                                {task.title}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                                            {task.description}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 px-5 py-3 flex justify-between items-center">
                                        <button
                                            onClick={() => handleUpdateStatus(task._id, task.status)}
                                            className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                        >
                                            Mark as {task.status === 'pending' ? 'Completed' : 'Pending'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
