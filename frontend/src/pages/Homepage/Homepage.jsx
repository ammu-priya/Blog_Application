import React, { useState, useEffect } from 'react';
import { getPosts, addComment } from "./api"; // Import functions from api.js
import './Homepage.css';
import Navbar from '../../components/navbar/Navbar';

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        const fetchedPosts = await getPosts(token); // Use getPosts function from api.js
        setPosts(fetchedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle like functionality
  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post
      )
    );
  };

  // Handle comment functionality
  const handleComment = async (postId, comment) => {
    try {
      const token = localStorage.getItem('token');
      const newComment = await addComment(postId, comment, token); // Call the API to add the comment

      // Update the post with the new comment after it is successfully added
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment.content] } 
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <SocialFeed posts={posts} handleLike={handleLike} handleComment={handleComment} />;
};

const SocialFeed = ({ posts, handleLike, handleComment }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter posts based on title or content matching the search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      <Navbar />
      <main className="home-main">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search posts..."
            className="search-bar"
            onChange={handleSearch}
          />
        </div>

        <h2>Social Feed</h2>
        <div className="feed-container">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p className="post-author">By {post.author.username}</p>
              <p>{post.content}</p>

              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>❤️ Like ({post.likes_count})</button>
              </div>

              <div className="comments-section">
                <h4>Comments</h4>
                <ul>
                  {post.comments?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <CommentInput postId={post.id} onComment={handleComment} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const CommentInput = ({ postId, onComment }) => {
  const [comment, setComment] = useState('');

  const submitComment = (e) => {
    e.preventDefault(); // Prevent form submission and page reload
    if (comment.trim()) {
      onComment(postId, comment.trim());
      setComment(''); // Clear input field after submitting
    }
  };

  return (
    <div className="comment-input">
      <input
        type="text"
        placeholder="Write a comment..."
        value={comment}
        maxLength={200}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={submitComment}>Post</button>
    </div>
  );
};

export default Homepage;
