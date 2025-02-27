import apiClient from "../services";

export default {
    createSemester(data) {
      return apiClient.post(`flightPlan-t6/semester`, data);
    },
    getAllSemesters() {
      return apiClient.get(`flightPlan-t6/semester`);
    },
    getSemester(id) {
      return apiClient.get(`flightPlan-t6/semester/${id}`);
    },
    updateSemester(id, data) {
      return apiClient.put(`flightPlan-t6/semester/${id}`, data);
    },
    deleteSemester(id) {
      return apiClient.delete(`flightPlan-t6/semester/${id}`);
    },
    deleteAllSemesters() {
      return apiClient.delete(`flightPlan-t6/semester`);
    },
};