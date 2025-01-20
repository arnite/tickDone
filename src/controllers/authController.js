const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (name, email, password, passwordConfirm) => {
  const newUser = await User.create({ name, email, password, passwordConfirm });
  const token = signToken(newUser._id);

  console.log('User registered successfully, Your token:', token);
};

const loginUser = async (email, password) => {
  if (!email || !password) throw new Error('Please provide email and password');

  const user = await User.findOne({ email }).select('+password ');
  const isMatch = await user.correctPassword(password, user.password);

  if (!user || !isMatch) throw new Error('Invalid credentials');

  const token = signToken(user._id);
  console.log('Login successful. Your token:', token);
};

module.exports = { registerUser, loginUser };
