import useRefreshToken from "../hooks/useRefreshToken.jsx";
import {TaskContext} from "../context/TaskContext.jsx";
import {vi} from "vitest";


export const mockSetIsTasksChanged = vi.fn();



export default function MockTaskProvider({children, todo_tasks=null, doing_tasks=null, done_tasks=null, is_tasks_changed=true}){


    // Adicionando uma tarefa para cada status, uma com a data de entrega(end_date) expirada e duas em andamento
    todo_tasks = [
        {
        "id": 1,
        "title": "Task test todo",
        "description": "TEST",
        "task_status": "TO",
        "creation_date": "18-07-2025",
        "end_date": "16-07-2025",
        "task_status_display": "DONE",
        "owner": 1
        }
    ]


    doing_tasks = [
        {
            "id": 2,
            "title": "Task test doing(expired deadline)",
            "description": "TEST",
            "task_status": "DO",
            "creation_date": "26-08-2025",
            "end_date": "19-06-2025",
            "task_status_display": "DONE",
            "owner": 1
        }
    ]


    done_tasks = [
        {
        "id": 3,
        "title": "Task test done",
        "description": "TEST",
        "task_status": "DN",
        "creation_date": "16-08-2025",
        "end_date": "21-07-2025",
        "task_status_display": "DONE",
        "owner": 1
    }
    ]



    return (
        <TaskContext.Provider value={{

            is_tasks_changed: is_tasks_changed,
            setIsTasksChanged: mockSetIsTasksChanged,
            todo_tasks: todo_tasks,
            doing_tasks: doing_tasks,
            done_tasks: done_tasks,


        }}>
            {children}
        </TaskContext.Provider>
    )



}
