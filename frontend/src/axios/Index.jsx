import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL


export const axios_instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': "application/json"
    }
})


export const axios_private_instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': "application/json"
    }
})



