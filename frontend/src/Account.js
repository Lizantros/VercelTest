import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import logo from "./images/logo.svg"; // Import the logo image
function Account() {
  const [userInfo, setUserInfo] = useState({});
  const [gw2ApiKey, setGw2ApiKey] = useState("");
  const [gw2AccountInfo, setGw2AccountInfo] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);


  const handleDisconnect = () => {
    // Clear user session, local storage, or any state management
    localStorage.removeItem("token");
    // Navigate to login or home page
    navigate('/');
  };


  // Define fetchUserInfoAndImage outside useEffect
  const fetchUserInfoAndImage = async () => {
    const token = localStorage.getItem("token");
    try {
      // Fetch User Information
      const userInfoResponse = await axios.get("http://localhost:5500/user-info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(userInfoResponse.data);
  
      // Fetch User Image
      if (userInfoResponse.data.id) {
        const userImageResponse = await axios.get(`http://localhost:5500/get-user-image/${userInfoResponse.data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'text' // Ensure the response is treated as a text
        });
        setUserInfo({ ...userInfoResponse.data, compteImage: `data:image/jpeg;base64,${userImageResponse.data}` });
      }
    } catch (error) {
      console.error("Error fetching user info or image:", error);
    }
  };

  const navigateToForum = () => {
    navigate('/forum'); // Navigate to /forum route
};
  
  useEffect(() => {
    fetchUserInfoAndImage();
  }, []);
  
  const handleProfileImageClick = () => {
    fileInputRef.current.click(); // Triggers the file input click
  };

  const handleGw2ApiKeyChange = (e) => {
    setGw2ApiKey(e.target.value);
  };

  const fetchGw2AccountInfo = async () => {
    try {
      const url = `https://api.guildwars2.com/v2/account?access_token=${encodeURIComponent(gw2ApiKey)}`;
      const response = await axios.get(url);
      setGw2AccountInfo(response.data);

      if (!userInfo.gw2AccountName) {
        await updateGw2AccountName(response.data.name);
      }
    } catch (error) {
      console.error("Error fetching GW2 account info:", error);
    }
  };

  const updateGw2AccountName = async (gw2AccountName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5500/update-gw2-account-name",
        { gw2AccountName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserInfo({ ...userInfo, gw2AccountName: gw2AccountName });
    } catch (error) {
      console.error("Error updating GW2 account name:", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleSubmitImage(selectedFile); // Submit the image as soon as it's selected
    }
  };

  const handleSubmitImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file); // Use the file directly

    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5500/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Image uploaded successfully");
      fetchUserInfoAndImage(); // Refresh user info to show updated image path
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
      <div 
        onClick={handleDisconnect}
        style={{
          position: 'absolute',
          top: '5vh',
          right: '5vw',
          color: 'red',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
        Disconnect
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={logo} alt="Logo" style={{ width: '200px', height: '200px' }} onClick={navigateToForum} /> {/* Add the logo image */}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    {userInfo.compteImage ? (
        <img 
            src={`http://localhost:5500/${userInfo.compteImage}`} 
            alt="User" 
            style={{ width: '150px', height: '150px', borderRadius: '50%', border: '2px solid red', objectFit: 'cover' }}
            onClick={handleProfileImageClick}
        />
    ) : (
        <div 
            style={{ width: '150px', height: '150px', borderRadius: '50%', border: '2px solid red', backgroundColor: 'grey', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={handleProfileImageClick}
        >
            {/* You can put text or an icon here */}
        </div>
    )}
</div>


      {/* Hidden File Input */}
      <input 
        type="file" 
        onChange={handleImageChange} 
        style={{ display: 'none' }} 
        ref={fileInputRef}
      />

      <p>
        <strong>{userInfo.name}</strong>{" / "}
        <strong>{userInfo.gw2AccountName || (gw2AccountInfo && `${gw2AccountInfo.name}`)}</strong>
      </p>

      {/* GW2 API Key Input */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Entrez votre clé API GW2"
          value={gw2ApiKey}
          onChange={handleGw2ApiKeyChange}
          style={{ border: '1px solid red', borderRadius: '5px', marginBottom: '10px' }}
        />
        <button onClick={fetchGw2AccountInfo} style={{ backgroundColor: 'white', border: '1px solid red', borderRadius: '5px' }}>
          ✓
        </button>
      </div>
    </div>
  );
}

export default Account;
