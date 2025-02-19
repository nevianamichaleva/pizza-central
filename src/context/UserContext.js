'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, rtdb } from '../../lib/firebase';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = ref(rtdb, `users/${currentUser.uid}`);
        const userDoc = await get(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.val();
          setUserDetails(userData);

          if (userData.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          console.log('No user details found in Realtime Database');
        }
      } else {
        setUser(null);
        setUserDetails(null);
        setIsAdmin(false); 
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, userDetails, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};


