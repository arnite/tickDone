# tickDone

## Overview

tickDone is an interactive command-line interface (CLI) application for managing tasks efficiently. It includes features like user authentication, task creation, and management with support for filtering, sorting, subtasks, and notifications.

## Features

- User Authentication:
  - Register new users with hashed passwords.
  - Login with email and password to generate a JWT token.
- Task Management:
  - Create, read, update, and delete tasks.
  - Support for subtasks.
- Advanced Features:
  - Filtering, sorting, and pagination for tasks.
- Role-Based Access Control (RBAC):
  - Separate actions for admin and regular users.
- Command-line interaction using prompts.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/arnite/tickDone.git
   cd tickDone
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:

   ```env
   DATABASE= your_mongodb_connection_string
   JWT_SECRET= your_secret_key
   JWT_EXPIRES_IN= your expires day
   JWT_COOKIE_EXPIRES_IN= your cookie expires day
   SAname = super admin name
   SAemail = super admin email
   SApassword = super admin (password)
   SApasswordConfirm = super admin (password confirm)
   SArole = super Admin role

   ```

4. Start the CLI tool:
   ```bash
   npm run start
   ```

### Global Installation

To use the CLI tool globally, follow these steps:

1. Install the package globally:
   ```bash
   npm install -g tickDone
   ```
2. Use the CLI tool by running:
   ```bash
   tickDone
   ```
3. Follow the prompts to register, login, or manage tasks.

---

## Usage

### Commands

- **Register**: Create a new user account.
- **Login**: Login to your account to manage tasks.
- **Task Management**:
  - Add, update, delete, or view tasks.
  - Manage subtasks for a specific task.

### Examples

1. **Register a user**:
   - Follow the prompts to enter your name, email, and password.
2. **Login**:
   - Enter your registered email and password to access your tasks.
3. **Create a task**:
   - Provide details like title, description, priority, and due date when prompted.

---

## Project Structure

```
tickDone/
├── src/
│   ├── controllers/   # Logic for handling users and tasks
│   ├── config/            # MongoDB connection logic
│   ├── models/        # Mongoose models
│   └── index.js       # CLI entry point
├── .env               # Environment variables
├── package.json       # Project metadata and dependencies
├── README.md          # Project documentation
```

---

## Development

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or cloud-based, e.g., MongoDB Atlas)

### Scripts

- **Run the application**:
  ```bash
  npm run start
  ```
- **Run in development mode (with hot reload)**:
  ```bash
  npm run dev
  ```

### Dependencies

- `mongoose`: For MongoDB object modeling.
- `bcrypt`: For password hashing.
- `jsonwebtoken`: For user authentication.
- `dotenv`: For environment variable management.
- `inquirer`: For interactive CLI prompts.
- `chalk`: For styled CLI output.

---

## License

This project is licensed under the [MIT License](LICENSE).
