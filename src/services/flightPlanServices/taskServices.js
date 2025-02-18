import apiClient from "../services";

export default {
    createTask(taskId, verificationId, data) {
        return apiClient.post(`flightPlan-t6/task/${taskId}/verification/${verificationId}/task`, data);
    },
    createSystemTask(data) {
        return apiClient.post(`flightPlan-t6/task`, data);
    },
    getAllTasks(taskId, verificationId) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/verification/${verificationId}/task`);
    },
    getTask(taskId, verificationId, id) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/verification/${verificationId}/task/${id}`);
    },
    updateTask(taskId, verificationId, id, data) {
        return apiClient.put(`flightPlan-t6/task/${taskId}/verification/${verificationId}/task/${id}`, data);
    },
    deleteTask(taskId, verificationId, id) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/verification/${verificationId}/task/${id}`);
    },
    deleteAllTasks(taskId, verificationId) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/verification/${verificationId}/task`);
    },
    deleteAllSystemTasks() {
        return apiClient.delete(`flightPlan-t6/task`);
    }
};