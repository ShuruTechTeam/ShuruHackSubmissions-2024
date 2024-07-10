import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import DrawIcon from '@mui/icons-material/Draw';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ScienceIcon from '@mui/icons-material/Science';
import ExploreIcon from '@mui/icons-material/Explore';
import EventIcon from '@mui/icons-material/Event';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { TextField, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Home.css';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState({ name: '', description: '', goal: '' });
  const [models, setModels] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);

  const { user, loginWithRedirect, logout, isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
    if (isAuthenticated) {
      createUser();
    }
  }, [isAuthenticated]);

  const fetchModels = () => {
    axios.get('https://cortex-rnd0.onrender.com/models')
      .then(response => {
        const allModels = [...response.data.predefined_models];
        setModels(allModels);
      })
      .catch(error => {
        console.error('There was an error fetching the models!', error);
      });
  };

  const createUser = () => {
    const userData = {
      email: user.email,
      username: user.name
    };

    axios.post('https://cortex-rnd0.onrender.com/user', userData)
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          console.log(error.response.data.error);
        } else {
          console.error('There was an error creating the user!', error);
        }
      });
  };

  const handleOpen = (agent, creating = false) => {
    setCurrentAgent(agent);
    setIsCreating(creating);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    const agentData = {
      ...currentAgent,
      email: user.email, // Adding user's email to the agent data
      username: user.name
    };

    axios.post('https://cortex-rnd0.onrender.com/create_model', agentData)
      .then(response => {
        console.log(response.data.message);
        fetchModels(); // Refresh models after creating a new one
        toast.success('Agent created successfully! Find your agents in AI Playground!');
        navigate('/playground');
      })
      .catch(error => {
        console.error('There was an error creating the agent!', error);
        toast.error('Error creating the agent.');
      });

    setOpen(false);
  };

  const handleChat = () => {
    const formatModelName = (name) => {
      return name.replace(/\s+/g, '_').toLowerCase();
    };

    let modelNameToSend = formatModelName(currentAgent.name);

    if (isGroupChat) {
      if (selectedModels.length === 0) {
        toast.warn('Please select at least one model for group chat.');
        return;
      }
      const selectedModelNames = selectedModels.map(model => formatModelName(model)).join(',');
      navigate(`/group-chat/${selectedModelNames}`);
    } else {
      navigate(`/chat/${modelNameToSend}`);
    }
    setOpen(false);
  };

  const handleModelSelection = (modelName) => {
    setSelectedModels((prevSelectedModels) => {
      if (prevSelectedModels.includes(modelName)) {
        return prevSelectedModels.filter((name) => name !== modelName);
      } else if (prevSelectedModels.length < 3) {
        return [...prevSelectedModels, modelName];
      } else {
        toast.warn('You can select up to 3 models for group chat.');
        return prevSelectedModels;
      }
    });
  };

  const getAgentIcon = (modelName) => {
    switch (modelName.toLowerCase()) {
      case 'personal trainer':
        return <FitnessCenterIcon style={{ color: 'white' }} />;
      case 'investment advisor':
        return <ShowChartIcon style={{ color: 'white' }} />;
      case 'scientist':
        return <ScienceIcon style={{ color: 'white' }} />;
      case 'writer':
        return <DrawIcon style={{ color: 'white' }} />;
      case 'news editor':
        return <NewspaperIcon style={{ color: 'white' }} />;
      case 'wellness consultant':
        return <LocalHospitalIcon style={{ color: 'white' }} />;
      case 'event coordinator':
        return <EventIcon style={{ color: 'white' }} />;
      case 'travel coordinator':
        return <ExploreIcon style={{ color: 'white' }} />;
      case 'creative content strategists':
        return <FaceRetouchingNaturalIcon style={{ color: 'white' }} />;
      default:
        return null;
    }
  };

  return (
    <div className={`home ${open ? 'blurry-background' : ''}`}>
      <ToastContainer />
      <div className='hidden-container'>Sorry, your device is incompatible...</div>
      <div className="container">
        <div className="box1">
          <nav>
            <ul className="icon-list">
              <div className="list">
                <div className="list1" style={{ color: "gray", position: "fixed" }}>
                  <Tooltip title="Home" placement="right">
                    <li><Link to="/home"><HomeOutlinedIcon sx={{ width: "40px", color: "gray", '&:hover': { color: 'white' } }} /></Link></li>
                  </Tooltip>
                  <Tooltip title="Create New Agent" placement="right">
                    <li onClick={() => handleOpen({ name: '', description: '', goal: '' }, true)}><AddCircleOutlineIcon /></li>
                  </Tooltip>
                  <Tooltip title="Group Chat" placement="right">
                    <li onClick={() => {
                      setIsGroupChat(!isGroupChat);
                      toast.info('GROUP CHAT mode enabled. Select the desired models and then click on START GROUP CHAT icon!');
                    }}>
                      <GroupAddOutlinedIcon />
                    </li>
                  </Tooltip>
                  {isGroupChat && (
                    <Tooltip title={isGroupChat ? 'Start Group Chat' : 'Chat'} placement="right">
                      <li onClick={handleChat}><ChatOutlinedIcon /></li>
                    </Tooltip>
                  )}
                </div>
                <div className="list2" style={{ color: "gray", marginTop: "530px", position: "fixed" }}>
                  <Tooltip title="Playground" placement="right">
                    <li><Link to="/playground"><SmartToyIcon sx={{ color: "gray", '&:hover': { color: 'white' } }} /></Link></li>
                  </Tooltip>
                  <Tooltip title="Account" placement="right">
                    <li><Link to="/profile"><AccountCircleOutlinedIcon sx={{ width: "40px", color: "gray", '&:hover': { color: 'white' } }} /></Link></li>
                  </Tooltip>
                </div>
              </div>
            </ul>
          </nav>
        </div>

        <div className="box2" style={{ marginTop: "20px" }}>
          <div className="fixed-header">
            <h1 className="main-title" style={{ fontFamily: "Manrope", fontWeight: "400", color: "white" }}>Discover Your Perfect AI Companion</h1>
            {isAuthenticated && (
              <h3 className="user-name" style={{ fontFamily: "Manrope", fontWeight: "400", color: "white", textAlign: 'center' }}>Welcome, {user.name}!</h3>
            )}
          </div>
          <div className="scrollable-content">
            <div className="boxes" style={{ marginTop: "40px", paddingBottom: "40px" }}>
            {models.map((model, index) => (
                <div key={index} className={`agents ${selectedModels.includes(model.name) ? 'selected' : ''}`} onClick={() => !isGroupChat && handleOpen(model)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedModels.includes(model.name)}
                        onChange={() => handleModelSelection(model.name)}
                        disabled={!isGroupChat && selectedModels.length > 0}
                        sx={{
                          top: "53px", left: "220px"
                        }}
                      />
                    }
                    label={
                      <div className="agent-details" style={{ marginLeft: "-30px" }}>
                        <div className="agent-icon">
                          {getAgentIcon(model.name)} {/* Function to get corresponding icon */}
                        </div>
                        <div className="agent-text" style={{ marginTop: "-15px", width: "200px" }}>
                          <h3 style={{ color: 'white', fontFamily: "Manrope", fontWeight: "300" }}>{model.name}</h3>
                          <p style={{ color: '#d0d0d0', marginTop: "-3px", fontFamily: "Montserrat", fontWeight: "200" }}>{model.description}</p>
                        </div>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='box3'>
          <button className='logout'
            style={{
              fontFamily: "Manrope",
              backgroundColor: "transparent",
              borderRadius: "10px",
              border: "2px solid orange",
              padding: "10px",
              fontSize: "16px",
              width: "110px",
              marginLeft: "800px",
            }}
            onClick={() => logout({ returnTo: 'https://cortex-sable.vercel.app/' })}>Logout</button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-agent-title"
        aria-describedby="modal-agent-description"
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, bgcolor: 'black', border: '1px solid gray', boxShadow: 24, p: 4, borderRadius: '5%', padding: "50px",
          background: "rgba(12, 12, 12, 0.70)", backdropFilter: "blur(75px)"
        }}>
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'white', fontFamily: "Manrope" }}>
            Agent Name
          </Typography>
          <TextField
            fullWidth
            placeholder='Agent Name'
            name="name"
            value={currentAgent.name}
            onChange={handleChange}
            margin="normal"
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: 'black',
                color: 'white',
                borderRadius: '15px',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'gray',
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputLabel-shrink': {
                color: 'white',
              },
              '& .Mui-disabled': {
                color: 'white !important',
                WebkitTextFillColor: 'white !important',
              }
            }}
            disabled={!isCreating} // Disable input if not creating
          />

          <Typography variant="subtitle1" sx={{ mt: 2, color: 'white', fontFamily: "Manrope" }}>
            Agent Description
          </Typography>
          <TextField
            fullWidth
            placeholder='Agent Description'
            name="description"
            value={currentAgent.description}
            onChange={handleChange}
            margin="normal"
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: 'black',
                color: 'white',
                borderRadius: '15px',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'gray',
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              '& .MuiInputLabel-shrink': {
                color: 'white',
              },
              '& .Mui-disabled': {
                color: 'white !important',
                WebkitTextFillColor: 'white !important',
              }
            }}
            disabled={!isCreating} // Disable input if not creating
          />

          {isCreating && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, color: 'white', fontFamily: "Manrope" }}>
                Your Goal
              </Typography>
              <TextField
                fullWidth
                placeholder='Your Goal'
                name="goal"
                value={currentAgent.goal}
                onChange={handleChange}
                margin="normal"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: '15px',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-shrink': {
                    color: 'white',
                  },
                }}
              />
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              sx={{ mt: 2, bgcolor: "#0C0C0CB2", border: "1px solid orange", width: "120px", borderRadius: "10px", color: "white" }}
              onClick={isCreating ? handleCreate : handleChat}
            >
              {isCreating ? 'Create' : 'Chat'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Home;

