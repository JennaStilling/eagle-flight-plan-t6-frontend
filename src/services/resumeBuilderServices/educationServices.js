import apiClient from "../services.js";

export default {
    createEducation(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/education/`, data);
    },
    getAllEducations(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/education/`);
    },
    getEducation(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/education/${id}`);
    },
    updateEducation(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/education/${id}`, data);
    },
    deleteEducation(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/education/${id}`);
    },
    deleteAllEducations(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/education/`);
    },
};