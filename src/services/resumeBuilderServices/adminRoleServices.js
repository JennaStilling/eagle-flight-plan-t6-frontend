import apiClient from "../services.js";

export default {
    createAdmin(data) {
      return apiClient.post(`resume-t6/adminRole/`, data);
    },
    getAllAdmins() {
      return apiClient.get(`resume-t6/adminRole/`);
    },
    getAdmin(id) {
      return apiClient.get(`resume-t6/adminRole/${id}`);
    },
    updateAdmin(id, data) {
      return apiClient.put(`resume-t6/adminRole/${id}`, data);
    },
    deleteAdmin(id) {
      return apiClient.delete(`resume-t6/adminRole/${id}`);
    },
    deleteAlLAdmins() {
      return apiClient.delete(`resume-t6/adminRole/`);
    },
};