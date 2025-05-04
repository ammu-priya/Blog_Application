// api.js
const API_URL = "http://localhost:8000/newuser/api/v1"; 

// Utility function for making API calls
const apiRequest = async (url, method, body = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const options = {
    method: method,
    headers: headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error("API Request Error: ", error);
    throw error;
  }
};

// Register User API
export const registerUser = async (userData) => {
  const url = `${API_URL}/register/`;
  return apiRequest(url, "POST", userData);
};

// Other API functions can be added similarly

// Example: Login API
export const loginUser = async (loginData) => {
  const url = `${API_URL}/token/`;
  return apiRequest(url, "POST", loginData);
};

// Example: Fetch all posts
export const fetchPosts = async () => {
  const url = `${API_URL}/posts/`;
  return apiRequest(url, "GET");
};
