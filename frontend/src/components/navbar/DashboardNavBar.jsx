import styles from "../../routes/dashboard_page/Dashboard.module.css";
import {Link, NavLink} from "react-router-dom";
import useAPICalls from "../../hooks/useAPICalls.jsx";

export default function DashboardNavBar() {


    const {logout} = useAPICalls()

    return (
        <div data-testid={'dashboard-navbar'} className={styles.nav_bg}>
                <div className={`wrapper ${styles.nav_container}`}>
                    <Link to='/dashboard'>
                       <div className={styles.logo}>
                            <img src={'/check.png'}/>
                        </div>
                    </Link>



                    <div>
                        <ul className={styles.nav_links}>
                             <li>
                                <NavLink to='/your-profile'>Seu Perfil</NavLink>
                            </li>
                            <li>
                                <button data-testid={'logout_btn'} onClick={logout} className={styles.logout_btn}>Sair</button>
                            </li>

                        </ul>


                    </div>
                </div>
            </div>
    )
}