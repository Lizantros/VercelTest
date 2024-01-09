import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import logo from "./images/logo.svg";
import { jwtDecode } from 'jwt-decode';
import defaultAvatar from './images/default-avatar.png'; 
import './PostDetail.css'; 

// Component for displaying the details of a post
function PostDetail() {
    const [post, setPost] = useState(null); // State to store the post
    const [responses, setResponses] = useState([]); // State to store the responses
    const [responseContent, setResponseContent] = useState(''); // State to store the content of the response
    const { postId } = useParams(); // Get the postId from the URL parameters
    const navigate = useNavigate(); // Hook for navigation

    // Function to navigate to the forum page
    const navigateToForum = () => {
        navigate('/forum'); // Navigate to /forum route
    };

    // Fetch the post and responses from the server
    useEffect(() => {
        const fetchPostAndResponses = async () => {
            try {
                const { data } = await axios.get(`https://gw2test-5b5b5deabf74.herokuapp.com/api/posts/${postId}`);
                setPost(data.post);
                setResponses(data.responses);
            } catch (error) {
                console.error('Error fetching post and responses:', error);
            }
        };

        fetchPostAndResponses();
    }, [postId]);

    // Get the userId from the JWT token
    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.userId;
    }

    // Function to handle the submission of a response
    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        const trimmedContent = responseContent.trim();

        if (!trimmedContent) {
            alert('la réponse ne doit pas être vide');
            return;
        }

        try {
            await axios.post(`https://gw2test-5b5b5deabf74.herokuapp.com/posts/${postId}/responses`, { content: trimmedContent }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setResponses([...responses, { content: trimmedContent }]);
            setResponseContent('');
        } catch (error) {
            console.error('Error submitting response:', error);
        }
    };

    // Function to handle the deletion of a response
    const handleDeleteResponse = async (responseId) => {
        try {
            await axios.delete(`https://gw2test-5b5b5deabf74.herokuapp.com/posts/${postId}/responses/${responseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setResponses(responses.filter(response => response.id !== responseId));
        } catch (error) {
            console.error('Error deleting response:', error);
        }
    };
    
    // If the post is not loaded yet, show a loading message
    if (!post) {
        return <div>Loading...</div>;
    }

    return (
        <div className="main-container">
            {/* Main Content */}
            <div className="content-container">
                {/* Header */}
                <div className="header">
                    <img src={logo} alt='Logo' className="logo" onClick={navigateToForum} />
                    <span className="account-link" onClick={() => navigate('/account')}>Mon compte</span>
                </div>

                {/* Post Title and Details */}
                <div className="post-container">
                    <img
                        src={post.compteImage ? `https://gw2test-5b5b5deabf74.herokuapp.com/${post.compteImage}` : defaultAvatar}
                        alt={`${post.userName ? post.userName : "User"}'s avatar`}
                        className="user-image"
                    />
                    <div className="text-content">
                        <h1 style={{ color: 'red' }}>{post.title}</h1>
                        <p><strong>{post.userName} / {post.gw2_account_name}</strong></p>
                        <p>{post.content}</p>
                    </div>
                </div>
                <hr className="red-line" />

                {/* Responses */}
                {responses.map((response, index) => (
                    <React.Fragment key={response.id}>
                        {index > 0 && <hr className="red-line" />}
                        <div className="response-container">
                            <img
                                src={response.compteImage ? `https://gw2test-5b5b5deabf74.herokuapp.com/${response.compteImage}` : defaultAvatar}
                                alt={`${response.name ? response.name : "User"}'s avatar`}
                                className="user-image"
                            />
                            <div className="text-content">
                                <p><strong>{response.name} / {response.gw2_account_name}</strong></p>
                                <p>{response.content}</p>
                            </div>
                            {response.user_id === userId && (
                                <button 
                                    onClick={() => handleDeleteResponse(response.id)}
                                    className="delete-button"
                                    title="Delete Response"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    </React.Fragment>
                ))}

                {/* Response Form */}
                <form onSubmit={handleSubmitResponse} className="response-form">
                    <textarea
                        value={responseContent}
                        onChange={(e) => setResponseContent(e.target.value)}
                        className="response-textarea"
                    />
                    <button type="submit" className="response-submit-button">Poster réponse</button>
                </form>
            </div>

            {/* Footer */}
            <div className="footer">
                <p>Contact: lpeyramaure@eduvaud.ch</p>
                <p>Nombre d'inscrits: 451</p>
                <p>Nombre de posts: 645</p>
            </div>
        </div>
    );
}

export default PostDetail;