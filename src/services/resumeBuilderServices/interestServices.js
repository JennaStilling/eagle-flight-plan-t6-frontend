import apiClient from "../services.js";

export default {
    createInterest(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/interest/`, data);
    },
    getAllInterests(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/interest/`);
    },
    getInterest(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/interest/${id}`);
    },
    updateInterest(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/interest/${id}`, data);
    },
    deleteInterest(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/interest/${id}`);
    },
    deleteAllInterests(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/interest/`);
    },
};