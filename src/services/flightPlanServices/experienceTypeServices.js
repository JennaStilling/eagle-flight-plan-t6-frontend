import apiClient from "../services";

export default {
    createExperienceType(data) {
      return apiClient.post(`flightPlan-t6/experiencetype`, data);
    },
    getAllExperienceTypes() {
      return apiClient.get(`flightPlan-t6/experiencetype`);
    },
    getExperienceType(id) {
      return apiClient.get(`flightPlan-t6/experiencetype/${id}`);
    },
    updateExperienceType(id, data) {
      return apiClient.put(`flightPlan-t6/experiencetype/${id}`, data);
    },
    deleteExperienceType(id) {
      return apiClient.delete(`flightPlan-t6/experiencetype/${id}`);
    },
    deleteAllExperienceTypes() {
      return apiClient.delete(`flightPlan-t6/experiencetype`);
    },
};