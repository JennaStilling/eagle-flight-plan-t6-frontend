import apiClient from "../services.js";

export default {
    createUserRole(userId, data) {
      return apiClient.post(`resume-t6/user/${userId}/userRole/`, data);
    },
    getAllUserRoles(userId) {
      return apiClient.get(`resume-t6/user/${userId}/userRole/`);
    },
    getEveryUserRole(){
      return apiClient.get(`resume-t6/userRole/`);
    },
    getUserRole(userId, id) {
      return apiClient.get(`resume-t6/user/${userId}/userRole/${id}`);
    },
    updateUserRole(userId, id, data) {
      return apiClient.put(`resume-t6/user/${userId}/userRole/${id}`, data);
    },
    deleteUserRole(userId, id) {
      return apiClient.delete(`resume-t6/user/${userId}/userRole/${id}`);
    },
    deleteAllUserRoles(userId) {
      return apiClient.delete(`resume-t6/user/${userId}/userRole/`);
    },
};