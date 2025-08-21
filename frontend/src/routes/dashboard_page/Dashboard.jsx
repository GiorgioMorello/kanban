import React, {useContext, useState, useEffect} from 'react';
import DashboardNavBar from "../../components/navbar/DashboardNavBar.jsx";
import {jwtDecode} from "jwt-decode";

// Contexts
import {useTaskContext} from "../../context/TaskContext.jsx";

// Compontents
import styles from './Dashboard.module.css';
import KanbanBoard from "../../components/tasks/KanbanBoard.jsx";
import {NavLink} from "react-router-dom";
import useAPICalls from "../../hooks/useAPICalls.jsx";


export default function Dashboard() {


    return (

        <>
            <DashboardNavBar />
            <div className='wrapper'>



                <section className={styles.board_container}>
                    <KanbanBoard/>
                </section>
            </div>
        </>

    )
}