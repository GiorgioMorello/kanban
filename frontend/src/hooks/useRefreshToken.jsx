import {axios_instance} from "../axios/Index.jsx";
import {useAuthContext} from '../context/AuthContext.jsx'


export default function useRefreshToken(){

    const {setAccessToken, setCsrfToken} = useAuthContext()



    async function refresh(){

        try {
            const resp = await axios_instance.post('user/token/refresh/', {});

            setAccessToken(resp.data.access);
            setCsrfToken(resp.headers["x-csrftoken"]);

            return {access_token: resp.data.access, csrftoken: resp.headers['x-csrftoken']}

        } catch (e) {
            console.error("Erro ao renovar token:", error?.response?.data);
            return { access_token: null, csrftoken: null };
        }

    }



    return refresh

}