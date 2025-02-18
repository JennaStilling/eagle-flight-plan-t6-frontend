import apiClient from "../services";

export default {
    createBadge(data) {
      return apiClient.post(`flightPlan-t6/badge`, data);
    },
    getAllBadges() {
      return apiClient.get(`flightPlan-t6/badge`);
    },
    getBadge(id) {
      return apiClient.get(`flightPlan-t6/badge/${id}`);
    },
    updateBadge(id, data) {
      return apiClient.put(`flightPlan-t6/badge/${id}`, data);
    },
    deleteBadge(id) {
      return apiClient.delete(`flightPlan-t6/badge/${id}`);
    },
    deleteAllBadges() {
      return apiClient.delete(`flightPlan-t6/badge`);
    },
};