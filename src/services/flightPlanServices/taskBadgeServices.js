import apiClient from "../services";

export default {
    createTaskBadge(taskId, badgeId, data) {
        return apiClient.post(`flightPlan-t6/task/${taskId}/badge/${badgeId}/taskBadge`, data);
    },
    createSystemTaskBadge(data) {
        return apiClient.post(`flightPlan-t6/taskBadge`, data);
    },
    getAllTaskBadges(taskId, badgeId) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/badge/${badgeId}/taskBadge`);
    },
    getTaskBadge(taskId, badgeId, id) {
        return apiClient.get(`flightPlan-t6/task/${taskId}/badge/${badgeId}/taskBadge/${id}`);
    },
    updateTaskBadge(taskId, badgeId, id, data) {
        return apiClient.put(`flightPlan-t6/task/${taskId}/badge/${badgeId}/taskBadge/${id}`, data);
    },
    updateSystemTaskBadge(id, data) {
        return apiClient.put(`flightPlan-t6/taskBadge/${id}`, data);
    },
    deleteTaskBadge(taskId, badgeId, id) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/badge/${badgeId}/taskBadge/${id}`);
    },
    deleteSystemTaskBadge(id) {
        return apiClient.delete(`flightPlan-t6/taskBadge/${id}`);
    },
    deleteAllTaskBadges(taskId, badgeId) {
        return apiClient.delete(`flightPlan-t6/task/${taskId}/badge/${badgeId}/taskBadge`);
    },
    deleteAllSystemTaskBadges() {
        return apiClient.delete(`flightPlan-t6/taskBadge`);
    }
};