import apiClient from "../services.js";

export default {
    createBadgeExperienceType(experienceTypeId, badgeId, data) {
      //return apiClient.post(`flightPlan-t6/badgeExperienceType`, data);
      return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/badge/${badgeId}/badgeExperienceType`, data);
    },
    getAllBadgeExperienceTypes() {
      return apiClient.get(`flightPlan-t6/badgeExperienceType`);
    },
    getBadgeExperienceType(experienceTypeId, badgeId, id, data) {
      return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/badge/${badgeId}/badgeExperienceType/${id}`, data);
    },
    getSystemBadgeExperienceType(id) {
      return apiClient.get(`flightPlan-t6/badgeExperienceType/${id}`);
    },
    updateBadgeExperienceType(id, data) {
      return apiClient.put(`flightPlan-t6/badgeExperienceType/${id}`, data);
    },
    deleteBadgeExperienceType(id) {
      return apiClient.delete(`flightPlan-t6/badgeExperienceType/${id}`);
    },
    deleteAllBadgeExperienceTypes() {
      return apiClient.delete(`flightPlan-t6/badgeExperienceType`);
    },
};