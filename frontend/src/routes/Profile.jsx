/* Hooks */
import React, {useContext, useState, useEffect} from 'react';
import {jwtDecode} from "jwt-decode";

// Contexts
import {AuthContext} from "../context/AuthContext.jsx";

// Compontents
import ProfileForm from "../components/profile/ProfileForm.jsx";
import DashboardNavBar from "../components/navbar/DashboardNavBar";



export default function Profile(){







    return (

        <>
            <DashboardNavBar />
            <div className='wrapper'>

                <ProfileForm />

            </div>
        </>

    )
}