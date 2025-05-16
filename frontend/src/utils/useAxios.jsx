import {useNavigate} from "react-router-dom";
import axios from 'axios';
import {jwtDecode} from "jwt-decode";
import dayjs from "dayjs";
import {useContext} from "react";
import {AuthContext} from '../context/AuthContext.jsx';
import Swal from "sweetalert2";


const baseURL = 'http://127.0.0.1:8000/';

export default function useAxios(){

    const {authTokens, setUser, setAuthTokens, logout_user} = useContext(AuthContext);
    const navigate = useNavigate()

    const axiosInstance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authTokens?.access}`
        }
    })


    // Antes de fazer uma requisição
    axiosInstance.interceptors.request.use(async req =>{
        const user = jwtDecode(authTokens?.access);
        const refresh = jwtDecode(authTokens?.refresh);
        /*
        * dayjs.unix(user.exp): converte o timestamp UNIX (user.exp) em um objeto de data,
        * dayjs(): cria um objeto de data representando o momento atual.
        * .diff(dayjs()): calcula a diferença entre a data de expiração (user.exp) e a data atual (em milissegundos).
        * Se a diferença for menor que 1 milisegundo, o token ja expirou
        * */
        const is_expired = dayjs.unix(user.exp).diff(dayjs()) < 1;
        const is_refresh_token_expired = dayjs.unix(refresh.exp).diff(dayjs()) < 1;

        console.log(is_refresh_token_expired, is_expired)


        // Se o refresh token estiver expirado
        if(is_refresh_token_expired) {
            console.log('expirou');
            logout_user();
            Swal.fire({
                    title: "Sua sessão expirou, faça login novamente",
                    icon: "error",
                    toast: true,
                    timer: 4000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    grow: false,
                    heightAuto: false,
                    customClass: {
                        popup: 'small_toast'
                    }
                });
            return
        }

        // Se o access token não estiver expirado
        if(!is_expired) return req;



        // Se o access token estiver expirado
        const resp = await axios.post(`${baseURL}user/token/refresh/`, {
            refresh: authTokens?.refresh,
        });
        if(resp.ok){
            console.log('hello')
        }


        const tokens = {refresh: authTokens?.refresh, access: resp.data.access}
        localStorage.setItem("auth_token", JSON.stringify(tokens));

        setAuthTokens(tokens)
        setUser(jwtDecode(resp.data.access))

        req.headers['Authorization '] = `Bearer ${resp.data.access}`;
        return req

        //req.headers['Authorization'] = `Bearer ${authTokens?.access}`;






    })

    return axiosInstance
}