import React from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@material-ui/core/Button';
import { Main } from './Main';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './hooks/userContext';
import { SnackbarProvider } from 'notistack';



function App() {

  
  return (
    <div className="App">
      <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
        <UserProvider>
        <SnackbarProvider maxSnack={3}>

          <Main />
          </SnackbarProvider>

        </UserProvider>
      </GoogleOAuthProvider>

    </div>
  );
}

export default App;
