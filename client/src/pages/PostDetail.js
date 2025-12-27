import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, deletePost, likePost } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check if user is logged in before fetching
    if (!user) {
      toast.error('Please login to view posts');
      navigate('/login');
      return;
    }
    fetchPost();
  }, [id, user, navigate]);

  const fetchPost = async () => {
    try {
      // Check if user is logged in first
      if (!user) {
        toast.error('Please login to view posts');
        navigate('/login');
        return;
      }

      const res = await getPost(id);
      const postData = res.data.post || res.data;
      
      // Check if post is published or user is the author
      const userId = user._id || user.id;
      const authorId = postData.author?._id || postData.author;
      
      // Allow viewing if: post is published OR user is the author
      if (!postData.published && userId && authorId && userId.toString() !== authorId.toString()) {
        toast.error('You can only view your own draft posts.');
        navigate('/my-posts');
        return;
      }
      
      setPost(postData);
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        toast.error('Please login to view this post');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error(errorData?.message || 'You do not have permission to view this post');
        navigate('/');
      } else {
        toast.error('Failed to load post');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deletePost(id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete post');
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setLiking(true);
    try {
      const res = await likePost(id);
      const responseData = res.data;
      const isLiked = responseData.isLiked;
      const newLikes = isLiked
        ? [...(post.likes || []), user._id || user.id]
        : (post.likes || []).filter(likeId => {
            const likeIdStr = typeof likeId === 'object' ? likeId.toString() : likeId;
            const userId = user._id || user.id;
            return likeIdStr !== userId?.toString();
          });
      
      setPost({
        ...post,
        likes: newLikes
      });
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setLiking(false);
    }
  };

  // Process content to ensure HTML is properly rendered (must be before early returns)
  const processedContent = useMemo(() => {
    if (!post?.content) return '';
    let content = String(post.content);
    
    // Check if content contains HTML entities that need decoding
    // (e.g., &lt;h2&gt; should become <h2>)
    if (content.includes('&lt;') || content.includes('&gt;')) {
      // Decode HTML entities using textarea method
      const textarea = document.createElement('textarea');
      textarea.innerHTML = content;
      content = textarea.value;
      
      // If entities still exist, use direct string replacement as fallback
      if (content.includes('&lt;') || content.includes('&gt;')) {
        content = content
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ');
      }
    }
    
    return content;
  }, [post?.content]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const isLiked = user && post.likes?.some(likeId => {
    const userId = user._id || user.id;
    const likeIdStr = typeof likeId === 'object' ? likeId.toString() : likeId;
    return userId && likeIdStr && (userId.toString() === likeIdStr.toString());
  });
  
  const isAuthor = (() => {
    if (!user) return false;
    const userId = user._id || user.id;
    const authorId = post.author?._id || post.author;
    return userId && authorId && (userId.toString() === authorId.toString());
  })();

  return (
    <div className="post-detail">
      <article className="post-article">
        <div className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>By {post.authorName || post.author?.username}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>{post.views} views</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {post.featuredImage && (
          <div className="post-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        )}

        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        <div className="post-actions">
          <button
            onClick={handleLike}
            className={`btn ${isLiked ? 'btn-primary' : 'btn-secondary'}`}
            disabled={liking || !user}
          >
            {isLiked ? '❤️ Liked' : '🤍 Like'} ({post.likes?.length || 0})
          </button>

          {isAuthor && (
            <div className="author-actions">
              <Link to={`/edit-post/${id}`} className="btn btn-success">
                Edit Post
              </Link>
              <button 
                onClick={handleDelete} 
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default PostDetail;

