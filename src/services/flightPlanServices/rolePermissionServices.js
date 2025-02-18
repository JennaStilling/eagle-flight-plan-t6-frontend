import apiClient from "../services";

export default {
    createRolePermission(roleId, permissionId, data) {
        return apiClient.post(`flightPlan-t6/role/${roleId}/permission/${permissionId}/rolePermission`, data);
    },
    getAllRolePermissions(roleId, permissionId) {
        return apiClient.get(`flightPlan-t6/role/${roleId}/permission/${permissionId}/rolePermission`);
    },
    getRolePermission(roleId, permissionId, id) {
        return apiClient.get(`flightPlan-t6/role/${roleId}/permission/${permissionId}/rolePermission/${id}`);
    },
    updateRolePermission(roleId, permissionId, id, data) {
        return apiClient.put(`flightPlan-t6/role/${roleId}/permission/${permissionId}/rolePermission/${id}`, data);
    },
    deleteRolePermission(roleId, permissionId, id) {
        return apiClient.delete(`flightPlan-t6/role/${roleId}/permission/${permissionId}/rolePermission/${id}`);
    },
    deleteAllRolePermissions(roleId, permissionId) {
        return apiClient.delete(`flightPlan-t6/role/${roleId}/permission/${permissionId}/rolePermission`);
    },
    deleteAllSystemRolePermissions() {
        return apiClient.delete(`flightPlan-t6/rolePermission`);
    }
};