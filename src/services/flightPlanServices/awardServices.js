import apiClient from "../services.js";

export default {
    createAward(data) {
      return apiClient.post(`flightPlan-t6/award`, data);
    },
    getAllAwards() {
      return apiClient.get(`flightPlan-t6/award`);
    },
    getAward(id) {
      return apiClient.get(`flightPlan-t6/award/${id}`);
    },
    updateAward(id, data) {
      return apiClient.put(`flightPlan-t6/award/${id}`, data);
    },
    deleteAward(id) {
      return apiClient.delete(`flightPlan-t6/award/${id}`);
    },
    deleteAllAwards() {
      return apiClient.delete(`flightPlan-t6/award`);
    },
};