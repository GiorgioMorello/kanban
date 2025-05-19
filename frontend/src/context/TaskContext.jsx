import {createContext, useState, useEffect, useContext} from 'react';

// Contexts
import {AuthContext} from "./AuthContext.jsx";

// Utils
import useAxiosPrivate from "../hooks/useAxiosPrivate.jsx";
import Alert from "../utils/Alert.jsx";

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
    const send_alert = Alert();



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
                    await send_alert("Sua sessão expirou, faça login novamente", "error")
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
