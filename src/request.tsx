// @ts-ignore
import { config } from "./config";
import axios from "axios";

let baseURL = "";

// switch (process.env.REACT_APP_ENV) {
//     case "production":
//         baseURL = config.prod.baseUrl;
//         break;
//     case "development":
//         baseURL = config.test.baseUrl;
// }

baseURL = config.test.baseUrl;
const request = axios.create({
    baseURL: baseURL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
    },
});

request.interceptors.request.use((config) => {
    return config;
});
request.interceptors.response.use((res) => {
    if (res.status === 200) {
        return res;
    } else {
        return Promise.reject(res);
    }
},err=>{
});

export default request
