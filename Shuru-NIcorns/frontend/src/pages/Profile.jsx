import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Modal, Box, Typography, Button } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [apiKey, setApiKey] = useState('');
  const [about, setAbout] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [customModels, setCustomModels] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && user.email) {
      fetchCustomModels();
      const storedAbout = localStorage.getItem('about');
      if (storedAbout) {
        setAbout(storedAbout);
      }
    }
  }, [isAuthenticated, user]);

  const fetchCustomModels = async () => {
    try {
      const response = await axios.post('https://cortex-rnd0.onrender.com/user_models', {
        email: user.email
      });
      setCustomModels(response.data.models);
    } catch (error) {
      console.error('There was an error fetching the custom models!', error);
    }
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleAboutChange = (event) => {
    setAbout(event.target.value);
  };

  const handleSubmitAbout = () => {
    setIsEditing(false);
    localStorage.setItem('about', about);
    toast.success('About section updated successfully!');
  };

  const handleEditAbout = () => {
    setIsEditing(true);
  };

  const handleSubmitApiKey = () => {
    axios.post('https://cortex-rnd0.onrender.com/update_api_key', {
      email: user.email,
      api_key: apiKey
    })
    .then(response => {
      toast.success('API key updated successfully!');
      setIsEditingApiKey(false);
    })
    .catch(error => {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key.');
    });
  };

  const handleEditApiKey = () => {
    setIsEditingApiKey(true);
  };

  const handleLogout = () => {
    logout({ returnTo: 'https://cortex-sable.vercel.app/' });
  };

  const handleDeleteModel = async (modelName) => {
    try {
      const response = await axios.post('https://cortex-rnd0.onrender.com/delete_model', {
        model_name: modelName,
        email: user.email,
        username: user.name
      });
      toast.success(response.data.message);
      fetchCustomModels(); // Refresh custom models after deletion
    } catch (error) {
      console.error('Error deleting model:', error.response.data.error);
      toast.error(`Failed to delete model: ${error.response.data.error}`);
    }
  };

  const handleOpenModal = (model) => {
    setCurrentModel(model);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleChat = (modelName) => {
    const formatModelName = (name) => {
      return name.replace(/\s+/g, '_').toLowerCase();
    };

    const modelNameToSend = formatModelName(modelName);
    navigate(`/chat/${modelNameToSend}`);
    toast.info(`Initiating chat with ${modelName}`);
    setOpen(false);
  };

  const formatModelName = (name) => {
    return name.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className='profile-page'>
      <ToastContainer />
      <nav>
        <ul className="icon-list">
          <div className="list">
            <div className="list1">
              <li>
                <Link to="/home">
                  <HomeOutlinedIcon sx={{ width: "40px", color: "gray", '&:hover': { color: 'white' } }} />
                </Link>
              </li>
            </div>
            <div className="list2">
              <li>
                <Link to="/playground">
                  <SmartToyIcon sx={{ color: "gray", '&:hover': { color: 'white' } }} />
                </Link>
              </li>
              <li>
                <AccountCircleOutlinedIcon />
              </li>
            </div>
          </div>
        </ul>
      </nav>
      <div className='profile-container'>
        {isAuthenticated && (
          <div className='profile-details'>
            <div className='profile-left'>
              <div className='profile-photo'>
                {user.picture && (
                  <img src={user.picture} alt="Profile" />
                )}
              </div>
              <div className='api-key-section'>
                <label htmlFor="apiKey">Enter your API key:</label>
                {isEditingApiKey ? (
                  <div>
                    <input
                      type="password"
                      id="apiKey"
                      name="apiKey"
                      value={apiKey}
                      onChange={handleApiKeyChange}
                    />
                    <button className='api-submit-btn' onClick={handleSubmitApiKey}>Submit</button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="password"
                      id="apiKey"
                      name="apiKey"
                      value={apiKey}
                      disabled
                    />
                    <button className='api-edit-btn' onClick={handleEditApiKey}>Edit</button>
                  </div>
                )}
                <p>This API key can be used for accessing specific services or APIs.</p>
              </div>
              <div className='user-details'>
                <p>Name: {user.name}</p>
                <p>Nickname: {user.nickname}</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
            <div className='profile-right'>
              <div className='about-section'>
                <h3>About</h3>
                {isEditing ? (
                  <div>
                    <textarea
                      value={about}
                      onChange={handleAboutChange}
                      placeholder="Tell us about yourself..."
                    />
                    <button className='about-submit-btn' onClick={handleSubmitAbout}>Submit</button>
                  </div>
                ) : (
                  <div>
                    <ReactMarkdown>{about}</ReactMarkdown>
                    <button className='about-edit-btn' onClick={handleEditAbout}>Edit</button>
                  </div>
                )}
              </div>
              <div className='custom-models-section'>
                <h3>Your Custom Models</h3>
                <ul>
                  {customModels.slice().reverse().map((model, index) => (
                    <li key={index} className="model-item">
                      <span>{formatModelName(model.name)}</span>
                      <DeleteOutlineIcon
                        style={{ marginLeft: '10px', cursor: 'pointer', color: 'red' }}
                        onClick={() => handleDeleteModel(model.name)}
                      />
                      <Button onClick={() => handleOpenModal(model)}>Chat</Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        <button className='logout-btn' onClick={handleLogout}>Logout</button>
      </div>

      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-model-title"
        aria-describedby="modal-model-description"
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, bgcolor: 'black', border: '1px solid gray', boxShadow: 24, p: 4, borderRadius: '5%', padding: "50px",
          background: "rgba(12, 12, 12, 0.70)", backdropFilter: "blur(75px)"
        }}>
          <Typography variant="h5" sx={{ color: 'white', fontFamily: "Manrope" }}>
            {currentModel.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'white', fontFamily: "Manrope" }}>
            {currentModel.description}
          </Typography>
          <Button
            sx={{ mt: 2, bgcolor: "#0C0C0CB2", border: "1px solid orange", width: "120px", borderRadius: "10px", color: "white" }}
            onClick={() => handleChat(currentModel.name)}
          >
            Start Chat
          </Button>
          <Button
            sx={{ mt: 2, bgcolor: "transparent", border: "1px solid white", width: "120px", borderRadius: "10px", color: "white", marginLeft: "5px" }}
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default Profile;
