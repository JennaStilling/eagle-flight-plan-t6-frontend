import apiClient from "../services.js";

export default {
    createResumeInterest(resumeId, interestId, data) {
      return apiClient.post(`resume-t6/resume/${resumeId}/interest/${interestId}/resumeInterest/`, data);
    },
    getAllResumeInterests(resumeId) {
      return apiClient.get(`resume-t6/resume/${resumeId}/resumeInterest/`);
    },
    getResumeInterest(resumeId, interestId, id) {
      return apiClient.get(`resume-t6/resume/${resumeId}/interest/${interestId}/resumeInterest/${id}`);
    },
    updateResumeInterest(resumeId, interestId, id, data) {
      return apiClient.put(`resume-t6/resume/${resumeId}/interest/${interestId}/resumeInterest/${id}`, data);
    },
    deleteResumeInterest(resumeId, interestId, id) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/interest/${interestId}/resumeInterest/${id}`);
    },
    deleteAllResumeInterests(resumeId) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/resumeInterest/`);
    },
};