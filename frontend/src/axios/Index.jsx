import axios from 'axios'

const baseURL = 'http://127.0.0.1:8000/'


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



