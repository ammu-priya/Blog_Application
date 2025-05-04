import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
function Navbar() {
  return (
    <header className="home-header">
        <h1>My Blog</h1>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/blog">Manage blog</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
        </nav>
    </header>
  )
}

export default Navbar