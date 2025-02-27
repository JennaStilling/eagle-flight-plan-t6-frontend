import apiClient from "../services";

export default {
    createExperienceTypeMajor(experienceTypeId, majorId, data) {
      return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/major/${majorId}/experienceTypeMajor`, data);
    },
    createSystemExperienceTypeMajor(data) {
        return apiClient.post(`flightPlan-t6/experienceTypeMajor`, data);
    },
    getAllExperienceTypeMajors() {
      return apiClient.get(`flightPlan-t6/experienceTypeMajor`);
    },
    getExperienceTypeMajor(experienceTypeId, majorId, id, data) {
      return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/major/${majorId}/experienceTypeMajor/${id}`, data);
    },
    getSystemExperienceTypeMajor(id) {
      return apiClient.get(`flightPlan-t6/experienceTypeMajor/${id}`);
    },
    updateExperienceTypeMajor(id, data) {
      return apiClient.put(`flightPlan-t6/experienceTypeMajor/${id}`, data);
    },
    deleteExperienceTypeMajor(experienceTypeId, majorId, id) {
      return apiClient.delete(`flightPlan-t6/experienceType/${experienceTypeId}/major/${majorId}/experienceTypeMajor/${id}`);
    },
    deleteSystemExperienceTypeMajor(id) {
      return apiClient.delete(`flightPlan-t6/experienceTypeMajor/${id}`);
    },
    deleteAllExperienceTypeMajors() {
      return apiClient.delete(`flightPlan-t6/experienceTypeMajor`);
    },
}