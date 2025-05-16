// HOOKS
import React, {useState, useContext, useEffect, useRef} from 'react';
import {useLocation, useParams, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";


// Components
import Input from '../components/Input.jsx'
import {Link} from 'react-router-dom'
import Timer from './Timer.jsx'
import styles from './VerifyEmailForm.module.css'
import Alert from "../utils/Alert.jsx";



// Context
import {AuthContext} from "../context/AuthContext.jsx";
import {axios_instance} from "../axios/Index.jsx";


export default function VerifyEmail({set_error, errors, url_code}) {

    const [is_timer_end, setIsTimerEnd] = useState(false);
    const [timer_display, setTimerDisplay] = useState("5:00");
    const [user_otp, setUserOtp] = useState("");
    const [is_otp_filled, setIsOtpFilled] = useState(false);
    const {setUser, user, setAccessToken, setRefreshToken} = useContext(AuthContext);
    const [success_msg, setSuccessMsg] = useState("");
    const send_alert = Alert();



    const navigate = useNavigate();

    const submit_ref = useRef(null);


    const baseURL = 'http://127.0.0.1:8000/';


     // Caso o usuário não tenha inserido o código de confirmação, o input submit será bloqueado
    useEffect(()=>{
        setIsOtpFilled(user_otp.length > 1);

        if (submit_ref && user_otp.length > 1){
            submit_ref.current.disable = false
        }

    }, [user_otp]);



    async function handle_submit(e){
        e.preventDefault();

        if(user_otp.length !== 8) {
            set_error("Código Inválido");
            return
        }

        try {

            const resp = await axios_instance.post(`${baseURL}user/otp-verification/`,
                    {url_code, otp_code: user_otp}
            );

            console.log(resp.status)

            if (resp.status === 200){
                setIsTimerEnd(true);
                setAccessToken(resp.data.access);
                setUser(jwtDecode(resp.data.access));
                console.log("FOI")
                localStorage.removeItem("otp_timer");

                send_alert("Conta criada com sucesso", "success")


                navigate("/dashboard")

            }
            else {
                if(data.detail === 'True'){
                    set_error("Código inválido");
                    return
                }
                set_error(data)

            }

        }
        catch (e) {
            console.log(e);
        }





    }


    async function resend_otp_code(e){
        e.preventDefault();
        localStorage.setItem("is_timer_end", false)
        localStorage.removeItem("otp_timer");
        setIsTimerEnd(false);
        set_error(null);
        setSuccessMsg(null)

        try {

            const resp = await fetch(`${baseURL}user/otp-verification/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({url_code, otp_code: user_otp})
                })

            const data = await resp.json();

            if(resp.ok) {
                console.log(data)
                setSuccessMsg(data);

            }
            else {
                set_error(data)
            }



        }
        catch (e) {
            console.log(e);
        }

    }






    return (

        <div className={styles.otp_form_container}>

            {success_msg && (
                    <span className='success_msg'>{success_msg}</span>
                )}

            <Timer setTimerDisplay={setTimerDisplay} setIsTimerEnd={setIsTimerEnd} is_timer_end={is_timer_end} />

            <form onSubmit={handle_submit} className={styles.otp_form}>
                <div className={'form_title'}>
                    <h2 style={{fontSize: "2.8rem", textAlign: "center"}}>Insira o código de confirmação de E-mail</h2>
                </div>
                <div className={styles.field_group}>
                    <Input type='text' name='otp' placeholder={'Insira o código'} handle_on_change={(e)=>setUserOtp(e.target.value)}/>
                </div>

                {errors && (
                    <span className='error_msg'>{errors}</span>
                )}
                <input ref={submit_ref} className={`submit_btn ${styles.btn} ${is_otp_filled ? styles.btn_active : styles.btn_disabled}`} type={'submit'} value='Entrar'/>


                <div className={styles.resend_otp}>
                    <button onClick={resend_otp_code} disabled={!is_timer_end} className={`${styles.resend_btn} ${is_timer_end ? styles.btn_active : styles.btn_disabled }`}>
                        {
                            is_timer_end ? "Reenviar código"
                            : `Reenviar código em ${timer_display} minutos`
                        }

                    </button>
                </div>
            </form>


        </div>

    )
}