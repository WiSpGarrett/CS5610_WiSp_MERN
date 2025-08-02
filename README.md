# CS5610_WiSp_MERN

Photo gallery web application with location mapping capabilities.

## Project URLs
- Frontend: [https://wisp-photo-gallery-map.ue.r.appspot.com](https://wisp-photo-gallery-map.ue.r.appspot.com)
- Backend: [https://api-dot-wisp-photo-gallery-map.ue.r.appspot.com](https://api-dot-wisp-photo-gallery-map.ue.r.appspot.com)

## Progress Summary - Iteration 1

### Completed Features
- **Project Structure**: Monorepo setup with separate frontend and backend directories
- **Basic Routing**: Homepage, Map, Upload, and Profile pages with React Router
- **Google Authentication**: Working login/logout using Google OAuth 2.0
- **Database Setup**: MongoDB Atlas connection with User and Photo schemas
- **User Management**: Backend API to save/retrieve user data from database
- **Deployment**: Both frontend and backend deployed to Google App Engine
- **Navigation**: Navbar with conditional routing based on login status

### Issues Resolved
- **Dependency Conflicts**: Had issues on version conflicts with deprecated `react-google-login` package, transplanted login/logout code from movie website
- **Deployment Issues**: Resolved Google Cloud Build errors and environment variable configuration, staging folder got corrupted and had to nuke it.  Also tripped up on separating two directories into two services within Google Cloud.
- **Build Process**: Fixed frontend build not updating after code changes because of the staging issues
- **Package Dependecies**: Switched from npm to yarn for frontend to resolve peer dependency issues

### Current Status
- Google login working on the deployed build
- User data successfully saving to MongoDB Atlas upon first login
- Basic UI structure complete with placeholder pages, conditional upon being logged in

### Screenshots

### MongoDB Atlas - User Data Successfully Stored
![MongoDB Users Collection](screenshots/mongodb-users.png)
*Shows user data being successfully saved to MongoDB Atlas after Google login*

### Frontend - Login State
![Login Button](screenshots/login-page.png)
*Homepage showing Google login button for unauthenticated users*

### Frontend - Authenticated State  
![Authenticated Dashboard](screenshots/authenticated.png)
*Full navigation bar visible after successful login with Map, Upload, Profile links and user welcome message*

### Next Steps - Iteration 2
- Implement photo upload and delete functionality + drag and drop
- Add photo gallery/carousel display
- Integrate map view with photo location data
- Implement user upload limitations based on DB (to ensure I stay in the free tier for storage)

---------------------------------------------------------------------------------------------------
