// HOOKS
import React, {useState, useContext, useEffect, useRef} from 'react';
import {useLocation, useParams, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";


// Components
import Input from './input/Input.jsx'
import {Link} from 'react-router-dom'
import Timer from './Timer.jsx'
import styles from './VerifyEmailForm.module.css'
import Alert from "../utils/Alert.jsx";



// Context
import {useAuthContext} from "../context/AuthContext.jsx";
import {axios_instance} from "../axios/Index.jsx";


export default function VerifyEmailForm({set_error, errors, url_code}) {

    function get_is_timer_end_from_local_storage(){
        return localStorage.getItem("is_timer_end") === "true";
    }

    const [is_timer_end, setIsTimerEnd] = useState(get_is_timer_end_from_local_storage())
    const [timer_display, setTimerDisplay] = useState("5:00");
    const [user_otp, setUserOtp] = useState("");
    const [is_otp_filled, setIsOtpFilled] = useState(false);
    const {setUser, user, setAccessToken, setRefreshToken} = useAuthContext()
    const [success_msg, setSuccessMsg] = useState("");
    const send_alert = Alert();



    const navigate = useNavigate();




     // Caso o usuário não tenha inserido o código de confirmação, o input submit será bloqueado
    useEffect(()=>{
        setIsOtpFilled(user_otp.length >= 8);

    }, [user_otp]);



    async function handle_submit(e){
        e.preventDefault();

        if(user_otp.length !== 8) {
            set_error("Código Inválido");
            return
        }

        try {

            const resp = await axios_instance.post(`user/otp-verification/`,
                    {url_code, otp_code: user_otp}
            );




            if (resp.status === 200){
                localStorage.removeItem("otp_timer");
                localStorage.removeItem("is_timer_end");


                setAccessToken(resp.data.access);
                setUser(jwtDecode(resp.data.access));

                navigate("/dashboard")
                send_alert("Conta criada com sucesso", "success");


            }


        }
        catch (e) {
            const resp = e.response
            if(resp.status === 404) {
                console.log(resp.data?.detail)
                set_error(resp.data?.detail);
                return
            }
            set_error(resp.data);

        }







    }


    async function resend_otp_code(e){
        e.preventDefault();
        localStorage.removeItem("otp_timer");
        localStorage.setItem("is_timer_end", 'false');

        setIsTimerEnd(false);
        set_error(null);
        setSuccessMsg(null)

        try {

            const resp = await axios_instance.patch(`user/otp-verification/`, {url_code, otp_code: user_otp})

            const data = resp.data;

            if(resp.status === 200) {
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

            <Timer setTimerDisplay={setTimerDisplay} is_timer_end={is_timer_end} set_is_timer_end={setIsTimerEnd}/>

            <form data-testid={'verify_email_form'} onSubmit={handle_submit} className={styles.otp_form}>
                <div className={'form_title'}>
                    <h2 style={{fontSize: "2.8rem", textAlign: "center"}}>Insira o código de confirmação de E-mail</h2>
                </div>
                <div className={styles.field_group}>
                    <Input type='text' name='otp' placeholder={'Insira o código'} handle_on_change={(e)=>setUserOtp(e.target.value)}/>
                </div>

                {errors && (
                    <span className='error_msg'>{errors}</span>
                )}
                <input data-testid={'verify_email_submit_btn'} disabled={!is_otp_filled} className={`submit_btn ${styles.btn} ${is_otp_filled ? styles.btn_active : styles.btn_disabled}`} type={'submit'} value='Entrar'/>


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