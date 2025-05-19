/* Hooks */
import React, {useContext, useState, useEffect} from 'react';
import {jwtDecode} from "jwt-decode";

// Contexts
import {AuthContext} from "../context/AuthContext.jsx";

// Compontents
import ProfileForm from "../components/ProfileForm";



export default function Profile(){







    return (
        <div className='wrapper'>

            <ProfileForm />

        </div>
    )
}