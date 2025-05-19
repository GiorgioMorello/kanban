import React, {useContext, useState, useEffect} from 'react';

import {jwtDecode} from "jwt-decode";

// Contexts
import {useTaskContext} from "../context/TaskContext.jsx";

// Compontents
import styles from './Dashboard.module.css';
import KanbanBoard from "../components/KanbanBoard.jsx";



export default function Dashboard(){

    const {is_tasks_changed, todo_tasks, doing_tasks, done_tasks} = useTaskContext()
    const [tasks, setTasks] = useState([]);





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