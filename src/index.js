const inquirer = require('inquirer');
const { registerUser, loginUser } = require('./controllers/authController');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const integrateDB = require('../src/config/db');
const superAdmin = require('./config/superAdmin');

const startApp = async () => {
  await integrateDB();
  await superAdmin();
  console.log('tickDone is ready');
};

const startCLI = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: ['Register', 'Login', 'Exit'],
    },
  ]);

  if (action === 'Register') {
    const { name, email, password, passwordConfirm } = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Enter your name:' },
      { type: 'input', name: 'email', message: 'Enter your email:' },
      { type: 'password', name: 'password', message: 'Enter your password:' },
      {
        type: 'password',
        name: 'passwordConfirm',
        message: 'confirm your password:',
      },
    ]);
    await registerUser(name, email, password, passwordConfirm);
  } else if (action === 'Login') {
    const { email, password } = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    await loginUser(email, password);
  } else {
    console.log('Goodbye!');
    process.exit(0);
  }
};

//Start the App
startApp();

//Initiate the CLI
startCLI();
