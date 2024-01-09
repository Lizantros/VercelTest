import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import logo from "./images/logo.svg";
import defaultAvatar from './images/default-avatar.png';
import './DisplayPosts.css';

function DisplayPosts() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            currentUserId = decodedToken.userId;
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5500/get-posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);

    const navigateToAccount = () => {
        navigate('/create-post');
    };

    const handleDeletePost = async (postId) => {
        if (!token) {
            console.error('Authentication token not found');
            return;
        }
        await axios.delete(`http://localhost:5500/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setPosts(posts.filter(post => post.id !== postId));
    };

    return (
        <div className="main-container">
            {/* Header */}
            <div className="header1">
                <img src={logo} alt='Logo' />
                <span onClick={() => navigate('/account')}>Mon compte</span>
            </div>

            {/* Banner */}
            <div className="banner">
                <h1>Bienvenue dans mon forum GW2</h1>
            </div>

            {/* Discussions Header */}
            <div className="discussions-header">
                <h2>Discussions</h2>
                <span onClick={navigateToAccount}>＋</span>
            </div>

            {/* Posts */}
            {posts.map((post) => (
                <div key={post.id} className="post">
                    <div className="post-user-info">
                        <img
                            src={post.compteImage ? `http://localhost:5500/${post.compteImage}` : defaultAvatar}
                            alt={`${post.userName ? post.userName : "User"}'s avatar`}
                        />
                        <span>{post.userName} / {post.gw2_account_name}</span>
                    </div>
                    <h3 onClick={() => navigate(`/posts/${post.id}`)}>{post.title}</h3>
                    <p>{post.content.substring(0, 100)}...</p>
                    {currentUserId && post.user_id === currentUserId && (
                        <button onClick={() => handleDeletePost(post.id)} title="Supprimer poste">❌</button>
                    )}
                    {posts.length - 1 !== posts.indexOf(post) && (
    <hr className="hr-style" />
)}
                </div>
            ))}

            {/* Footer */}
            <div className="footer">
                <p>Contact: lpeyramaure@eduvaud.ch</p>
                <p>Nombre d'inscrits: 451</p>
                <p>Nombre de posts: 645</p>
            </div>
        </div>
    );
}

export default DisplayPosts;
