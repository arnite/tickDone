const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Create a task
const createTask = async (taskData, userId) => {
  const task = new Task({
    ...taskData,
    createdBy: userId,
  });

  try {
    await task.save();
    return task;
  } catch (error) {
    throw new Error('Error creating task: ' + error.message);
  }
};

// Get tasks with optional filtering
const getTasks = async (filters = {}) => {
  try {
    const tasks = await Task.find(filters).populate('createdBy', 'name email');
    return tasks;
  } catch (error) {
    throw new Error('Error fetching tasks: ' + error.message);
  }
};

// Update a task (only the creator can update)
const updateTask = async (taskId, taskData, userId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.createdBy.toString() !== userId) {
      throw new Error('You are not authorized to update this task');
    }

    // Update task
    Object.assign(task, taskData);
    await task.save();
    return task;
  } catch (error) {
    throw new Error('Error updating task: ' + error.message);
  }
};

// Delete a task (only the creator can delete)
const deleteTask = async (taskId, userId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.createdBy.toString() !== userId) {
      throw new Error('You are not authorized to delete this task');
    }

    await task.remove();
    return { message: 'Task deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting task: ' + error.message);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
