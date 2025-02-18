import apiClient from "../services.js";

export default {
    createReviewer(data) {
      return apiClient.post(`resume-t6/reviewerRole/`, data);
    },
    getAllReviewers() {
      return apiClient.get(`resume-t6/reviewerRole/`);
    },
    getReviewer(id) {
      return apiClient.get(`resume-t6/reviewerRole/${id}`);
    },
    updateReviewer(id, data) {
      return apiClient.put(`resume-t6/reviewerRole/${id}`, data);
    },
    deleteReviewer(id) {
      return apiClient.delete(`resume-t6/reviewerRole/${id}`);
    },
    deleteAllReviewers() {
      return apiClient.delete(`resume-t6/reviewerRole/`);
    },
};