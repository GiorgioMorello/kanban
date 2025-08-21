// HOOKS
import React, {useState, useContext, useEffect,} from 'react';
import {useLocation} from "react-router-dom";
import {useNavigate} from "react-router-dom";

// Components
import Input from '../../components/input/Input.jsx'
import {Link} from 'react-router-dom'

// Context
import {AuthContext} from "../../context/AuthContext.jsx";


import styles from './auth_form.module.css'
import {axios_instance} from "../../axios/Index.jsx";
import Alert from '../../utils/Alert.jsx'
import SubmitButton from "../../components/input/SubmitButton.jsx";


export default function RegisterPage() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_2, setPassword_2] = useState('');
    const [error, setError] = useState(null);
    const [disableSubmit, setDisableSubmit] = useState(false);

    const navigate = useNavigate();



    const location = useLocation(); // URL atual


    function handle_username(e) {
        setUsername(e.target.value);
    }

    function handle_email(e) {
        setEmail(e.target.value);
    }

    function handle_password(e) {
        setPassword(e.target.value);
    }

    function handle_password_2(e) {
        setPassword_2(e.target.value);
    }


    async function handle_submit(e) {
        e.preventDefault();
        setDisableSubmit(true)

        try {
            const resp = await axios_instance.post("user/register/", {username, email, password, password_2});
            if (resp.status === 201) {

                setEmail("");
                setPassword("");
                navigate(`/verify-email/${resp.data.url_code}`);
                const send_alert = Alert();
                send_alert("Foi enviado um código para seu e-mail", "success");

            }
        } catch (e) {

            const resp = e.response;

            if (resp) {
                setError(resp.data);
            }
            else {
                setError('Não foi possivel criar a conta')
            }
        }
        finally {
            setDisableSubmit(false)
        }


    }




    return (

        <div className={styles.register_container}>

            <div className={styles.form_container}>


                <div className={styles.img_side_form}>

                    <div className={styles.side_img}>
                    </div>

                    <form data-testid={'register_form'} onSubmit={handle_submit} className={styles.register_form}>
                        <div className='form_title'>
                            <h2 data-testid={'register_page_title'} >Bem vindo ao HelpTask</h2>
                            <p>Criar conta</p>
                        </div>

                        <div className={styles.field_group}>




                            {error?.username && <span className='error_msg'>{error.username}</span>}
                            <Input name='username' type='text' required={true} label_text='Nome de usuário'
                                   placeholder='Digite seu nome de usuário' handle_on_change={handle_username}/>
                        </div>


                        <div className={styles.field_group}>


                            {error?.email && <span className='error_msg'>{error.email[0]}</span>}
                            <Input name='email' type='email' required={true} label_text='E-mail'
                                   placeholder='Digite seu E-mail' handle_on_change={handle_email}/>
                        </div>


                        <div className={styles.field_group}>
                            {error?.password && <span className='error_msg'>{error.password}</span>}
                            <Input name='password' type='password' required={true} label_text='Senha'
                                   placeholder='Digite sua senha' handle_on_change={handle_password}/>
                        </div>

                        <div className={styles.field_group}>
                            <Input name='password_2' type='password' required={true} label_text='Confirme sua senha '
                                   placeholder='Digite sua senha novamente' handle_on_change={handle_password_2}/>
                        </div>

                        {error && typeof(error) === 'string' && <span className='error_msg'>{error}</span>}

                        <SubmitButton disable_submit={disableSubmit} data_testid='register_form_submit_btn' />

                        <div className={styles.useful_links}>
                            <span>Já possui uma conta? </span><Link to='/login'> Faça login aqui</Link>
                        </div>
                    </form>


                </div>

            </div>

        </div>
    )
}