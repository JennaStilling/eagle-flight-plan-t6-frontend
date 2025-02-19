import apiClient from "../services";

export default {
    createTaskCliftonStrength(taskId, cliftonStrengthId, data) {
        return apiClient.post(`flightPlan-t6/task/${taskId}/cliftonStrength/${cliftonStrengthId}/taskCliftonStrength`, data);
    },
    createSystemTaskCliftonStrength(data) {
        return apiClient.post(`flightPlan-t6/taskCliftonStrength`, data);
    },
    getAllTaskCliftonStrengths(taskId, cliftonStrengthId) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/cliftonStrength/${cliftonStrengthId}/taskCliftonStrength`);
    },
    getTaskCliftonStrength(taskId, cliftonStrengthId, id) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/cliftonStrength/${cliftonStrengthId}/taskCliftonStrength/${id}`);
    },
    updateTaskCliftonStrength(taskId, cliftonStrengthId, id, data) {
        return apiClient.put(`flightPlan-t6/task/${taskId}/cliftonStrength/${cliftonStrengthId}/taskCliftonStrength/${id}`, data);
    },
    updateSystemTaskCliftonStrength(id, data) {
        return apiClient.put(`flightPlan-t6/taskCliftonStrength/${id}`, data);
    },
    deleteTaskCliftonStrength(taskId, cliftonStrengthId, id) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/cliftonStrength/${cliftonStrengthId}/taskCliftonStrength/${id}`);
    },
    deleteSystemTaskCliftonStrength(id) {
        return apiClient.delete(`flightPlan-t6/taskCliftonStrength/${id}`);
    },
    deleteAllTaskCliftonStrengths(taskId, cliftonStrengthId) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/cliftonStrength/${cliftonStrengthId}/taskCliftonStrength`);
    },
    deleteAllSystemTaskCliftonStrengths() {
        return apiClient.delete(`flightPlan-t6/taskCliftonStrength`);
    }
};