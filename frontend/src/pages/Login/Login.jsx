import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './api';  // Import the loginUser function from api.js
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && password) {
      try {
        // Call loginUser function from api.js
        const response = await loginUser(email, password);
        
        // If login is successful, navigate to posts page
        console.log('Login Success:', response);
        
        // Check if the response contains the token
        if (response.access) {
          localStorage.setItem('token', response.access); // Save token in localStorage
          navigate('/'); // Navigate to the posts page after login
        } else {
          setErrorMessage('Login failed. No token received.');
        }
      } catch (error) {
        setErrorMessage(error.message || 'Login failed. Please try again.');
        console.error('Login Error:', error);
      }
    } else {
      setErrorMessage('Please enter both email and password.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
        <p>Don't have an account? <a href="/register">Register</a></p>
      </form>
    </div>
  );
};

export default Login;
