import apiClient from "../services.js";

export default {
    createUserResumeReview(userId, resumeReviewId, data) {
      return apiClient.post(`resume-t6/user/${userId}/resumeReview/${resumeReviewId}/userResumeReview/`, data);
    },
    getAllUserResumeReviews(userId, resumeReviewId) {
      return apiClient.get(`resume-t6/user/${userId}/resumeReview/${resumeReviewId}/userResumeReview/`);
    },
    getUserResumeReview(userId, resumeReviewId, id) {
      return apiClient.get(`resume-t6/user/${userId}/resumeReview/${resumeReviewId}/userResumeReview/${id}`);
    },
    updateUserResumeReview(userId, resumeReviewId, id, data) {
      return apiClient.put(`resume-t6/user/${userId}/resumeReview/${resumeReviewId}/userResumeReview/${id}`, data);
    },
    deleteUserResumeReview(userId, resumeReviewId, id) {
      return apiClient.delete(`resume-t6/user/${userId}/resumeReview/${resumeReviewId}/userResumeReview/${id}`);
    },
    deleteAllUserResumeReviews(userId, resumeReviewId) {
      return apiClient.delete(`resume-t6/user/${userId}/resumeReview/${resumeReviewId}/userResumeReview/`);
    },
    getAllUserResumeReviewsByUserId(userId) {
      return apiClient.get(`resume-t6/user/${userId}/userResumeReview/`);
    },
    getUserResumeReviewUserId(userId, id) {
      return apiClient.get(`resume-t6/user/${userId}/userResumeReview/${id}`);
    }
};