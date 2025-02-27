import apiClient from "../services.js";

export default {
    createResumeReview(studentId, data) {
        return apiClient.post(`resume-t6/student/${studentId}/resumeReview/`, data);
    },
    getAllResumeReviews(studentId) {
        return apiClient.get(`resume-t6/student/${studentId}/resumeReview/`);
    },
    getResumeReview(studentId, id) {
        return apiClient.get(`resume-t6/student/${studentId}/resumeReview/${id}`);
    },
    getResumeReviewById(id) {
        return apiClient.get(`resume-t6/resumeReview/${id}`);
    },
    updateResumeReview(studentId, id, data) {
        return apiClient.put(`resume-t6/student/${studentId}/resumeReview/${id}`, data);
    },
    deleteResumeReview(studentId, id) {
        return apiClient.delete(`resume-t6/student/${studentId}/resumeReview/${id}`);
    },
    deleteAllResumeReviews(studentId) {
        return apiClient.delete(`resume-t6/student/${studentId}/resumeReview/`);
    }
};