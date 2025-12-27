import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getPosts } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import { toast } from 'react-toastify';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    // On page load/refresh, clear any search params and load all posts
    if (searchParams.toString()) {
      // Clear search params from URL
      window.history.replaceState({}, '', '/');
      setSearchParams({});
    }
    setCurrentPage(1);
    setSearchTerm('');
    fetchPosts(1, '');
  }, []); // Only run on mount/refresh

  const fetchPosts = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (page > 1) params.append('page', page);
      if (search) params.append('search', search);
      
      const res = await getPosts(params.toString());
      const responseData = res.data;
      
      // Handle response format
      if (responseData.success) {
        setPosts(responseData.posts || []);
        setPagination(responseData.pagination);
      } else if (Array.isArray(responseData)) {
        // Handle old format (array directly)
        setPosts(responseData);
      } else if (responseData.posts) {
        setPosts(responseData.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load posts';
      toast.error(errorMessage);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      const params = new URLSearchParams();
      params.append('search', term);
      params.append('page', '1');
      setSearchParams(params);
      fetchPosts(1, term);
    } else {
      // Clear search - remove params and fetch all posts
      window.history.replaceState({}, '', '/');
      setSearchParams({});
      setCurrentPage(1);
      fetchPosts(1, '');
    }
  };

  const handlePageChange = (page) => {
    const currentSearch = searchTerm;
    if (currentSearch) {
      const params = new URLSearchParams();
      params.append('search', currentSearch);
      params.set('page', page);
      setSearchParams(params);
      fetchPosts(page, currentSearch);
    } else {
      // No search - just change page without URL params
      setCurrentPage(page);
      fetchPosts(page, '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>Welcome to Blog Platform</h1>
        <p>Discover amazing stories and share your thoughts</p>
      </div>

      <SearchBar 
        onSearch={handleSearch} 
        placeholder="Search posts by title, content, or tags..."
        value={searchTerm}
      />

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>No posts yet</h2>
          <p>Be the first to create a post!</p>
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
                  <span>By {post.authorName || post.author?.username}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.views} views</span>
                  {post.likes && <span>{post.likes.length} likes</span>}
                </div>
              </div>
              {post.excerpt && (
                <p className="card-content">{post.excerpt.replace(/<[^>]*>/g, '').substring(0, 200)}{post.excerpt.length > 200 ? '...' : ''}</p>
              )}
              {!post.excerpt && post.content && (
                <p className="card-content">{post.content.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="card-footer">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) {
                      toast.error('Please login to read the full post');
                      navigate('/login');
                    } else {
                      navigate(`/post/${post._id}`);
                    }
                  }}
                  className="btn btn-primary"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="btn btn-secondary"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="btn btn-secondary"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

