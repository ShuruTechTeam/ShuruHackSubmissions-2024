import React from 'react';
import './Page404.css';

const Page404 = () => {
  return (
    <div className='page'  >
      <img src="/animation2.gif" alt="Rotating Logo" className="rotating-image" />
      <p style={{fontFamily:"Manrope", color:"white", fontSize:"30px", textAlign:"center"}}>
      Oops! Looks like you've taken a wrong turn.</p> 
    </div>
  );
}

export default Page404;
