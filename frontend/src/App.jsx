import React from 'react'
import Homepage from './pages/Homepage/Homepage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Blog from './pages/Blog/Blog'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage/>} ></Route>
        <Route path="/login" element={<Login/>} ></Route>
        <Route path="/register" element = {<Register/>}></Route>
        <Route path="/blog" element={<Blog/>} ></Route>
      </Routes>
    </>

  )
}

export default App