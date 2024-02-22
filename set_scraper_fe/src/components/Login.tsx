import React, { useContext, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { UserContext } from '../hooks/userContext';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const Login = () => {
    const { userInfo, setUserInfo } = useContext(UserContext);

    useEffect(() => {
        // Initialize user info from cookies if available
        const accessToken = Cookies.get('accessToken');
        const googleId = Cookies.get('googleId'); // Assuming you're also storing the Google ID in a cookie
        if (accessToken && !userInfo.accessToken && googleId) {
            setUserInfo({ accessToken, googleId });
        }
    }, [setUserInfo, userInfo.accessToken]);

    const handleLoginSuccess = async (tokenResponse) => {
        const accessToken = tokenResponse.access_token;
        const expires = new Date(new Date().getTime() + tokenResponse.expires_in * 1000);

        // Use the access token to request the user's profile information from Google
        try {
            const googleUserInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const googleId = googleUserInfoResponse.data.id; // This is the user's Google ID
            // Set the access token and Google ID in cookies
            Cookies.set('accessToken', accessToken, { expires });
            Cookies.set('googleId', googleId, { expires });

            setUserInfo({ accessToken, googleId });

            // Send the Google ID to your backend to associate the refresh token
            // and any other necessary data with the user
            await axios.post(API_URL + '/api/store-token', { googleId, accessToken });

        } catch (error) {
            console.error('Error fetching Google user info:', error);
        }
    };

    const signOut = () => {
        Cookies.remove('accessToken');
        Cookies.remove('googleId');
        setUserInfo({});
        // Optionally, inform your backend about the logout
    };

    const login = useGoogleLogin({
        onSuccess: handleLoginSuccess,
        onError: errorResponse => console.log(errorResponse),
        scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
    });

    useEffect(() => {
        // Refresh token logic
        const interval = setInterval(async () => {
            const now = new Date().getTime();
            if (userInfo.expires_at && userInfo.expires_at - now < 5 * 60 * 1000) { // 5 minutes before expiring
                try {
                    const response = await axios.post('/api/refresh-token', { googleId: userInfo.googleId });
                    const { access_token, expires_in } = response.data;
                    const expires = new Date(now + expires_in * 1000);
                    Cookies.set('accessToken', access_token, { expires });
                    setUserInfo(current => ({ ...current, accessToken: access_token }));
                } catch (error) {
                    console.error('Error refreshing token:', error);
                }
            }
        }, 60 * 1000); // Check every minute

        return () => clearInterval(interval);
    }, [userInfo, setUserInfo]);

    return (
        <>
{!userInfo.accessToken ? (
    <button 
        onClick={() => login()} 
        id="login-button"
        style={{
            // backgroundColor: '#4285F4', 
            // background: "transparent",
            // color: 'white', 
            // border: "1px solid cyan", 
            borderRadius: '4px', 
            padding: '10px 24px', 
            cursor: 'pointer', 
            // fontFamily: 'Roboto, sans-serif', 
            fontWeight: '500',
            fontSize: '16px',
            // boxShadow: '0 2px 4px 0 rgba(0,0,0,0.25)'
        }}>
        LOGIN
    </button>
) : (
    <button 
        onClick={signOut} 
        id="logout-button"
        style={{
            // backgroundColor: '#DB4437', 
            // background: "transparent",
            // color: 'white', 
            // border: "1px solid pink", 
            borderRadius: '4px', 
            padding: '10px 24px', 
            cursor: 'pointer', 
            // fontFamily: 'Roboto, sans-serif', 
            fontWeight: '500',
            fontSize: '16px',
            // boxShadow: '0 2px 4px 0 rgba(0,0,0,0.25)'
        }}>
        LOGOUT
    </button>
)}

        </>
    );
};

export default Login;
