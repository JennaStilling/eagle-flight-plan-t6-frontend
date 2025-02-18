import apiClient from "../services";

export default {
    createUserRolePermission(userRoleId, permissionId, data) {
        return apiClient.post(`flightPlan-t6/userRole/${userRoleId}/permission/${permissionId}/userRolePermission`, data);
    },
    createSystemUserRolePermission(data) {
        return apiClient.post(`flightPlan-t6/userRolePermission`, data);
    },
    getAllUserRolePermissions(userRoleId, permissionId) {
        return apiClient.get(`flightPlan-t6/userRole/${userRoleId}/permission/${permissionId}/userRolePermission`);
    },
    getUserRolePermission(userRoleId, permissionId, id) {
        return apiClient.get(`flightPlan-t6/userRole/${userRoleId}/permission/${permissionId}/userRolePermission/${id}`);
    },
    updateUserRolePermission(userRoleId, permissionId, id, data) {
        return apiClient.put(`flightPlan-t6/userRole/${userRoleId}/permission/${permissionId}/userRolePermission/${id}`, data);
    },
    updateSystemUserRolePermission(id, data) {
        return apiClient.put(`flightPlan-t6/userRolePermission/${id}`, data);
    },
    deleteUserRolePermission(userRoleId, permissionId, id) {
        return apiClient.delete(`flightPlan-t6/userRole/${userRoleId}/permission/${permissionId}/userRolePermission/${id}`);
    },
    deleteSystemUserRolePermission(id) {
        return apiClient.delete(`flightPlan-t6/userRolePermission/${id}`);
    },
    deleteAllUserRolePermissions(userRoleId, permissionId) {
        return apiClient.delete(`flightPlan-t6/userRole/${userRoleId}/permission/${permissionId}/userRolePermission`);
    },
    deleteAllSystemUserRolePermissions() {
        return apiClient.delete(`flightPlan-t6/userRolePermission`);
    }
};