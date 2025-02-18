import apiClient from "../services.js";

export default {
    createExperience(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/experience/`, data);
    },
    getAllExperiences(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/experience/`);
    },
    getExperience(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/experience/${id}`);
    },
    updateExperience(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/experience/${id}`, data);
    },
    deleteExperience(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/experience/${id}`);
    },
    deleteAllExperiences(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/experience/`);
    },
};