import apiClient from "../services.js";

export default {
    createResumeCourse(resumeId, educationId, courseId, data) {
      return apiClient.post(`resume-t6/resume/${resumeId}/education/${educationId}/course/${courseId}/resumeCourse/`, data);
    },
    getAllResumeCourses(resumeId, educationId) {
      return apiClient.get(`resume-t6/resume/${resumeId}/education/${educationId}/resumeCourse/`);
    },
    getResumeCourse(resumeId, educationId, courseId, id) {
      return apiClient.get(`resume-t6/resume/${resumeId}/education/${educationId}/course/${courseId}/resumeCourse/${id}`);
    },
    updateResumeCourse(resumeId, educationId, courseId, id, data) {
      return apiClient.put(`resume-t6/resume/${resumeId}/education/${educationId}/course/${courseId}/resumeCourse/${id}`, data);
    },
    deleteResumeCourse(resumeId, educationId, courseId, id) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/education/${educationId}/course/${courseId}/resumeCourse/${id}`);
    },
    deleteAllResumeCourses(resumeId, educationId) {
      return apiClient.delete(`resume-t6/resume/${resumeId}/education/${educationId}/resumeCourse/`);
    },
};