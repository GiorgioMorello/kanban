import React, {useState, useContext, useEffect} from 'react';
import Input from '../../components/input/Input.jsx';
import SubmitButton from '../../components/input/SubmitButton.jsx';
import styles from './auth_form.module.css';
import {Link, useNavigate} from 'react-router-dom';
import {AuthContext} from "../../context/AuthContext.jsx";
import {axios_instance} from "../../axios/Index.jsx";
import {jwtDecode} from "jwt-decode";
import Alert from "../../utils/Alert.jsx";

export default function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {setAccessToken, setUser, setCsrfToken, accessToken, user} = useContext(AuthContext);
    const [error, setError] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(false);


    const navigate = useNavigate()


    function handle_email(e) {
        setEmail(e.target.value);
    }

    function handle_password(e) {
        setPassword(e.target.value);
    }


    async function handle_submit(e) {
        e.preventDefault();
        setDisableSubmit(true);

        try {
            const resp = await axios_instance.post("user/login/", {email, password});
            if (resp.status === 200) {

                setAccessToken(resp.data.access);
                setUser(jwtDecode(resp.data.access));
                setCsrfToken(resp.headers['x-csrftoken']);

                setEmail("");


                setPassword("");


                navigate('/dashboard');
                const send_alert = Alert();
                send_alert("Login feito com sucesso", "success");

            }
        }
        catch (e) {

            const resp = e.response;

            if(resp) {
                setError(resp.data.detail);
                // console.log(resp.data.detail)
            } else {
                setError('Não foi possivel fazer login')
            }
        }

        finally {
            setDisableSubmit(false)
        }



    }


    useEffect(() => {

        if (user || accessToken) {
            navigate('/dashboard');
        }
    }, [])


    return (

        <div className={styles.register_container}>

            <div className={styles.form_container}>


                <div className={styles.img_side_form}>

                    <div className={styles.side_img}>
                    </div>

                    <form data-testid={'login_form'} onSubmit={handle_submit} className={styles.register_form}>
                        <div className='form_title'>
                            <p data-testid={'login_page_title'}>log-in</p>
                        </div>


                        <div className={styles.field_group}>
                            <Input value={email} name='email' type='email' required={true} label_text='E-mail'
                                   placeholder='Digite seu E-mail' handle_on_change={handle_email}/>
                        </div>

                        <div className={styles.field_group}>
                            <Input name='password' type='password' required={true} label_text='Senha'
                                   placeholder='Digite sua senha' handle_on_change={handle_password}/>
                        </div>

                        {error && <span className='error_msg'>{error}</span>}

                        <SubmitButton disable_submit={disableSubmit} data_testid='login_form_submit_btn' />

                        <div className={styles.useful_links}>
                            <span>Não possui uma conta? </span><Link to='/register'> Crie aqui</Link>
                        </div>
                    </form>


                </div>

            </div>

        </div>
    )
}