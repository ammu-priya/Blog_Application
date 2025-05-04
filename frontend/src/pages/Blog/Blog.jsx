import React, { useState, useEffect } from 'react';
import './Blog.css';
import Navbar from '../../components/navbar/Navbar';
import { createPost, getPosts, deletePost } from './api';

const Blog = () => {
  const [posts, setPosts] = useState([]);  // Initialize posts as an empty array
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_published: true,
    tags: []
  });
  const [editIndex, setEditIndex] = useState(null);
  const accessToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getPosts(accessToken);
        if (Array.isArray(postsData)) {
          setPosts(postsData);
          console.log('Fetched posts:', postsData);
        } else {
          console.error('Expected an array of posts but got:', postsData);
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, content, is_published, tags } = form;

    if (!title || !content) return;

    const postData = { title, content, is_published, tags };

    try {
      const newPost = await createPost(postData, accessToken);
      setPosts([...posts, newPost]);
      setForm({ title: '', content: '', is_published: true, tags: [] });
      setEditIndex(null);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleEdit = (index) => {
    setForm(posts[index]);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const postToDelete = posts[index];

    try {
      const success = await deletePost(postToDelete.id, accessToken);
      if (success) {
        const updatedPosts = posts.filter((_, i) => i !== index);
        setPosts(updatedPosts);
        if (editIndex === index) setForm({ title: '', content: '', is_published: true, tags: [] });
        setEditIndex(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="post-manager">
        <h2>{editIndex !== null ? 'Edit Post' : 'Create Post'}</h2>

        <form className="post-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Post Title"
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            name="content"
            placeholder="Post Content"
            value={form.content}
            onChange={handleChange}
          ></textarea>

          <label>
            <input
              type="checkbox"
              name="is_published"
              checked={form.is_published}
              onChange={handleChange}
            />
            Publish Post
          </label>

          <button type="submit">
            {editIndex !== null ? 'Update Post' : 'Add Post'}
          </button>
        </form>

        <div className="post-list">
          <h3>My Posts</h3>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((post, index) => (
              <div key={index} className="post-card">
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                <p>Status: {post.is_published ? 'Published' : 'Unpublished'}</p>
                <div className="post-actions">
                  <button onClick={() => handleEdit(index)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(index)}>🗑️ Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
