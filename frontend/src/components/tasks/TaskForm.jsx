import styles from "./TaskForm.module.css";
import Input from "../Input.jsx";

// Hooks
import React, {useEffect, useState, useRef, useContext} from "react";

// Utils
import useAxiosPrivate from "../../hooks/useAxiosPrivate.jsx";
import TaskUtils from "../../utils/TaskUtils.jsx";


// Contexts
import {useAuthContext} from '../../context/AuthContext.jsx'
import {useTaskContext} from '../../context/TaskContext.jsx'


export default function TaskForm({open_task_form, is_open_btn, status_color, task_status}) {


    // Utils
    const axios_private_instance = useAxiosPrivate()
    const {validate_form} = TaskUtils();



    // Contexts
    const {user} = useAuthContext()
    const {setIsTasksChanged} = useTaskContext()



    // Support States
    const [errors, setErrors] = useState([]);
    const todays_date = new Date().toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}).split('/').reverse().join('-')
    const title_ref = useRef(null);
    const border_color = status_color[task_status]


    // Inputs states
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState(todays_date);

    function date_on_change(e){
        setDate(e.target.value);
    }



    async function handle_submit(e){
        e.preventDefault();


        const is_valid = validate_form(date, title, desc, setErrors, false);


        if (!is_valid) return false


        const task_data = {
            title,
            description: desc,
            task_status,
            end_date: date,
            owner: user.user_id,
        }



        const resp = await axios_private_instance.post('api/class/task', {
            title,
            description: desc,
            task_status,
            end_date: date,
            owner: user.user_id,
        });
        if(resp.status === 201){
            const data = resp.data;
            setIsTasksChanged(data)


            setDesc("")
            setTitle("");
            setDate("");
            setErrors([]);


            title_ref.current.focus()

        }

    }




    useEffect(() => {
        if (title_ref.current) {
            title_ref.current.focus(); // Chama o focus após o render
        }
    }, [is_open_btn]);


    return (

        <>

            <form onSubmit={handle_submit}>

                <div className={styles.task_input} id='task' style={{borderLeft: `4px solid ${border_color}`}}>
                    {errors && errors.map((error, id) => (
                        <span key={id} className='error_msg'>{error}</span>
                    ))}
                    <div className='task_text'>
                        {/* Titulo e Descrição */}
                        <Input value={title && title} input_ref={title_ref} type='text'
                               handle_on_change={(e) => setTitle(e.target.value)} placeholder='Digite o titulo da Task'
                               name='title' required={true}/>
                        <textarea value={desc && desc} placeholder='Descrição da Task'
                                  onChange={(e) => setDesc(e.target.value)}>
                        </textarea>

                    </div>


                    <div className={styles.task_owner_info}>
                                        <div className='task_date'>
                                            {/* End date */}
                                            <Input handle_on_change={date_on_change} name='date' label_text='Data Final'
                                                   placeholder='Data final' value={date} type='date'/>
                                        </div>
                        <div>
                        </div>
                    </div>

                    <div className='form_btns'>
                        <button type='submit'>
                            <i className='bx bx-check'></i>
                        </button>
                        <button onClick={open_task_form}>
                            <i className='bx bx-x'></i>
                        </button>
                    </div>

                    <div className={styles.line}></div>
                </div>

            </form>

        </>
    )
}


