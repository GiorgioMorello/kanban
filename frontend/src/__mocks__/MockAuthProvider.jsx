import {createContext, useState, useEffect, useContext, useMemo} from 'react';
import useRefreshToken from "../hooks/useRefreshToken.jsx";
import {AuthContext} from "../context/AuthContext.jsx";


export default function MockAuthProvider({children, user=null, accessToken}){




    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            setUser: () => {},
            setAccessToken: () => {},
            refreshToken: null,
            setRefreshToken: () => {},
            csrftoken: null,
            setCsrfToken: () => {},
            wasLoggedOut: null,
            setWasLoggedOut: () => {},
        }}>
            {children}
        </AuthContext.Provider>
    )



}
