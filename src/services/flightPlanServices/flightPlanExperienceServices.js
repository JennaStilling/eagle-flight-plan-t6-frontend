import apiClient from "../services";

export default {
    createFlightPlanExperienceType(flightPlanId, experienceTypeId, data) {
        return apiClient.post(`flightPlan-t6/flightPlan/${flightPlanId}/experienceType/${experienceTypeId}/flightPlanExperienceType`, data);
    },
    createSystemFlightPlanExperienceType(data) {
        return apiClient.post(`flightPlan-t6/flightPlanExperienceType`, data);
    },
    getAllFlightPlanExperienceTypes(flightPlanId, experienceTypeId) {
        return apiClient.get(`flightPlan-t6/flightPlan/${flightPlanId}/experienceType/${experienceTypeId}/flightPlanExperienceType`);
    },
    getFlightPlanExperienceType(flightPlanId, experienceTypeId, id) {
        return apiClient.get(`flightPlan-t6/flightPlan/${flightPlanId}/experienceType/${experienceTypeId}/flightPlanExperienceType/${id}`);
    },
    updateFlightPlanExperienceType(flightPlanId, experienceTypeId, id, data) {
        return apiClient.put(`flightPlan-t6/flightPlan/${flightPlanId}/experienceType/${experienceTypeId}/flightPlanExperienceType/${id}`, data);
    },
    updateSystemFlightPlanExperienceType(id, data) {
        return apiClient.put(`flightPlan-t6/flightPlanExperienceType/${id}`, data);
    },
    deleteFlightPlanExperienceType(flightPlanId, experienceTypeId, id) {
        return apiClient.delete(`flightPlan-t6/flightPlan/${flightPlanId}/experienceType/${experienceTypeId}/flightPlanExperienceType/${id}`);
    },
    deleteSystemFlightPlanExperienceType(id) {
        return apiClient.delete(`flightPlan-t6/flightPlanExperienceType/${id}`);
    },
    deleteAllFlightPlanExperienceTypes(flightPlanId, experienceTypeId) {
        return apiClient.delete(`flightPlan-t6/flightPlan/${flightPlanId}/experienceType/${experienceTypeId}/flightPlanExperienceType`);
    },
    deleteAllSystemFlightPlanExperienceTypes() {
        return apiClient.delete(`flightPlan-t6/flightPlanExperienceType`);
    }
};