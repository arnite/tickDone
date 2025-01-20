const inquirer = require('inquirer');
const { registerUser, loginUser } = require('./controllers/authController');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const integrateDB = require('../src/config/db');
const superAdmin = require('./config/superAdmin');

const startApp = async () => {
  try {
    await integrateDB();
    await superAdmin();
    console.log('tickDone is ready');
  } catch (error) {
    console.error('Error starting the app:', error.message);
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
          message: 'What would you like to do?',
          choices: ['Register', 'Login', 'Exit'],
        },
      ]);

      if (action === 'Register') {
        const { name, email, password, passwordConfirm } =
          await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Enter your name:' },
            { type: 'input', name: 'email', message: 'Enter your email:' },
            {
              type: 'password',
              name: 'password',
              message: 'Enter your password:',
            },
            {
              type: 'password',
              name: 'passwordConfirm',
              message: 'Confirm your password:',
            },
          ]);
        await registerUser(name, email, password, passwordConfirm);
      } else if (action === 'Login') {
        const { email, password } = await inquirer.prompt([
          { type: 'input', name: 'email', message: 'Enter your email:' },
          {
            type: 'password',
            name: 'password',
            message: 'Enter your password:',
          },
        ]);
        await loginUser(email, password);
      } else if (action === 'Exit') {
        console.log('Goodbye!');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('An error occurred in the CLI:', error.message);
  }
};

// Main function to start the app and CLI
const main = async () => {
  await startApp();
  await startCLI();
};

main();
