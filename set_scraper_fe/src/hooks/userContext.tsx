import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface UserInfo {
  [key: string]: any; // Adjust this type according to what userInfo will hold
}

interface UserContextType {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
}

// Provide a default value for the context
const defaultUserContextValue: UserContextType = {
  userInfo: {}, // Default value for userInfo
  setUserInfo: () => {}, // Placeholder function
};

// Create a context with the default value
export const UserContext = createContext<UserContextType>(defaultUserContextValue);

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
