import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';

import mongoose from 'mongoose';

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors({
  origin: '*'
}));

app.use(express.json());
app.use(compression());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB 🍃'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Schema & Model
interface ITask extends mongoose.Document {
  title: string;
  name: string;
  status: 'todo' | 'done';
  createdAt: Date;
}

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['todo', 'done'], default: 'todo' },
  createdAt: { type: Date, default: Date.now }
});

const TaskModel = mongoose.model<ITask>('Task', taskSchema);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Task API
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    res.json(tasks.map(t => ({ id: t._id, title: t.title, name: t.name, status: t.status })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, name } = req.body;
  if (!title || !name) return res.status(400).json({ error: 'Title and Name required' });
  
  try {
    const newTask = new TaskModel({ title, name });
    await newTask.save();
    res.status(201).json({ id: newTask._id, title: newTask.title, name: newTask.name, status: newTask.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await TaskModel.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.status = task.status === 'todo' ? 'done' : 'todo';
    await task.save();
    res.json({ id: task._id, title: task.title, name: task.name, status: task.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await TaskModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Simple API
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from backend 🚀',
    environment: process.env.NODE_ENV || 'development'
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});