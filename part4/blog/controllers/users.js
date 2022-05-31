const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs');
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (username && password) {
    if (username.length > 2 && password.length > 2) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response.status(400).json({ error: 'username must be unique' });
      }
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        name,
        passwordHash,
      });

      const savedUser = await user.save();

      response.status(201).json(savedUser);
    }
    return response.status(400).json({
      error: 'username and password must be at least 3 characters long',
    });
  }
  return response.status(400).json({
    error: 'username and password must be given',
  });
});

module.exports = usersRouter;