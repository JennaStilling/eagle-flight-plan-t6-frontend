import apiClient from "../services";

export default {
    createVerification(data) {
      return apiClient.post(`flightPlan-t6/verification`, data);
    },
    getAllVerifications() {
      return apiClient.get(`flightPlan-t6/verification`);
    },
    getVerification(id) {
      return apiClient.get(`flightPlan-t6/verification/${id}`);
    },
    updateVerification(id, data) {
      return apiClient.put(`flightPlan-t6/verification/${id}`, data);
    },
    deleteVerification(id) {
      return apiClient.delete(`flightPlan-t6/verification/${id}`);
    },
    deleteAllVerifications() {
      return apiClient.delete(`flightPlan-t6/verification`);
    },
};