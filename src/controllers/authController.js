const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const tokenFilePath = path.join(__dirname, '..', 'token.json'); // Path to store the token temporarily

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user) => {
  const token = signToken(user._id);

  // Store the token in a file for persistence
  fs.writeFileSync(tokenFilePath, JSON.stringify({ token }));

  user.password = undefined;

  console.log('Token stored successfully.');
};

exports.registerUser = async (name, email, password, passwordConfirm) => {
  const newUser = await User.create({ name, email, password, passwordConfirm });

  // Generate and store token
  createSendToken(newUser);
  console.log('Registration successful!');
};

exports.loginUser = async (email, password) => {
  if (!email || !password) throw new Error('Please provide email and password');

  const user = await User.findOne({ email }).select('+password ');
  if (!user) throw new Error('User not found');

  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  // Generate and store token
  createSendToken(user);
  console.log('Login successful!');
};

// Protect function (used to validate a token)
exports.protect = async () => {
  try {
    // Try to read the token from the file
    let token = '';

    if (fs.existsSync(tokenFilePath)) {
      const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf-8'));
      token = tokenData.token;
    }

    if (!token) {
      throw new Error('You are not logged in! Please log in to get access.');
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      throw new Error('The user belonging to this token does no longer exist.');
    }

    if (freshUser.isPasswordChangedAfter(decoded.iat)) {
      throw new Error('User recently changed password. Please log in again.');
    }

    return freshUser;
  } catch (err) {
    console.error('Error in token protection:', err.message);
    throw new Error(`Token protection failed: ${err.message}`);
  }
};

// Update user password
exports.updatePassword = async (
  userId,
  currentPassword,
  newPassword,
  newPasswordConfirm
) => {
  try {
    const user = await User.findById(userId).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw new Error('Your current password is incorrect');
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    // Generate and store new token
    createSendToken(user);
    console.log('Password updated successfully!');
  } catch (err) {
    console.error('Error during password update:', err.message);
    throw new Error(`Password update failed: ${err.message}`);
  }
};

// Forgot password functionality (for CLI, we'll just print the reset URL)
exports.forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('There is no user with that email address.');
    }

    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/resetPassword/${resetToken}`;

    // For CLI, we'll just print the reset URL (no email sending in CLI)
    console.log(`Password reset URL: ${resetUrl}`);
  } catch (err) {
    console.error('Error during forgot password:', err.message);
    throw new Error(`Forgot password failed: ${err.message}`);
  }
};
