import apiClient from "../services.js";

export default {
    createRolePermission(data) {
        return apiClient.post(`flightPlan-t6/rolePermission`, data);
    },
    getAllRolePermissions() {
        return apiClient.get(`flightPlan-t6/rolePermission`);
    },
    getRolePermission(id) {
        return apiClient.get(`flightPlan-t6/rolePermission/${id}`);
    },
    updateRolePermission(id, data) {
        return apiClient.put(`flightPlan-t6/rolePermission/${id}`, data);
    },
    deleteRolePermission(id) {
        return apiClient.delete(`flightPlan-t6/rolePermission/${id}`);
    },
    deleteAllRolePermissions() {
        return apiClient.delete(`flightPlan-t6/rolePermission`);
    },
};