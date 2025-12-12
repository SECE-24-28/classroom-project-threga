// Importing required packages
const express = require('express');      // Express framework
const mongoose = require('mongoose');    // Mongoose for MongoDB
const cors = require('cors');            // To allow frontend requests
require('dotenv').config();              // Load .env variables

const app = express(); // Create Express app instance

// Middlewares
app.use(cors());             // Enable CORS
app.use(express.json());     // Parse incoming JSON request bodies


// --------------------------------------------------------------
// 1️⃣ MONGOOSE SCHEMA & MODEL
// --------------------------------------------------------------

// Define the structure of a "Post"
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },     // Title field (required)
    content: { type: String, required: true },   // Content field (required)
    author: { type: String, default: 'Anonymous' } // Optional author field
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Create the model (table/collection)
const Post = mongoose.model('Post', postSchema);


// --------------------------------------------------------------
// 2️⃣ CREATE (POST) - Add new post
// --------------------------------------------------------------
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;  // Get data from request body

    // Check if required fields exist
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Create new post document
    const post = new Post({
      title,
      content,
      author: author || 'Anonymous'
    });

    // Save to MongoDB
    const savedPost = await post.save();

    // Send response
    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post: savedPost
    });

  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// --------------------------------------------------------------
// 3️⃣ READ (GET) - Get all posts
// --------------------------------------------------------------
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Get all posts sorted by latest
    res.json({ success: true, posts }); // Send response
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// --------------------------------------------------------------
// 4️⃣ UPDATE (PUT) - Update a post by ID
// --------------------------------------------------------------
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;           // Capture ID from URL
    const { title, content, author } = req.body; // Get updated data

    // Find the post by ID and update
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, author },
      { new: true, runValidators: true } // Return updated result + validate fields
    );

    // If no matching ID
    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post updated successfully!',
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// --------------------------------------------------------------
// 5️⃣ DELETE (DELETE) - Remove a post by ID
// --------------------------------------------------------------
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the post ID from URL

    // Find the post and delete it
    const deletedPost = await Post.findByIdAndDelete(id);

    // If not found
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully!',
      post: deletedPost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// --------------------------------------------------------------
// 6️⃣ ROOT ROUTE (OPTIONAL)
// --------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: 'Simple CRUD API running! Use /api/posts' });
});


// --------------------------------------------------------------
// 7️⃣ CONNECT TO MONGODB + START SERVER
// --------------------------------------------------------------
const PORT = process.env.PORT || 5000; // Read from .env or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mypostdb';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Start server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Test POST → http://localhost:${PORT}/api/posts`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
