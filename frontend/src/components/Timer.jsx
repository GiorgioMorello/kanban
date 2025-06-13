// HOOKS
import React, {useState, useContext, useEffect, useRef} from 'react';

// Components
import Input from './input/Input.jsx'


// Context
import {AuthContext} from "../context/AuthContext.jsx";
import styles from './VerifyEmailForm.module.css'


export default function Timer(props) {
    const timer_ref = useRef(null);

    const {user} = useContext(AuthContext);







    function create_timer() {
        const DURATION = 5 * 60 * 1000


        let exp_timer = localStorage.getItem("otp_timer");

        if (!exp_timer) {
            exp_timer = Date.now() + DURATION
            localStorage.setItem("otp_timer", exp_timer);
            localStorage.setItem("is_timer_end", 'false')
        } else {
            exp_timer = parseInt(exp_timer);
        }

        return exp_timer
    }



    useEffect(() => {
        const is_timer_end = localStorage.getItem("is_timer_end");


        if(is_timer_end === 'true' || props.is_timer_end){
            return
        }
        let exp_timer = create_timer();


        function update_timer() {
            const time_left = exp_timer - Date.now();

            if (time_left <= 1000) {

                clearInterval(timer_ref.current);
                localStorage.setItem("is_timer_end", 'true');
                localStorage.removeItem("otp_timer");
                props.set_is_timer_end(true);
                console.log(props.is_timer_end);


                return 0
            }

            const minutes = Math.floor(time_left / 60000);
            const seconds = Math.floor((time_left % 60000) / 1000);
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
            const formattedTimer = `${minutes}:${formattedSeconds}`;
            props.setTimerDisplay(formattedTimer);

        }

        // Chama imediatamente para evitar 1s de delay
        update_timer();

        timer_ref.current = setInterval(update_timer, 1000);


        return () =>
        {
            clearInterval(timer_ref.current);
        }

    }, [props.is_timer_end]);


    return null
}