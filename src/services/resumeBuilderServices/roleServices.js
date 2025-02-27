import apiClient from "../services.js";

export default {
    createRole(data) {
      return apiClient.post(`resume-t6/role/`, data);
    },
    getAllRoles() {
      return apiClient.get(`resume-t6/role/`);
    },
    getRole(id) {
      return apiClient.get(`resume-t6/role/${id}`);
    },
    updateRole(id, data) {
      return apiClient.put(`resume-t6/role/${id}`, data);
    },
    deleteRole(id) {
      return apiClient.delete(`resume-t6/role/${id}`);
    },
    deleteAllRoles() {
      return apiClient.delete(`resume-t6/role/`);
    },
};