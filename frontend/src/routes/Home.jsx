import React from 'react';
import styles from './Home.module.css'
import {Link} from "react-router-dom";

export default function Home(){


    return (
        <>
            <div data-testid={'home-bg'} className={styles.home_bg}>
                <div className={styles.home_container}>
                    <div className={styles.home_text}>
                       <h1 data-testid={'homepage-tile'}>Bem-vindo ao TaskFlow</h1>
                        <p data-testid={'homepage-desc'}> Organize seu dia com quadros Kanban de forma simples e rápido.</p>
                    </div>

                    <div data-testid={'homepage-links'} className={styles.links}>
                        <Link to={'/register'}>Criar Conta</Link>
                        <Link to={'/login'}>Fazer login</Link>
                    </div>

                </div>
            </div>


        </>

    )
}