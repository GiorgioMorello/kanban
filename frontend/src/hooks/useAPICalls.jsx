import useAxiosPrivate from "../hooks/useAxiosPrivate.jsx";
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../context/AuthContext.jsx";

export default function useAPICalls() {
    const {setWasLoggedOut, setAccessToken, setUser, setCsrfToken} = useAuthContext();
    const axios_private_instance = useAxiosPrivate();
    const navigate = useNavigate();

    async function logout() {
        const resp = await axios_private_instance.post('user/logout/');
        if (resp.status === 204) {
            navigate('/login');
            setWasLoggedOut(true);
            setCsrfToken(null);
            setAccessToken(null);
            setUser(null);
        }
    }

    return {logout};
}
