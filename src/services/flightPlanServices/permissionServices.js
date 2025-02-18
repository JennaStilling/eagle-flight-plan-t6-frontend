import apiClient from "../services";

export default {
    createPermission(data) {
      return apiClient.post(`flightPlan-t6/permission`, data);
    },
    getAllPermissions() {
      return apiClient.get(`flightPlan-t6/permission`);
    },
    getPermission(id) {
      return apiClient.get(`flightPlan-t6/permission/${id}`);
    },
    updatePermission(id, data) {
      return apiClient.put(`flightPlan-t6/permission/${id}`, data);
    },
    deletePermission(id) {
      return apiClient.delete(`flightPlan-t6/permission/${id}`);
    },
    deleteAllPermissions() {
      return apiClient.delete(`flightPlan-t6/permission`);
    },
};