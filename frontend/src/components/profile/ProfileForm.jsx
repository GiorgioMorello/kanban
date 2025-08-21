/* Hooks */
import React, {useContext, useState, useEffect, useRef} from 'react';
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate.jsx";

// Contexts
import {useAuthContext} from "../../context/AuthContext.jsx";

// Compontents
import Alert from "../../utils/Alert.jsx";
import styles from './ProfileForm.module.css'
import Input from "../input/Input.jsx";
import {axios_private_instance} from "../../axios/Index.jsx";
import SubmitButton from "../input/SubmitButton.jsx";



export default function ProfileForm(){

    // Contexts
    const {user, setUser, accessToken, setAccessToken} = useAuthContext();

    // States
    const [full_name, setFullName] = useState(user && user.full_name);
    const [username, setUsername] = useState(user && user.username);
    const [email, setEmail] = useState(user && user.email);
    const [profile_pic, setProfilePic] = useState(user && user.profile_pic);
    const [remove_pic, setRemovePic] = useState(false);
    const [preview_img, setPreviewImg] = useState(null);
    const [disableSubmit, setDisableSubmit] = useState(false);
    const [error, setError] = useState("");


    // Hooks
    const axios_private_instance = useAxiosPrivate()
    const profile_pic_input = useRef();
    const navigate = useNavigate();
    const send_alert = Alert();





    useEffect(()=>{
        // Caso o usuário tenha alterado a imagem de perfil, mostrar botão de remover imagem
        if(profile_pic !== user.profile_pic){
            setRemovePic(!remove_pic);
        }

    }, [profile_pic])


    useEffect(()=>{
        if(!accessToken || !user){
            navigate('/login')
        }

    }, [profile_pic])


    // Botão para remover a imagem enviada
    function remove_profile_pic(e){

        if(profile_pic_input.current) {
            profile_pic_input.current.value = null
        }

        setPreviewImg(null);
        setRemovePic(false)

    }



    async function handle_profile_submit(e){
        const form_data = new FormData();

        e.preventDefault();
        form_data.append('full_name', full_name)
        form_data.append('username', username)
        form_data.append('email', email);

        if (preview_img) form_data.append('profile_pic', profile_pic);

        setDisableSubmit(true);

        try {
            const resp = await axios_private_instance.patch(`user/edit-user/`, form_data,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (resp.status === 200){
                const data = resp.data;
                setUser(jwtDecode(data.access));
                setAccessToken(data.access)
                setProfilePic(data.profile_pic);

                navigate('/dashboard');
                send_alert("Perfil atualizado", "success")

            }
        }
        catch (e) {
            setError("Não foi possivel atualizar seu perfil")
        }

        finally {
            setDisableSubmit(false)
        }




    }






    return (
        <form className={styles.form_container} encType='multipart/form-data' onSubmit={handle_profile_submit}>

            <div className={styles.profile_pic_input}>
                {remove_pic && (<>
                    <button type={"button"} onClick={remove_profile_pic} title='Remover imagem enviada' className={styles.remove_pic_btn}>
                        <i className='bx bx-trash'></i>
                    </button>
                </>)}
                <input ref={profile_pic_input} onChange={(e)=>{setProfilePic(e.target.files[0]);
                        setPreviewImg(URL.createObjectURL(e.target.files[0]))
                }} type='file' accept='image/*' name={'profile_pic'}/>
                <img src={preview_img ? preview_img : profile_pic} />
            </div>

            <div className={styles.user_title}>
                <h2>{user.full_name ? user.full_name : user.username}</h2>
            </div>

            <div className={styles.user_info}>

                <div className={styles.field_group}>
                    <Input label_text='Seu nome' handle_on_change={(e)=>setFullName(e.target.value)} name='full_name' type='text' value={full_name} placeholder='Digite seu nome'/>
                </div>

                <div className={styles.field_group}>
                    <Input label_text='Nome de usuário' handle_on_change={(e)=>setUsername(e.target.value)} name='username' type='text' value={username} placeholder='Digite seu nome de usuário'/>
                </div>

                <div className={styles.field_group}>
                    <Input label_text='E-mail' handle_on_change={(e)=>setEmail(e.target.value)} name='email' type='text' value={email} placeholder='Digite seu email'/>
                </div>


                <SubmitButton disable_submit={disableSubmit} data_testid='profile_form_submit_btn' />

                {error && <span className='error_msg'>{error}</span>}


            </div>



        </form>
    )
}