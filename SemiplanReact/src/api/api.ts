import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5259/api",
});

export const getSubjects = async () => {
    const response = await API.get("/Subject");

    return response.data;
};