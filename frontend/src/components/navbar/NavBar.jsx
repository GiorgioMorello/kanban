import React, {useContext} from 'react';
import styles from './NavBar.module.css';
import {NavLink, Link} from 'react-router-dom';
import {useAuthContext} from "../../context/AuthContext.jsx";
import {jwtDecode} from "jwt-decode";
import useAxiosPrivate from "../../hooks/useAxiosPrivate.jsx";
import {useNavigate} from "react-router-dom";
import useAPICalls from "../../hooks/useAPICalls.jsx";


export default function NavBar(){
    const { accessToken, wasLoggedOut } = useAuthContext();


    const {logout} = useAPICalls()



    return (

        <nav data-testid={'navbar'} className={styles.navbar_bg}>

            <div className={`wrapper ${styles.navbar_container}` }>
                <div className={styles.logo}>
                    <Link to='/'>
                        <img src='/clipboard.png' />
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
                                    <button data-testid={'logout_btn'} onClick={logout} className={styles.nav_btn}>Sair</button>
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