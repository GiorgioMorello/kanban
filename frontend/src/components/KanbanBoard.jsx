import React, {useContext, useState, useEffect, useRef} from 'react';

import styles from "./tasks/KanbanBoard.module.css";


// Components
import KanbanTask from './tasks/KanbanTask.jsx'
import TaskForm from './tasks/TaskForm.jsx'


// Context
import {useTaskContext} from "../context/TaskContext.jsx";


export default function KanbanBoard(){



    // Support States
    const [is_todo_form_open, setIsTodoFormOpen] = useState(false);
    const [is_doing_form_open, setIsDoingFormOpen] = useState(false);
    const [is_done_form_open, setIsDoneFormOpen] = useState(false);
    const status_color = {
        TO: '#FAA0A0',
        DO: '#FCF55F',
        DN: '#9FE2BF',
    }




    const { todo_tasks, doing_tasks, done_tasks} = useTaskContext()




    function open_todo_task_form(){
        setIsTodoFormOpen(!is_todo_form_open);
    }

    function open_doing_task_form(e){
        setIsDoingFormOpen(!is_doing_form_open)
    }

    function open_done_task_form(e){
        setIsDoneFormOpen(!is_done_form_open);
    }



    return (
        <main className={styles.kanban_board}>

            <div className={styles.status}>
                <div className={styles.status_title}>
                    <h2>To do</h2>
                    <span>{todo_tasks.length}</span>
                    <div className={styles.add_btn}>
                        <button onClick={open_todo_task_form}>+</button>
                    </div>
                </div>


                <div className={styles.tasks_container}>

                    <div className={styles.tasks}>

                        {is_todo_form_open && (

                            <TaskForm open_task_form={open_todo_task_form} is_open_btn={is_todo_form_open} task_status='TO' status_color={status_color} />

                        )}

                        {todo_tasks && todo_tasks.map((task, index)=>(
                            <KanbanTask status_color={status_color.TO} props={task} key={index}/>
                        ))}


                    </div>

                </div>




            </div>


            <div className={styles.status}>
                <div className={styles.status_title}>
                    <h2>Doing</h2>
                    <span>{doing_tasks.length}</span>
                    <div className={styles.add_btn}>
                        <button onClick={open_doing_task_form}>+</button>
                    </div>
                </div>

                <div className={styles.tasks_container}>

                    <div className={styles.tasks}>

                        {is_doing_form_open && (

                            <TaskForm open_task_form={open_doing_task_form} is_open_btn={is_doing_form_open} task_status='DO' status_color={status_color} />

                        )}

                        {doing_tasks && doing_tasks.map((task, index)=>(
                            <KanbanTask status_color={status_color.DO} props={task} key={index}/>
                        ))}


                    </div>

                </div>

            </div>


            <div className={styles.status}>
                <div className={styles.status_title}>
                    <h2>Done</h2>
                    <span>{done_tasks.length}</span>
                    <div className={styles.add_btn}>
                        <button onClick={open_done_task_form}>+</button>
                    </div>
                </div>
                <div className={styles.tasks_container}>
                     <div className={styles.tasks}>

                         {is_done_form_open && (

                            <TaskForm open_task_form={open_done_task_form} is_open_btn={is_done_form_open} task_status='DN' status_color={status_color} />

                        )}

                        {done_tasks && done_tasks.map((task, index)=>(
                            <KanbanTask status_color={status_color.DN} props={task} key={index}/>
                        ))}


                    </div>
                </div>

            </div>

        </main>
    )
}