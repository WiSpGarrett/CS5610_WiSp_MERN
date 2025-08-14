import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Login from './Login';
import Logout from './Logout';

function Navigation({ user, setUser }) {
  // Top navigation with conditional links based on auth state.
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">WiSp Photo Gallery</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/map">Map</Nav.Link>
                <Nav.Link as={Link} to="/upload">Upload</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="ms-auto">
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, {user.name}!
                </Navbar.Text>
                <Logout 
                  setUser={setUser} 
                  clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID} 
                />
              </>
            ) : (
              <Login setUser={setUser} />
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 