import React from 'react';
import { googleLogout } from '@react-oauth/google';

function Logout({ setUser, clientId }) {
  // Clear Google session and local app state.
  const logOut = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('login');
    console.log('Logout made successfully');
  };

  return (
    <div>
      <button onClick={logOut}
              type="button"
              className="btn btn-light">
        Log out
      </button>
    </div>
  );
}

export default Logout;