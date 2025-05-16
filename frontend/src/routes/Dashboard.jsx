import React, {useContext, useState, useEffect} from 'react';

import {jwtDecode} from "jwt-decode";
import useAxios from "../utils/useAxios.jsx";

// Contexts
import {AuthContext} from "../context/AuthContext.jsx";
import {useTaskContext} from "../context/TaskContext.jsx";

// Compontents
import styles from './Dashboard.module.css';
import KanbanBoard from "../components/KanbanBoard.jsx";
import Swal from "sweetalert2";



export default function Dashboard(){

    const api = useAxios();
    const {logout_user, user} = useContext(AuthContext)
    const {is_tasks_changed, todo_tasks, doing_tasks, done_tasks} = useTaskContext()
    const [tasks, setTasks] = useState([]);
    //const token = localStorage.getItem("auth_token");





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