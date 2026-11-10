
import React, { createContext, useState, useEffect,ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  username: string | null;
  setUsername: (username:string | null) => void;
  subscriptions: string[] | null;
  setSubscriptions: (subscriptions:string[] | null) => void;
  notifications: any[] | null;
  setNotifications: (subscriptions:any[] | null) => void;
}

interface AuthProviderProps {
    children: ReactNode;  // This will tell TypeScript that 'children' is expected
  }

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  username: null,
  setUsername: () => {},
  subscriptions: null,
  setSubscriptions: () => {},
  notifications: null,
  setNotifications: () => {} 
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(sessionStorage.getItem('username'));
  // const [subscriptions, setSubscriptions] = useState<string[] | null>(localStorage.getItem('subscriptions'));
  const [subscriptions, setSubscriptions] = useState<string[] | null>(
    sessionStorage.getItem('subscriptions') ? JSON.parse(sessionStorage.getItem('subscriptions')!) : null
  );

  const [notifications, setNotifications] = useState<any[] | null>(
    sessionStorage.getItem('notifications') ? JSON.parse(sessionStorage.getItem('notifications')!) : null
  );



  useEffect(() => {
    console.log('UE', token);
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      console.log('No token, removing item from local storage');
      sessionStorage.removeItem('token');
    }
  }, [token]);
  console.log('Sec',token);

  console.log("Auth username",username);

  useEffect(() => {
    if (username) {
      sessionStorage.setItem('username', username);
      setUsername(username);
    } else {
      sessionStorage.removeItem('username');
    }
  }, [username]);

  console.log(subscriptions);

  useEffect(() => {
    if (subscriptions) {
      console.log("Oh yeah!");
      console.log(subscriptions);
      sessionStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    } else {
      sessionStorage.removeItem('subscriptions');
    }
  }, [subscriptions]);


  useEffect(() => {
    if (notifications) {
      console.log("auth notifications", JSON.stringify(notifications));
      sessionStorage.setItem('notifications', JSON.stringify(notifications));
    } else {
      sessionStorage.removeItem('notifications');
    }
  }, [notifications]);



  return (
    <AuthContext.Provider value={{ token, setToken, username, setUsername, subscriptions, setSubscriptions, notifications , setNotifications }}>
      {children}
    </AuthContext.Provider>
  );
};
