import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getPost, updatePost } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    featuredImage: '',
    published: false
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to edit posts');
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchPost = async () => {
    try {
      const res = await getPost(id);
      const post = res.data;

      // Check if user is the author
      const userId = user?._id || user?.id;
      const authorId = post.author?._id || post.author;
      if (user && (!userId || !authorId || userId.toString() !== authorId.toString())) {
        toast.error('You are not authorized to edit this post');
        navigate('/');
        return;
      }

      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        tags: post.tags ? post.tags.join(', ') : '',
        featuredImage: post.featuredImage || '',
        published: post.published || false
      });
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (value) => {
    setFormData({
      ...formData,
      content: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim().replace(/^#+/, '')).filter(tag => tag)
        : [];

      const postData = {
        ...formData,
        tags: tagsArray
      };

      const res = await updatePost(id, postData);
      toast.success('Post updated successfully!');
      navigate(`/post/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to update post';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !user) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="create-post">
      <h1>Edit Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt (optional)</label>
          <textarea
            id="excerpt"
            name="excerpt"
            className="form-control"
            value={formData.excerpt}
            onChange={handleChange}
            rows="3"
            placeholder="Brief summary of your post..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            style={{ minHeight: '300px', marginBottom: '50px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="form-control"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., technology, programming, web development"
          />
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage">Featured Image URL (optional)</label>
          <input
            type="url"
            id="featuredImage"
            name="featuredImage"
            className="form-control"
            value={formData.featuredImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
            />
            Publish immediately
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Post'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/post/${id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;

