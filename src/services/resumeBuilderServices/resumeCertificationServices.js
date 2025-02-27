import apiClient from "../services.js";

export default {
    createResumeCertification(resumeId, certificationId, data) {
      return apiClient.post(`resume-t6/resume/${resumeId}/certification/${certificationId}/resumeCertification/`, data);
    },
    getAllResumeCertifications(resumeId) {
      return apiClient.get(`resume-t6/resume/${resumeId}/resumeCertification/`);
    },
    getResumeCertification(resumeId, certificationId, id) {
      return apiClient.get(`resume-t6/resume/${resumeId}/certification/${certificationId}/resumeCertification/${id}`);
    },
    updateResumeCertification(resumeId, certificationId, id, data) {
      return apiClient.put(`resume-t6/resume/${resumeId}/certification/${certificationId}/resumeCertification/${id}`, data);
    },
    deleteResumeCertification(resumeId, certificationId, id) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/certification/${certificationId}/resumeCertification/${id}`);
    },
    deleteAllResumeCertifications(resumeId) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/resumeCertification/`);
    },
};