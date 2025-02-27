import apiClient from "../services.js";

export default {
    createLink(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/link/`, data);
    },
    getAllLinks(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/link/`);
    },
    getLink(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/link/${id}`);
    },
    updateLink(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/link/${id}`, data);
    },
    deleteLink(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/link/${id}`);
    },
    deleteAllLinks(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/link/`);
    },
};