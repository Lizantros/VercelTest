import React, { useState } from 'react';
import axios from 'axios';
import logo from "./images/logo.svg"; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for title length
    if (title.length > 50) {
        setError('Title is too long. Maximum length is 50 characters.');
        return;
    }

    if (!title.trim() || !content.trim()) {
        setError('Title and content cannot be empty.');
        return;
    }

    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login.');
      return;
    }

    try {
      await axios.post('https://gw2test-5b5b5deabf74.herokuapp.com/create-post', { title, content }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccess('Post created successfully');
      navigate('/forum');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error creating post. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/forum');
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh', // Adjust the height as needed
    gap: '20px', // Space between elements
  };

  const inputStyle = {
    border: '1px solid red',
    borderRadius: '15px', // More rounded corners
    width: '300px', // Fixed width for both title and content fields
    padding: '10px',
    margin: '10px 0', // Margin for spacing
  };

  const buttonStyle = {
    marginTop: '10px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '15px',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={formStyle}>
        <img src={logo} alt='Logo' style={{ maxWidth: '150px', marginBottom: '20px' }} />
        <h2>Create a Post</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                maxLength={50}  // Set the maximum length for the title input
            />
            <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{...inputStyle, height: '100px'}}
            />
            <button type="submit" style={buttonStyle}>Créer</button>
            <p onClick={handleCancel} style={{marginTop: '10px', color: 'red', cursor: 'pointer' }}>Annuler</p>
        </form>
    </div>
);
}

export default CreatePost;