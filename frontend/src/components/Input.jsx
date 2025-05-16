import React from 'react';
import {NavLink, Link} from 'react-router-dom'
import styles from './Input.module.css'


export default function Input({type, placeholder, name, label_text, required=false, handle_on_change, value, input_ref}){



    return (


            <label className={styles.input_container} htmlFor={name}>
                <span>{label_text}</span>
                <input ref={input_ref} value={value} type={type} placeholder={placeholder} id={name} name={name} required={required} onChange={handle_on_change}/>
            </label>



    )
}
