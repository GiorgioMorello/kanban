import {createContext, useState, useEffect, useContext} from 'react';

// Contexts
import {AuthContext} from "./AuthContext.jsx";

// Utils
import Swal from "sweetalert2";
import useAxios from "../utils/useAxios.jsx";
import useAxiosPrivate from "../hooks/useAxiosPrivate.jsx";

export const TaskContext = createContext();


export function TaskProvider({children}) {
    //States
    const [is_tasks_changed, setIsTasksChanged] = useState(null);
    const [tasks, setTasks] = useState([]);
    const axios_private_instance = useAxiosPrivate();


    // Context
    const {user, accessToken} = useContext(AuthContext);

    // Utils
    const api = axios_private_instance;



    useEffect(() => {

        async function fetch_data() {
            if (!user?.user_id) return;

            try {
                console.log(user)
                const resp = await api.get(`api/class/task?user_id=${user && user.user_id}`);
                //console.log(resp);

                if (resp.status === 200) {

                    setTasks(resp.data);

                }

            } catch (e) {
                console.log(e.message);
                if (user === null){
                    return false
                }

                if(user.user_id === null){
                    await Swal.fire({
                        title: "Sua sessão expirou, faça login novamente",
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
                    });
                }

            }

        }

        fetch_data();


    }, [is_tasks_changed, user]);



    const {todo_tasks, doing_tasks, done_tasks} = tasks.reduce((acc, task) => {
        if (task.task_status === 'TO') acc.todo_tasks.push(task);
        if (task.task_status === 'DO') acc.doing_tasks.push(task);
        if (task.task_status === 'DN') acc.done_tasks.push(task);
        return acc
    }, {todo_tasks: [], doing_tasks: [], done_tasks: []}) // Valor inicial




    return (
        <TaskContext.Provider value={{is_tasks_changed, setIsTasksChanged, todo_tasks, doing_tasks, done_tasks}}>
            {children}
        </TaskContext.Provider>
    )
}

export function useTaskContext() {
    return useContext(TaskContext);
}
