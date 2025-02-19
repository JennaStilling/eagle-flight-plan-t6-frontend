import apiClient from "../services.js";

export default {
    createCertification(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/certification/`, data);
    },
    getAllCertifications(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/certification/`);
    },
    getCertification(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/certification/${id}`);
    },
    updateCertification(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/certification/${id}`, data);
    },
    deleteCertification(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/certification/${id}`);
    },
    deleteAllCertifications(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/certification/`);
    },
};