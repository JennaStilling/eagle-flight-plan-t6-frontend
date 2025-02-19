import apiClient from "../services";

export default {
    createTaskMajor(taskId, majorId, data) {
        return apiClient.post(`flightPlan-t6/task/${taskId}/major/${majorId}/taskMajor`, data);
    },
    createSystemTaskMajor(data) {
        return apiClient.post(`flightPlan-t6/taskMajor`, data);
    },
    getAllTaskMajors(taskId, majorId) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/major/${majorId}/taskMajor`);
    },
    getTaskMajor(taskId, majorId, id) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/major/${majorId}/taskMajor/${id}`);
    },
    updateTaskMajor(taskId, majorId, id, data) {
        return apiClient.put(`flightPlan-t6/task/${taskId}/major/${majorId}/taskMajor/${id}`, data);
    },
    updateSystemTaskMajor(id, data) {
        return apiClient.put(`flightPlan-t6/taskMajor/${id}`, data);
    },
    deleteTaskMajor(taskId, majorId, id) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/major/${majorId}/taskMajor/${id}`);
    },
    deleteSystemTaskMajor(id) {
        return apiClient.delete(`flightPlan-t6/taskMajor/${id}`);
    },
    deleteAllTaskMajors(taskId, majorId) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/major/${majorId}/taskMajor`);
    },
    deleteAllSystemTaskMajors() {
        return apiClient.delete(`flightPlan-t6/taskMajor`);
    }
};