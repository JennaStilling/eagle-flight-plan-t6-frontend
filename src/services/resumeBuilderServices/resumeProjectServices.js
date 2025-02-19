import apiClient from "../services.js";

export default {
    createResumeProject(resumeId, projectId, data) {
      return apiClient.post(`resume-t6/resume/${resumeId}/project/${projectId}/resumeProject/`, data);
    },
    getAllResumeProjects(resumeId) {
      return apiClient.get(`resume-t6/resume/${resumeId}/resumeProject/`);
    },
    getResumeProject(resumeId, projectId, id) {
      return apiClient.get(`resume-t6/resume/${resumeId}/project/${projectId}/resumeProject/${id}`);
    },
    updateResumeProject(resumeId, projectId, id, data) {
      return apiClient.put(`resume-t6/resume/${resumeId}/project/${projectId}/resumeProject/${id}`, data);
    },
    deleteResumeProject(resumeId, projectId, id) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/project/${projectId}/resumeProject/${id}`);
    },
    deleteAllResumeProjects(resumeId) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/resumeProject/`);
    },
};