import apiClient from "../services";

export default {
    createTask(data) {
        return apiClient.post(`flightPlan-t6/task`, data);
    },
    getAllTasks() {
        return apiClient.get(`flightPlan-t6/task`);
    },
    getTask(id) {
        return apiClient.get(`flightPlan-t6/task/${id}`);
    },
    updateTask(id, data) {
        return apiClient.put(`flightPlan-t6/task/${id}`, data);
    },
    deleteTask(id) {
        return apiClient.delete(`flightPlan-t6/task/${id}`);
    },
    deleteAllTasks() {
        return apiClient.delete(`flightPlan-t6/task`);
    }
};