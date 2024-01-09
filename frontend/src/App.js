import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Account from "./Account";
import CreatePost from "./CreatePost"; 
import DisplayPosts from "./DisplayPosts"; 
import ProtectedRoute from "./ProtectedRoute";
import PostDetail from './PostDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/account" element={<Account />} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><DisplayPosts /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

