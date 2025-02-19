import apiClient from "../services.js";

export default {
    createUserRolePermission(data) {
        return apiClient.post(`flightPlan-t6/userRolePermission`, data);
    },
    getAllUserRolePermissions() {
        return apiClient.get(`flightPlan-t6/userRolePermission`);
    },
    getUserRolePermission(id) {
        return apiClient.get(`flightPlan-t6/userRolePermission/${id}`);
    },
    updateUserRolePermission(id, data) {
        return apiClient.put(`flightPlan-t6/userRolePermission/${id}`, data);
    },
    deleteUserRolePermission(id) {
        return apiClient.delete(`flightPlan-t6/userRolePermission/${id}`);
    },
    deleteAllUserRolePermissions() {
        return apiClient.delete(`flightPlan-t6/userRolePermission`);
    },
};