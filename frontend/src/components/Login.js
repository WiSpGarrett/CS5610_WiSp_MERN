import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function Login({ setUser }) {
  const onSuccess = async (res) => {
    var tokenData = jwtDecode(res.credential);
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/login`,
        {
          googleId: tokenData.sub,
          email: tokenData.email,
          name: tokenData.name
        }
      );
      console.log('User saved to database:', response.data);
    } catch (error) {
      console.error('Error saving user to database:', error);
    }
    
    var loginData = {
      googleId: tokenData.sub,
      ...tokenData
    };
    setUser(loginData);
    localStorage.setItem("login", JSON.stringify(loginData));
    console.log('Login Success: currentUser:', loginData);
  };

  const onFailure = (res) => {
    console.log('Login failed: res:', res);
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onFailure}
      />
    </div>
  );
}

export default Login;