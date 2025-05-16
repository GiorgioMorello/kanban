import {axios_instance} from "../axios/Index.jsx";
import {useAuthContext} from '../context/AuthContext.jsx'


export default function useRefreshToken(){

    const {setAccessToken, setCsrfToken} = useAuthContext()



    async function refresh(){
        const resp = await axios_instance.post('user/token/refresh/', {

        });
        setAccessToken(resp.data.access);
        //console.log(resp.data.access)
        setCsrfToken(resp.headers["x-csrftoken"]);

        return {access_token: resp.data.access, csrftoken: resp.headers['x-csrftoken']}
    }



    return refresh

}