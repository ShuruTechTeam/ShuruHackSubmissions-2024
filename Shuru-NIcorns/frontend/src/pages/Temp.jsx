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
import { useNavigate, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './searchbar.css'


const Temp = () => {
  const [open, setOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState({ name: '', description: '', goal: '' });
  const [models, setModels] = useState([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, loginWithRedirect, logout, isLoading, error, isAuthenticated } = useAuth0();

  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  // const fetchModels = () => {
  //   axios.get('https://cortex-rnd0.onrender.com/models')
  //     .then(response => {
  //       const allModels = [ ...response.data.custom_models];
  //       setModels(allModels);
  //     })
  //     .catch(error => {
  //       console.error('There was an error fetching the models!', error);
  //     });
  // };

  const fetchModels = () => {
    axios.get('https://cortex-rnd0.onrender.com/models')
      .then(response => {
        // Remove underscores from custom model names and reverse the array to show latest first
        const allModels = response.data.custom_models
          .map(model => ({
            ...model,
            name: model.name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
          }))
          .reverse(); // Reverse the array
  
        setModels(allModels);
        setFilteredModels(allModels);
      })
      .catch(error => {
        console.error('There was an error fetching the models!', error);
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
    // Ensure email is included in the currentAgent object
    const agentData = {
      ...currentAgent,
      email: user.email, // Assuming user.email is available from Auth0
      username: user.name
    };

    axios.post('https://cortex-rnd0.onrender.com/create_model', agentData)
      .then(response => {
        fetchModels(); // Refresh models after creating a new one
        toast.success('Agent created successfully! Find your agents in AI Playground!');
        navigate('/playground');
      })
      .catch(error => {
        console.error('Error creating agent:', error);
        toast.error('Failed to create agent.');
      });

    setOpen(false);
  };

  // const handleChat = () => {
  //   if (isGroupChat) {
  //     if (selectedModels.length === 0) {
  //       alert('Please select at least one model for group chat.');
  //       return;
  //     }
  //     const selectedModelNames = selectedModels.join(',');
  //     navigate(`/group-chat/${selectedModelNames}`);
  //   } else {
  //     navigate(`/chat/${currentAgent.name}`);
  //   }
  //   setOpen(false);
  // };

  const handleChat = () => {
    const formatModelName = (name) => {
      return name.replace(/\s+/g, '_').toLowerCase();
    };
  
    let modelNameToSend = formatModelName(currentAgent.name);
  
    if (isGroupChat) {
      
      if (selectedModels.length === 0) {
        alert('Please select at least one model for group chat.');
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
        //alert('You can select up to 3 models for group chat.');
        toast.warn('You can select only up to 3 models for group chat at a time.');
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
      // Add cases for other models as needed
      default:
        return null;
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    filterModels(event.target.value);
  };

  const filterModels = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filteredData = models.filter(model =>
      model.name.toLowerCase().includes(lowercasedQuery) ||
      model.description.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredModels(filteredData);
  };

  return (
    <div className={`home ${open ? 'blurry-background' : ''}`}>
       <ToastContainer />
      <div className='hidden-container'>sorry your device is incompatible...</div>
      <div className="container">
        
        <div className="box1">
          <nav>
            <ul className="icon-list">
              <div className="list">
                <div className="list1" style={{ color: "gray",position:"fixed" }}>
                  <Tooltip title="Home" placement="right">
                  <li><Link to="/home"><HomeOutlinedIcon sx={{width:"40px", color:"gray",'&:hover': { color: 'white'}}} /></Link></li>
                  </Tooltip>
                  <Tooltip title="Create New Agent" placement="right">
                    <li onClick={() => handleOpen({ name: '', description: '', goal: '' }, true)}><AddCircleOutlineIcon /></li>
                  </Tooltip>
                 
                  <Tooltip title="Group Chat" placement="right">
                          <li onClick={() => {
                            setIsGroupChat(!isGroupChat);
                            //alert('GROUP CHAT mode enabled.Select the desired models and click on Chat button');
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
                <div className="list2" style={{ color: "gray", marginTop:"530px",position:"fixed"  }}>
                  <Tooltip title="Playground" placement="right">
                  <li><Link to="/playground"><SmartToyIcon sx={{color:"gray",'&:hover': { color: 'white'}}}/></Link></li>
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
          <h1 className="main-title" style={{ fontFamily: "Manrope", fontWeight: "400", color: "white", textAlign:"center" }}>AI Playground</h1>
          <h3 className="sub-title" style={{ fontFamily: "Manrope", fontWeight: "400", color: "white" ,textAlign:'center'}}>Discover and engage with bespoke models crafted by creators worldwide.</h3>
          {/* <Searchbar  />  onChange={handleChange} */}

          <div class="searchBox">
            <input className="searchInput" type="text" name="" placeholder="Search Your Agents" 
            value={searchQuery}
            onChange={handleSearchInputChange}
            />

            <button  
            className="searchButton" href="#">
             <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none">
  <g clip-path="url(#clip0_2_17)">
    <g filter="url(#filter0_d_2_17)">
      <path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"></path>
    </g>
  </g>
  <defs>
    <filter id="filter0_d_2_17" x="-0.418549" y="3.70435" width="29.7139" height="29.7139" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
      <feOffset dy="4"></feOffset>
      <feGaussianBlur stdDeviation="2"></feGaussianBlur>
      <feComposite in2="hardAlpha" operator="out"></feComposite>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_17"></feBlend>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_17" result="shape"></feBlend>
    </filter>
    <clipPath id="clip0_2_17">
      <rect width="28.0702" height="28.0702" fill="white" transform="translate(0.403503 0.526367)"></rect>
    </clipPath>
  </defs>
</svg>
 </button>
</div>

          </div>
          <div className="scrollable-content">
          <div className="boxes" style={{ marginTop: "40px", paddingBottom:"40px" }}>
          
          {/* {filteredAgents.map((model, index) => ( */}
            {filteredModels.map((model, index) => (
            
              <div key={index} className={`agents ${selectedModels.includes(model.name) ? 'selected' : ''}`} onClick={() => !isGroupChat && handleOpen(model)} >
                <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedModels.includes(model.name)}
                        onChange={() => handleModelSelection(model.name)}
                        disabled={!isGroupChat && selectedModels.length > 0}
                        sx={{
                          
                           top:"53px", left:"195px"
                        }}
                      />
                    }
                  label={
                    <div className="agent-details" style={{marginLeft:"-30px"}}>
                      <div className="agent-icon">
                        {getAgentIcon(model.name)} 
                      </div>
                      <div className="agent-text" style={{marginTop:"-15px",width:"200px"}}>
                        <h3 style={{ color: 'white',fontFamily:"Manrope",fontWeight:"300" }}>{model.name}</h3>
                        <p style={{ color: '#d0d0d0', marginTop:"-3px",fontFamily:"Montserrat",fontWeight:"200" }}>{model.description}</p>
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
          backgroundColor:"transparent", 
          borderRadius:"10px",
          border:"2px solid orange", 
          padding:"10px", 
          fontSize:"16px",
          width: "110px",
          marginLeft:"800px",
          }}
          onClick={() => logout({ returnTo:'https://cortex-sable.vercel.app/'})}>Logout</button>
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
          width: 600, bgcolor: 'black', border: '1px solid gray', boxShadow: 24, p: 4, borderRadius: '5%', padding:"50px",
          background: "rgba(12, 12, 12, 0.70)", backdropFilter: "blur(75px)"}}>
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'white', fontFamily:"Manrope" }}>
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
      WebkitTextFillColor: 'white !important',  // Ensures compatibility across browsers
    }
            }}
            disabled={!isCreating} // Disable input if not creating
          />

          <Typography variant="subtitle1" sx={{ mt: 2, color: 'white' , fontFamily:"Manrope" }}>
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
      WebkitTextFillColor: 'white !important',  // Ensures compatibility across browsers
    }
            }}
            disabled={!isCreating} // Disable input if not creating
          />

          {isCreating && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, color: 'white', fontFamily:"Manrope" }}>
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
              sx={{ mt: 2,bgcolor:"#0C0C0CB2", border:"1px solid orange", width:"120px", borderRadius:"10px",color:"white" }}
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

export default Temp;
