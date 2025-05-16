import {axios_private_instance} from "../axios/Index.jsx";
import {useEffect} from "react";
import {useAuthContext} from '../context/AuthContext.jsx'
import useRefreshToken from "./useRefreshToken.jsx";
import {jwtDecode} from "jwt-decode";


export default function useAxiosPrivate(){

    const {accessToken, setAccessToken, setCsrfToken, csrftoken, setUser, user} = useAuthContext();
    const refresh = useRefreshToken();

    useEffect(()=>{

        const request_intercept = axios_private_instance.interceptors.request.use(
            (config)=>{
                if(!config.headers["Authorization"]){
                    config.headers["Authorization"] = "Bearer " + accessToken
                    //config.headers["X-CSRFToken"] = csrftoken
                }

                config.headers["X-CSRFToken"] = csrftoken

                return config
            },

            (error)=>{
                return Promise.reject(error)
            }

        )



        const response_intercept = axios_private_instance.interceptors.response.use(
            response => response, // Caso a response seja de sucesso, apenas retorna ela normalmente
            async (error)=>{
                const prev_request = error?.config
                if(!prev_request.sent && ([401, 403].includes(error.response?.status))){
                    prev_request.sent = true
                    const {access_token: new_access_token, csrftoken: new_csrftoken} = await refresh();
                    setAccessToken(new_access_token);
                    setUser(jwtDecode(new_access_token))


                    prev_request.headers['Authorization'] = "Bearer " + new_access_token
                    prev_request.headers['X-CSRFToken'] = new_csrftoken
                    console.log(new_csrftoken)


                    return axios_private_instance(prev_request) // Refaz a request original, agora com os tokens novos.

                }
                return Promise.reject(error)
            }


        );


        return ()=>{
            axios_private_instance.interceptors.request.eject(request_intercept)
            axios_private_instance.interceptors.response.eject(response_intercept)
        }

    }, [accessToken, user])




    return axios_private_instance

}