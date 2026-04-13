'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
  id: string;
  title: string;
  name: string;
  status: 'todo' | 'done';
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskName.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/tasks`, { 
        title: newTaskTitle,
        name: newTaskName 
      });
      setTasks([...tasks, res.data]);
      setNewTaskTitle('');
      setNewTaskName('');
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const res = await axios.put(`${API_URL}/api/tasks/${id}`);
      setTasks(tasks.map(t => t.id === id ? res.data : t));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center py-12 px-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-2xl">
        <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Tasks Master
          </h1>
          <p className="text-slate-400 text-lg">Manage your workflow with style and precision</p>
        </header>

        <form onSubmit={addTask} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          <div className="relative group mb-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center bg-slate-900 rounded-2xl p-2 pl-6 shadow-2xl transition duration-500 focus-within:ring-2 ring-indigo-500/50">
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?" 
                className="bg-transparent border-none outline-none text-lg py-3 placeholder:text-slate-600"
              />
              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <span className="text-slate-500 text-sm">By:</span>
                <input 
                  type="text" 
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Your Name" 
                  className="bg-transparent border-none outline-none text-lg py-3 placeholder:text-slate-600 w-full"
                />
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {loading ? (
            <div className="text-center py-20 text-slate-500 animate-pulse">
              Syncing tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
              No tasks found. Time to relax! ☕
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                className="group relative flex items-center justify-between bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700/50 p-5 rounded-2xl transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.status === 'done' 
                        ? 'bg-indigo-500 border-indigo-500 scale-110' 
                        : 'border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {task.status === 'done' && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg transition-all ${
                      task.status === 'done' 
                        ? 'text-slate-500 line-through' 
                        : 'text-slate-200'
                    }`}>
                      {task.title}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      Assigned to: <span className="text-slate-400 font-medium">{task.name}</span>
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-500/10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Footer Meta */}
        <footer className="mt-16 text-center text-slate-600 text-sm flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Connection Secure
          </div>
          <div>{tasks.filter(t => t.status === 'done').length}/{tasks.length} Completed</div>
        </footer>
      </div>
    </main>
  );
}