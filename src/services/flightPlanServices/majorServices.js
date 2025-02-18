import apiClient from "../services";

export default {
    createMajor(data) {
      return apiClient.post(`flightPlan-t6/major`, data);
    },
    getAllMajors() {
      return apiClient.get(`flightPlan-t6/major`);
    },
    getMajor(id) {
      return apiClient.get(`flightPlan-t6/major/${id}`);
    },
    updateMajor(id, data) {
      return apiClient.put(`flightPlan-t6/major/${id}`, data);
    },
    deleteMajor(id) {
      return apiClient.delete(`flightPlan-t6/major/${id}`);
    },
    deleteAllMajors() {
      return apiClient.delete(`flightPlan-t6/major`);
    },
};