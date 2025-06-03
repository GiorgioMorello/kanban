import {Route, Navigate, Routes} from "react-router-dom";
import {AuthContext} from '../context/AuthContext.jsx';
import {useContext, useRef} from "react";
import useRefreshToken from "../hooks/useRefreshToken.jsx";
import {useState, useEffect} from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate.jsx";
import {jwtDecode} from "jwt-decode";
import Alert from "./Alert.jsx";



export default function PrivateRoute({ children }){
    const {user, accessToken, setUser, setWasLoggedOut, wasLoggedOut} = useContext(AuthContext);

    const refresh = useRefreshToken()
    const [loading, setLoading] = useState(true)
    const axios_private_instance = useAxiosPrivate();
    const send_alert = Alert();



    useEffect(() => {
        let isMounted = true

        async function verifyUser() {
            try {
                // Primeiro tenta renovar o token
                const { access_token: newAccessToken } = await refresh();

                // Depois verifica a autenticação
                const resp = await axios_private_instance.get('user/is-authenticated/');

                if (resp.data && newAccessToken) {
                    setUser(jwtDecode(newAccessToken));
                }

            } catch (error) {
                console.log(error?.response)
            } finally {
                isMounted && setLoading(false)
            }
        }

        verifyUser();

        return () => {
            isMounted = false
        }
    }, [])




    if(loading){
        return <p>Loading</p>
    }

    //Caso usuário faça Loggout
    if(!loading && wasLoggedOut){
        setWasLoggedOut(false)
        return <Navigate to={'/login'} />
    }

    if(!loading && (!accessToken || !user)) {

        send_alert("Faça login para visualizar essa página", "error");

        return <Navigate to={'/login'} />
    }
    else if(!loading){
        return children
    }




}