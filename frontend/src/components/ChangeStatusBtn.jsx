import styles from "./TaskForm.module.css";
import Input from "./Input.jsx";

// Hooks
import React, {useState} from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate.jsx";

// Context
import {useTaskContext} from '../context/TaskContext.jsx'
import Swal from "sweetalert2";


export default function ChangeStatusBtn({current_status, class_name, task_id}) {

    const axios_private_instance = useAxiosPrivate();

    const {setIsTasksChanged} = useTaskContext()

    const STATUS_CHANGE_OPTIONS = {
        TO: [
            {label: 'Mover para DOING', icon: 'bxs-chevron-right', move_to: 'DO'},
            {label: 'Mover para DONE', icon: 'bxs-chevrons-right', move_to: 'DN'},
        ],

        DO: [
            {label: 'Mover para TO DO', icon: 'bxs-chevron-right', move_to: 'TO'},
            {label: 'Mover para DONE', icon: 'bxs-chevrons-right', move_to: 'DN'},
        ],

        DN: [
            {label: 'Mover para TO DO', icon: 'bxs-chevron-right', move_to: 'TO'},
            {label: 'Mover para DOING', icon: 'bxs-chevrons-right', move_to: 'DO'},
        ]
    };

    async function change_status(to){

        try {

            const resp = await axios_private_instance.patch(`api/class/task/${task_id}`, {
                task_status: to
            });

            if(resp.status === 200){
                console.log(resp.data)
                setIsTasksChanged(resp.data);
            }
        }

        catch (e) {
            Swal.fire({
                    title: "Não foi possivel alterar o status da task",
                    icon: "error",
                    toast: true,
                    timer: 4000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    grow: false,
                    heightAuto: false,
                    customClass: {
                        popup: 'small_toast'
                    }
                })
            console.log(e.response.data);

        }

    }



    return (

        <>
            {STATUS_CHANGE_OPTIONS[current_status].map((op, i)=>(

                <button key={i} className={class_name} onClick={()=>change_status(op.move_to)}>
                    <i className={`bx ${op.icon}`}></i>
                    {op.label}
                </button>
            ))}

        </>

    )
}