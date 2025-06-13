import React, {useContext} from 'react';
import styles from './NavBar.module.css';
import {NavLink, Link} from 'react-router-dom';
import {useAuthContext} from "../../context/AuthContext.jsx";
import {jwtDecode} from "jwt-decode";
import useAxiosPrivate from "../../hooks/useAxiosPrivate.jsx";
import {useNavigate} from "react-router-dom";


export default function NavBar(){

    const {setWasLoggedOut, accessToken, setAccessToken, setUser, setCsrfToken } = useAuthContext();
    const navigate  = useNavigate();
    const axios_private_instance = useAxiosPrivate();



    if (accessToken) {
        const decoded = jwtDecode(accessToken);
        //var user_id = decoded.user_id;
    }

        async function logout_user() {
            const resp = await axios_private_instance.post('user/logout/');
            if(resp.status === 204){
                setWasLoggedOut(true)
                setCsrfToken(null);
                setAccessToken(null);
                setUser(null);

                navigate('/login');
            }
        }


    return (

        <nav className={styles.navbar_bg}>

            <div className={`wrapper ${styles.navbar_container}` }>
                <div className={styles.logo}>
                    <Link to='/'>
                        <img src='/frontend/public/clipboard.png' />
                    </Link>

                </div>

                <div>
                    <ul className={styles.nav_links}>
                        {!accessToken && (
                           <>
                           <li>
                                <NavLink to='/login'>Login</NavLink>
                            </li>
                            <li>
                                <NavLink to='/register'>Criar conta</NavLink>
                            </li>

                            <li>
                                <NavLink to='/'>Home</NavLink>
                            </li>
                           </>
                        )}

                        {accessToken && (
                            <>
                                <li>
                                    <NavLink to='/dashboard'>Dashboard</NavLink>
                                </li>
                                <li>
                                    <button onClick={logout_user} className={styles.nav_btn}>Sair</button>
                                </li>

                                <li>
                                    <NavLink to='/your-profile'>Seu Perfil</NavLink>
                                </li>

                            </>
                        )}



                    </ul>
                </div>

            </div>

        </nav>
    )
}