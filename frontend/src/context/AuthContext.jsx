import {createContext, useState, useEffect, useContext, useMemo} from 'react';
import useRefreshToken from "../hooks/useRefreshToken.jsx";


export const AuthContext = createContext({
    user: {},
    setUser: ()=>{},
    accessToken: null,
    setAccessToken: ()=>{},
    refreshToken: {},
    setRefreshToken: ()=>{},
    csrftoken: null,
    setCsrfToken: ()=>{},
    wasLoggedOut: null,
    setWasLoggedOut: ()=>{}

});



export function AuthProvider({children}){


    const [user, setUser] = useState();
    const [accessToken, setAccessToken] = useState();
    const [refreshToken, setRefreshToken] = useState();
    const [csrftoken, setCsrfToken] = useState();
    const [wasLoggedOut, setWasLoggedOut] = useState();

    const contextValue = useMemo(() => ({
        user, setUser,
        accessToken, setAccessToken,
        refreshToken, setRefreshToken,
        csrftoken, setCsrfToken,
        wasLoggedOut, setWasLoggedOut,
    }), [user, accessToken, refreshToken, csrftoken]); // Só recria quando estas dependências mudam





    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )



}

export function useAuthContext(){
    return useContext(AuthContext);
}