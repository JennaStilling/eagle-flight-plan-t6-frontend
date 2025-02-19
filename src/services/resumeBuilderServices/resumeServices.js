
import apiClient from "../services.js";

export default {
    createResume(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/resume/`, data);
    },
    getAllResumes(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/resume/`);
    },
    getResume(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/resume/${id}`);
    },
    updateResume(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/resume/${id}`, data);
    },
    deleteResume(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/resume/${id}`);
    },
    deleteAllResumes(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/resume/`);
    },
    // Gets the resume to be reviewed using resumeReview id
    getResumeForReview(resumeReviewId, id) {
      return apiClient.get(`resume-t6/resumeReview/${resumeReviewId}/resume/${id}`);
    },
    getResumeAsReviewer(resumeReviewId) {
      return apiClient.get(`resume-t6/resumeReview/${resumeReviewId}/resume`);
    },
    uploadResumeImage(studentId, resumeId, image) {
      return apiClient.post(`resume-t6/student/${studentId}/resume/${resumeId}/upload`, { image });
    },
};