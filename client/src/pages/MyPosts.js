import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyPosts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your posts');
      navigate('/login');
      return;
    }
    fetchMyPosts();
  }, [user, navigate]);

  const fetchMyPosts = async () => {
    try {
      const res = await getPosts();
      const responseData = res.data;
      const allPosts = responseData.posts || responseData;
      
      // Filter posts by current user
      const userId = user?._id || user?.id;
      const myPosts = Array.isArray(allPosts) ? allPosts.filter(post => {
        const authorId = post.author?._id || post.author;
        return userId && authorId && (userId.toString() === authorId.toString());
      }) : [];
      setPosts(myPosts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(postId);
    try {
      await deletePost(postId);
      toast.success('Post deleted successfully');
      fetchMyPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="my-posts">
      <div className="page-header">
        <h1>My Posts</h1>
        <Link to="/create-post" className="btn btn-primary">
          Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>You haven't created any posts yet</h2>
          <p>Start sharing your thoughts with the world!</p>
          <Link to="/create-post" className="btn btn-primary">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="card">
              <div className="card-header">
                <Link to={`/post/${post._id}`}>
                  <h2 className="card-title">{post.title}</h2>
                </Link>
                <div className="card-meta">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.views} views</span>
                  {post.likes && <span>{post.likes.length} likes</span>}
                  <span className={`status ${post.published ? 'published' : 'draft'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              {post.excerpt && (
                <p className="card-content">{post.excerpt}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link 
                    to={`/post/${post._id}`} 
                    className="btn btn-primary"
                    style={{ display: 'inline-block' }}
                  >
                    View
                  </Link>
                  <Link 
                    to={`/edit-post/${post._id}`} 
                    className="btn btn-success"
                    style={{ display: 'inline-block' }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn btn-danger"
                    disabled={deleting === post._id}
                    style={{ display: 'inline-block' }}
                  >
                    {deleting === post._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;

