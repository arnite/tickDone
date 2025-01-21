const inquirer = require('inquirer');
const chalk = require('chalk');
const {
  registerUser,
  loginUser,
  protect,
} = require('./controllers/authController');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const integrateDB = require('../src/config/db');
const superAdmin = require('./config/superAdmin');
const Task = require('./models/taskModel');

const startApp = async () => {
  try {
    await integrateDB();
    await superAdmin();
    console.log(chalk.green.bold('tickDone is ready! 🚀'));
  } catch (error) {
    console.error(chalk.red.bold('Error starting the app:'), error.message);
    process.exit(1); // Exit with failure code
  }
};

const startCLI = async () => {
  try {
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: chalk.blue('What would you like to do?'),
          choices: ['Register', 'Login', 'Manage Tasks', 'Exit'],
        },
      ]);

      if (action === 'Register') {
        let registerSuccessful = false;
        while (!registerSuccessful) {
          const { name, email, password, passwordConfirm } =
            await inquirer.prompt([
              {
                type: 'input',
                name: 'name',
                message: chalk.blue('Enter your name:'),
              },
              {
                type: 'input',
                name: 'email',
                message: chalk.blue('Enter your email:'),
              },
              {
                type: 'password',
                name: 'password',
                message: chalk.blue('Enter your password:'),
              },
              {
                type: 'password',
                name: 'passwordConfirm',
                message: chalk.blue('Confirm your password:'),
              },
            ]);

          try {
            await registerUser(name, email, password, passwordConfirm);
            console.log(chalk.green.bold('Registration successful! 🎉'));
            registerSuccessful = true; // Exit the loop if registration is successful
          } catch (error) {
            console.error(
              chalk.red.bold('Registration failed:'),
              error.message
            );
          }
        }
      } else if (action === 'Login') {
        let loginSuccessful = false;
        while (!loginSuccessful) {
          const { email, password } = await inquirer.prompt([
            {
              type: 'input',
              name: 'email',
              message: chalk.blue('Enter your email:'),
            },
            {
              type: 'password',
              name: 'password',
              message: chalk.blue('Enter your password:'),
            },
          ]);

          try {
            await loginUser(email, password);
            console.log(chalk.green.bold('Login successful! ✅'));
            loginSuccessful = true; // Exit the loop if login is successful
          } catch (error) {
            console.error(chalk.red.bold('Login failed:'), error.message);
          }
        }
      } else if (action === 'Manage Tasks') {
        let taskActionDone = false;
        while (!taskActionDone) {
          const { taskAction } = await inquirer.prompt([
            {
              type: 'list',
              name: 'taskAction',
              message: chalk.blue('What would you like to do with tasks?'),
              choices: [
                'Create Task',
                'View Tasks',
                'Mark Task Complete',
                'Delete Task',
                'Exit Task Management',
              ],
            },
          ]);

          const user = await protect(); // Ensure user is logged in

          if (taskAction === 'Create Task') {
            const { title, description, priority, dueDate } =
              await inquirer.prompt([
                {
                  type: 'input',
                  name: 'title',
                  message: chalk.blue('Enter task title:'),
                },
                {
                  type: 'input',
                  name: 'description',
                  message: chalk.blue('Enter task description:'),
                },
                {
                  type: 'list',
                  name: 'priority',
                  message: chalk.blue('Select task priority:'),
                  choices: ['high', 'medium', 'low'],
                },
                {
                  type: 'input',
                  name: 'dueDate',
                  message: chalk.blue('Enter due date (YYYY-MM-DD):'),
                },
              ]);

            try {
              const task = await Task.create({
                title,
                description,
                priority,
                dueDate,
                createdBy: user._id,
              });
              console.log(chalk.green.bold('Task created successfully:'), task);
            } catch (error) {
              console.error(
                chalk.red.bold('Failed to create task:'),
                error.message
              );
            }
          } else if (taskAction === 'View Tasks') {
            try {
              const tasks = await Task.find({ createdBy: user._id });
              if (tasks.length === 0) {
                console.log(chalk.yellow('No tasks found.'));
              } else {
                tasks.forEach((task) => {
                  console.log(
                    chalk.cyan(
                      `[${task.status.toUpperCase()}] (${task.priority}) ${
                        task.title
                      } - Due: ${task.dueDate.toDateString()}`
                    )
                  );
                });
              }
            } catch (error) {
              console.error(
                chalk.red.bold('Error fetching tasks:'),
                error.message
              );
            }
          } else if (taskAction === 'Mark Task Complete') {
            const tasks = await Task.find({
              createdBy: user._id,
              status: { $ne: 'done' },
            });

            if (tasks.length === 0) {
              console.log(chalk.yellow('No tasks to mark as complete.'));
            } else {
              const { taskId } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'taskId',
                  message: chalk.blue('Select a task to mark as complete:'),
                  choices: tasks.map((task) => ({
                    name: `${task.title} - ${task.description}`,
                    value: task._id,
                  })),
                },
              ]);

              try {
                await Task.findByIdAndUpdate(taskId, { status: 'done' });
                console.log(chalk.green.bold('Task marked as complete!'));
              } catch (error) {
                console.error(
                  chalk.red.bold('Failed to mark task complete:'),
                  error.message
                );
              }
            }
          } else if (taskAction === 'Delete Task') {
            const tasks = await Task.find({ createdBy: user._id });

            if (tasks.length === 0) {
              console.log(chalk.yellow('No tasks found to delete.'));
            } else {
              const { taskId } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'taskId',
                  message: chalk.blue('Select a task to delete:'),
                  choices: tasks.map((task) => ({
                    name: `${task.title} - ${task.description}`,
                    value: task._id,
                  })),
                },
              ]);

              try {
                await Task.findByIdAndDelete(taskId);
                console.log(chalk.green.bold('Task deleted successfully!'));
              } catch (error) {
                console.error(
                  chalk.red.bold('Failed to delete task:'),
                  error.message
                );
              }
            }
          } else if (taskAction === 'Exit Task Management') {
            taskActionDone = true;
          }
        }
      } else if (action === 'Exit') {
        console.log(chalk.green('Goodbye! 👋'));
        process.exit(0);
      }
    }
  } catch (error) {
    console.error(
      chalk.red.bold('An error occurred in the CLI:'),
      error.message
    );
  }
};

// Main function to start the app and CLI
const main = async () => {
  await startApp();
  await startCLI();
};

main();
