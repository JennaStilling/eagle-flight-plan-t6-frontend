import apiClient from "../services";

export default {
    createCliftonStrength(data) {
      return apiClient.post(`flightPlan-t6/cliftonstrength`, data);
    },
    getAllCliftonStrengths() {
      return apiClient.get(`flightPlan-t6/cliftonstrength`);
    },
    getCliftonStrength(id) {
      return apiClient.get(`flightPlan-t6/cliftonstrength/${id}`);
    },
    updateCliftonStrength(id, data) {
      return apiClient.put(`flightPlan-t6/cliftonstrength/${id}`, data);
    },
    deleteCliftonStrength(id) {
      return apiClient.delete(`flightPlan-t6/cliftonstrength/${id}`);
    },
    deleteAllCliftonStrengths() {
      return apiClient.delete(`flightPlan-t6/cliftonstrength`);
    },
};