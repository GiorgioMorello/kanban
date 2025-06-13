import useRefreshToken from "../hooks/useRefreshToken.jsx";
import {AuthContext} from "../context/AuthContext.jsx";
import {vi} from "vitest";


export const mockSetUser = vi.fn();
export const mockSetAccessToken = vi.fn();

export default function MockAuthProvider({children, user=null, accessToken}){




    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            setUser: mockSetUser,
            setAccessToken: mockSetAccessToken,
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
