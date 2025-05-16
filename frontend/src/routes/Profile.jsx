/* Hooks */
import React, {useContext, useState, useEffect} from 'react';
import {jwtDecode} from "jwt-decode";
import useAxios from "../utils/useAxios.jsx";

// Contexts
import {AuthContext} from "../context/AuthContext.jsx";

// Compontents
import Swal from "sweetalert2";
import ProfileForm from "../components/ProfileForm";



export default function Profile(){







    return (
        <div className='wrapper'>

            <ProfileForm />

        </div>
    )
}