import apiClient from "../services.js";

export default {
    createUserRole(userId, roleId, data) {
      return apiClient.post(`resume-t6/user/${userId}/role/${roleId}/userRole/`, data);
    },
    getAllUserRoles(userId, roleId) {
      return apiClient.get(`resume-t6/user/${userId}/role/${roleId}/userRole/`);
    },
    getUserRole(userId, roleId, id) {
      return apiClient.get(`resume-t6/user/${userId}/role/${roleId}/userRole/${id}`);
    },
    updateUserRole(userId, roleId, id, data) {
      return apiClient.put(`resume-t6/user/${userId}/role/${roleId}/userRole/${id}`, data);
    },
    deleteUserRole(userId, roleId, id) {
      return apiClient.delete(`resume-t6/user/${userId}/role/${roleId}/userRole/${id}`);
    },
    deleteAllUserRoles(userId, roleId) {
      return apiClient.delete(`resume-t6/user/${userId}/role/${roleId}/userRole/`);
    },
};