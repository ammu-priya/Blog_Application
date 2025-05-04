const BASE_URL = 'http://127.0.0.1:8000/newuser/api/v1';

// Function to fetch posts
export const getPosts = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/public-posts/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass the token here
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    return data.results;  // Return posts data from 'results' key
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Function to add a comment to a specific post
export const addComment = async (postId, comment, token) => {
  try {
    const response = await fetch(`${BASE_URL}/${postId}/comments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass the token here
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: comment,  // Sending the comment content to the backend
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    const data = await response.json();
    return data;  // Return the response from the backend
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
