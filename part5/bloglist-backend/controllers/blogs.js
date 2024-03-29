const router = require('express').Router();
const Blog = require('../models/blog');

router.get('/', async (request, response) => {
  const notes = await Blog.find({}).populate('user', { username: 1, name: 1 });

  return response.json(notes);
});

router.post('/', async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const { user } = request;
  const blog = new Blog({ ...request.body, user: user.id });

  const savedBlog = await blog.save();

  // eslint-disable-next-line no-underscore-dangle
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  return response.status(201).json(savedBlog);
});

router.delete('/:id', async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id);
  if (!blogToDelete) {
    return response.status(204).end();
  }

  if (blogToDelete.user && blogToDelete.user.toString() !== request.user.id) {
    return response.status(401).json({
      error: 'only the creator can delete a blog',
    });
  }

  await Blog.findByIdAndRemove(request.params.id);

  return response.status(204).end();
});

router.put('/:id', async (request, response) => {
  const blog = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  return response.json(updatedBlog);
});

module.exports = router;
