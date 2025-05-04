const BASE_URL = 'http://127.0.0.1:8000/newuser/api/v1/posts/';

// Create a new blog post
export const createPost = async (postData, token) => {
  try {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('is_published', postData.is_published);

    if (postData.tags) {
      postData.tags.forEach((tag) => formData.append('tags', tag));
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass the token here
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get all blog posts
export const getPosts = async (token) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass the token here
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    
    // Return the data.posts array, assuming the actual posts are in the 'data' field
    return data.data;  // This accesses the 'data' field from the response
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};


// Delete a blog post by ID
export const deletePost = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass the token here
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};
