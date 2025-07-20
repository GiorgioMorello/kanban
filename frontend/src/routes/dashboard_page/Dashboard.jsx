import React, {useContext, useState, useEffect} from 'react';

import {jwtDecode} from "jwt-decode";

// Contexts
import {useTaskContext} from "../../context/TaskContext.jsx";

// Compontents
import styles from './Dashboard.module.css';
import KanbanBoard from "../../components/tasks/KanbanBoard.jsx";



export default function Dashboard(){



    return (
        <div className='wrapper'>
            <div className={styles.title}>
                <h1>Dashboard Page</h1>
            </div>


            <section className={styles.board_container}>
                <KanbanBoard/>

            </section>
        </div>
    )
}