import Task from '../models/Task.js';

export const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      dueDate, 
      priority, 
      status = 'todo', 
      assignedTo 
    } = req.body;

    if (!title || !description || !dueDate || !assignedTo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Only admin and manager can create tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to create tasks' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status,
      assignedTo,
      createdBy: req.user.id,
    });

    res.status(201).json({ 
      message: 'Task created successfully', 
      task 
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ 
      message: 'Error creating task', 
      error: error.message 
    });
  }
};


export const getNewTaskForm = async (req, res) => {
  try {
    // You can return default values or an empty task structure
    const newTask = {
      title: '',
      description: '',
      dueDate: new Date(), // or null
      priority: 'medium',
      status: 'todo',
      assignedTo: null,
    };
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error preparing new task form', error: error.message });
  }
};


export const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin and manager can see all tasks
      tasks = await Task.find().populate('assignedTo', 'username');
    } else {
      // Regular users can only see their assigned tasks
      tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedTo', 'username');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};


// New controller function to get task stats
export const getTaskStats = async (req, res) => {
  try {
    let stats;
    
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin and manager can see stats for all tasks
      const totalTasks = await Task.countDocuments();
      const completedTasks = await Task.countDocuments({ status: 'completed' });
      const pendingTasks = await Task.countDocuments({ status: { $ne: 'completed' } });
      stats = { totalTasks, completedTasks, pendingTasks };
    } else {
      // Regular users can only see stats for their assigned tasks
      const totalTasks = await Task.countDocuments({ assignedTo: req.user.id });
      const completedTasks = await Task.countDocuments({ assignedTo: req.user.id, status: 'completed' });
      const pendingTasks = await Task.countDocuments({ assignedTo: req.user.id, status: { $ne: 'completed' } });
      stats = { totalTasks, completedTasks, pendingTasks };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task stats', error: error.message });
  }
};


export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'username');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the user has permission to update the task
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Regular users can only update the status
    if (req.user.role === 'user') {
      task.status = status || task.status;
    } else {
      // Admin and manager can update all fields
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
    }

    await task.save();
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
    // Only admin and manager can delete tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to delete tasks' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

