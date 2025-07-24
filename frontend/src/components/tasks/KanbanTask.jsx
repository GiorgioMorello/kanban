import React, {useContext, useRef, useState, useEffect} from 'react';
import useAxiosPrivate from "../../hooks/useAxiosPrivate.jsx";

// Styles
import styles from './KanbanTask.module.css';

// Contexts
import {useAuthContext} from "../../context/AuthContext.jsx";
import {useTaskContext} from "../../context/TaskContext.jsx";

// Components
import Input from "../input/Input.jsx";
import ChangeStatusBtn from "../ChangeStatusBtn.jsx";


// Utils
import TaskUtils from "../../utils/TaskUtils.jsx";


export default function KanbanTask({props, status_color}) {

    // Utils
    const {validate_form, current_date} = TaskUtils();
    const axios_private_instance = useAxiosPrivate();
    const border_color = status_color;

    // Conetxts
    const {setIsTasksChanged, is_tasks_changed} = useTaskContext()
    const {user} = useAuthContext()


    // States
    const task_end_date = props.end_date.split('-');
    const formatted_date = `${task_end_date[2]}-${task_end_date[1]}-${task_end_date[0]}`
    const [date, setDate] = useState(props.end_date && formatted_date);

    const [is_menu_open, setIsMenuOpen] = useState(false);
    const [is_editing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(props.title && props.title);
    const [desc, setDesc] = useState(props.description && props.description);
    const [task_edited, setTaskEdited] = useState(false);
    const [errors, setErrors] = useState([]);
    const [is_task_deadline_expired, setIsTaskDeadlineExpired] = useState(false);



    // useRef
    const task_menu = useRef(null);
    const config_container = useRef(null);




    // Remover uma taks
    async function remove_task(e) {
        e.preventDefault();
        try {
            const resp = await axios_private_instance.delete(`api/class/task/${props.id}`);

            if (resp.status === 200) {
                console.log(resp);
                setIsTasksChanged(resp.data)
            }


        } catch (e) {
            setErrors([...errors, e.response.data.detail])

        }


    }


    function check_task_info() {
        if (title === props.title && desc === props.description && date === formatted_date) return false
        return true
    }

    // Salvar task editada
    async function save_edited_task(e) {
        e.preventDefault();

        if (check_task_info()) {
            const is_valid = validate_form(date, title, desc, setErrors, true);

            if (!is_valid) return false;

            setErrors([])
            console.log('Valido', date);
            try{
                const resp = await axios_private_instance.patch(`api/class/task/${props.id}`, {
                    title,
                    description: desc,
                    end_date: date,
                })

                if (resp.status === 200) {
                    const data = resp.data
                    setIsTasksChanged(data);
                    setIsEditing(false);
                    close_edit_field()
                }
            } catch (e) {
                setErrors(e.response.data.detail)
            }

        }


    }

    function close_edit_field() {
        setTitle(props.title);
        setDesc(props.description);
        setDate(formatted_date);

        setTaskEdited(false) // bloquear botão de salvar edição
        setIsEditing(!is_editing) // Fechar campo de editar
        setErrors([])
    }




    function toggle_menu_btn(e) {
        // e.stopPropagation();  //Impede que o clique na .config chegue ao handle_click_outside
        setIsMenuOpen((prevState) => !prevState);
    }



    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event) {
            // Se clicar dentro do menu onde estão os botões
            if (event.target === config_container.current) {
                return
            }
            // Se clicar fora do botão(icon triple dot)
            if (task_menu.current && !task_menu.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        if (is_menu_open) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [is_menu_open]);




    // Caso o usuário tenha feito alguma alteração nos campos de editar a task, liberar botão para salvar
    useEffect(() => {

        if (check_task_info()) {
            setTaskEdited(true);
        } else {
            return
        }
    }, [date, title, desc]);


    // Caso a data final tenha expirado, setar setIsTaskDeadlineExpired como true
    useEffect(()=>{

        if(formatted_date < current_date){
            setIsTaskDeadlineExpired(true);

        } else{
            setIsTaskDeadlineExpired(false);
        }
    }, [formatted_date, current_date, is_tasks_changed])


    return (
        <>

            <div data-testid="task" className={styles.task} id='task' style={{borderLeft: `4px solid ${border_color}`}}>

                {errors && errors.map((error) => (
                    <span data-testid="edit_task_error" className='error_msg'>{error}</span>
                ))}

                <div className={styles.task_text}>

                    {/* ABRIR O FORMULARIO PARA EDITAR A TASK */}
                    {!is_editing ? (<>
                            <h3 data-testid="task_title">{props.title}</h3>
                            <p>{props.description}</p>
                        </>) :
                        (
                            <form data-testid="edit_task_form" onSubmit={save_edited_task}>
                                <div className='task_text'>

                                    <Input value={title} type='text'
                                           handle_on_change={(e) => setTitle(e.target.value)}
                                           placeholder='Digite o titulo da Task'
                                           name='title' required={true}/>

                                    <textarea value={desc} placeholder='Descrição da Task'
                                              onChange={(e) => setDesc(e.target.value)}>
                                    </textarea>

                                    <Input handle_on_change={(e) => setDate(e.target.value)} name='date'
                                           label_text='Data Final'
                                           placeholder='Data final' value={date} type='date'/>

                                    <div className='form_btns'>
                                        <button data-testid="task_edit_form_btn" className={task_edited ? '' : styles.check_btn}
                                                disabled={!task_edited}>

                                            <i className='bx bx-check'></i>
                                        </button>
                                        <button data-testid="close_task_edit_form_btn" onClick={close_edit_field}>
                                            <i className='bx bx-x'></i>
                                        </button>
                                    </div>

                                </div>
                            </form>)}

                </div>


                <div className={styles.task_owner_info} style={{display: is_editing ? "none" : 'flex'}}>
                    {is_task_deadline_expired && props.task_status !== 'DN' ?  (
                        <span data-testid="task_expired_warning" title={'Data final expirada'} style={{color: "var(--default_red)"}} className={styles.task_date}>

                            {props.creation_date} / {props.end_date}
                            <i style={{fontSize: '1.6rem', verticalAlign: "sub"}} className='bx bx-calendar-exclamation'></i>

                    </span>

                    ) : (

                        <span data-testid="task_deadline" className={styles.task_date}>
                            {props.creation_date} / {props.end_date}
                        </span>

                    ) }

                    <div>
                        <img data-testid="profile_pic" src={user.profile_pic}/>
                        <span data-testid="username">{user && user.username}</span>
                    </div>
                </div>


                <div data-testid="open_menu_btn" ref={task_menu} className={styles.config} onClick={toggle_menu_btn}>
                    <i className='bx bx-dots-vertical-rounded'></i>
                </div>

                {is_menu_open && (
                    <div ref={config_container} data-testid="task_menu" className={styles.config_container}>
                        <ul className={styles.config_btns}>
                            <li>
                                <button data-testid="open_edit_task_form_btn" onClick={() => setIsEditing(!is_editing)} className={styles.config_btn}>
                                    <i className='bx bxs-edit-alt'></i>
                                    Editar
                                </button>
                            </li>
                            <li>
                                <ChangeStatusBtn task_id={props.id} current_status={props.task_status}
                                                 class_name={styles.config_btn}/>
                            </li>


                            <li>
                                <button onClick={remove_task} className={styles.config_btn}>
                                    <i className='bx bx-trash'></i>
                                    Remover Task
                                </button>
                            </li>
                        </ul>
                    </div>
                )}

                <div className={styles.line}></div>
            </div>

        </>
    )
}