import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

const Login = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home'); // Navigate to the home page after login
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className='login'>
      <Typography sx={{ fontFamily: "Manrope", textAlign: "center", fontSize:"50px",color:"white" }}>
      Build, Chat, Innovate with AI
      </Typography>
      <button
        onClick={loginWithRedirect} 
        style={{ fontFamily: "Manrope", 
          backgroundColor:"transparent", 
          borderRadius:"10px",
          border:"2px solid orange", 
          padding:"20px", 
          fontSize:"20px" }}
      >
        Access Here
      </button>
    </div>
  );
}

export default Login;
