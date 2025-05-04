const API_BASE_URL = 'http://localhost:8000/newuser/api/v1';  // Replace with your actual API base URL

export const loginUser = async (email, password) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if the response is OK (status code 2xx)
    if (!response.ok) {
      const errorData = await response.json(); // Parse the error message from response
      throw new Error(errorData.message || 'Login failed');
    }

    // If the response is OK, return the response data (the token)
    const data = await response.json();
    return data;  // Assuming the data contains the token
  } catch (error) {
    throw error; // Throw error for handling in the component
  }
};
