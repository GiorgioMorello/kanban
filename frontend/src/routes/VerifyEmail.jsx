// HOOKS
import React, {useState, useContext, useEffect,} from 'react';
import {useLocation, useParams, useNavigate} from "react-router-dom";

// Components
import Input from '../components/Input.jsx'
import {Link} from 'react-router-dom'
import VerifyEmailForm from "../components/VerifyEmailForm.jsx";

// Context
import styles from './VerifyEmail.module.css'
import Swal from "sweetalert2";
import {AuthContext} from "../context/AuthContext.jsx";
import {axios_instance} from "../axios/Index.jsx";


export default function VerifyEmail() {

    const url_code = useParams().url_code;
    const navigate = useNavigate()
    const {user} = useContext(AuthContext);
    const [should_render, setShouldRender] = useState(false)

    const [error, setError] = useState("");


    // 1ª Verificar se o token é valido
    useEffect(() => {

        if(user){
            navigate("/dashboard");
            return
        }

        setShouldRender(true)

        async function verify_url() {
            try {

                const resp = await axios_instance.get(`user/otp-verification/?url_code=${url_code}`);

                const data = resp.data;

                if (resp.status === 200) {
                    console.log(data);

                }


            } catch (e) {
                const resp = e.response;
                if(resp.data.auth){
                        setError(resp.data.auth);
                }
                else {
                        setError(resp.data)
                    }

            }


        }

        verify_url();

    }, []);

    if(!should_render)  return null


    return (


        <div className={styles.verify_email_container}>


            <VerifyEmailForm set_error={setError} errors={error} url_code={url_code}
                             />


        </div>
    )
}