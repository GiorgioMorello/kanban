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


export default function VerifyEmail() {

    const url_code = useParams().url_code;
    const baseURL = 'http://127.0.0.1:8000/';
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

                const resp = await fetch(`${baseURL}user/otp-verification/?url_code=${url_code}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                const data = await resp.json();

                if (resp.ok) {
                    console.log(data);


                } else {
                    console.log(data);
                    if(data.detail){
                        setError(data.detail);
                    } else {
                        setError(data.Error)
                    }


                    if (data.detail === 'True') {
                        localStorage.removeItem("is_timer_end")
                        localStorage.removeItem("otp_timer");
                        navigate("/login");

                        Swal.fire({
                            title: "E-mail já confirmado ou Código invalido",
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
                        })

                    }




                }

            } catch (e) {
                console.log(e)
                setError(e.message);

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