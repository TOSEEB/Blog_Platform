const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/posts
// @desc    Get all posts (published only for public, all for authenticated users)
// @access  Public/Private
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query based on authentication
    let query = {};
    
    // Non-authenticated users can only see published posts
    if (!req.user) {
      query.published = true;
    }
    
    // Add search functionality
    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
      
      // Combine search with existing query
      if (req.user) {
        // Authenticated users: search all posts
        query.$or = searchConditions;
      } else {
        // Non-authenticated users: search only published posts
        // Use $and to combine published filter with search
        query = {
          $and: [
            { published: true },
            { $or: searchConditions }
          ]
        };
      }
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Private (requires login)
router.get('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if authenticated user is trying to access someone else's draft
    // Allow viewing if: post is published OR user is the author
    const authorId = post.author._id ? post.author._id.toString() : String(post.author);
    const userId = String(req.user.userId);
    
    if (!post.published && authorId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view your own draft posts.' 
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, excerpt, tags, featuredImage, published } = req.body;
    const user = await User.findById(req.user.userId);

    const post = new Post({
      title,
      content,
      excerpt: excerpt || content.substring(0, 300),
      tags: tags || [],
      featuredImage: featuredImage || '',
      published: published || false,
      author: req.user.userId,
      authorName: user.username
    });

    await post.save();
    await post.populate('author', 'username');

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content, excerpt, tags, featuredImage, published } = req.body;

    post.title = title;
    post.content = content;
    post.excerpt = excerpt || content.substring(0, 300);
    post.tags = tags || [];
    post.featuredImage = featuredImage || '';
    post.published = published !== undefined ? published : post.published;
    post.updatedAt = Date.now();

    await post.save();
    await post.populate('author', 'username');

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.put('/:id/like', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.userId;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

