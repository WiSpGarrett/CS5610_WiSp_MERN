import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function Login({ setUser }) {
  // Handle successful Google auth, decode token and store.
  const onSuccess = async (res) => {
    const tokenData = jwtDecode(res.credential);

    let dbId = null;
    try {
      // Lookup the user on the backend, save to DB if they don't exist.
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/login`,
        {
          googleId: tokenData.sub,
          email: tokenData.email,
          name: tokenData.name
        }
      );
      dbId = response?.data?.user?.id || response?.data?.user?._id || null;
      console.log('User saved to database:', response.data);
    } catch (error) {
      console.error('Error saving user to database:', error);
    }

    // Minimal user state.
    const loginData = {
      dbId,
      googleId: tokenData.sub,
      email: tokenData.email,
      name: tokenData.name,
      picture: tokenData.picture,
    };

    setUser(loginData);
    localStorage.setItem('login', JSON.stringify(loginData));
    console.log('Login Success: currentUser:', loginData);
  };

  // Log basic error information for failed Google auth attempts.
  const onFailure = (res) => {
    console.log('Login failed: res:', res);
  };

  return (
    <div>
      <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
    </div>
  );
}

export default Login;