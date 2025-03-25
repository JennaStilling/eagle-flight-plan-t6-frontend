import apiClient from "../services";

export default {
    createExperienceTypeCliftonStrength(experienceTypeId, cliftonStrengthId, data) {
        return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/cliftonStrength/${cliftonStrengthId}/experienceTypeCliftonStrength`, data);
    },
    createSystemExperienceTypeCliftonStrength(data) {
        return apiClient.post(`flightPlan-t6/experienceTypeCliftonStrength`, data);
    },
    getAllExperienceTypeCliftonStrengths() {
        return apiClient.get(`flightPlan-t6/experienceTypeCliftonStrength`);
    },
    getExperienceTypeCliftonStrength(experienceTypeId, cliftonStrengthId, id) {
        return apiClient.get(`flightPlan-t6/experienceType/${experienceTypeId}/cliftonStrength/${cliftonStrengthId}/experienceTypeCliftonStrength/${id}`);
    },
    updateExperienceTypeCliftonStrength(experienceTypeId, cliftonStrengthId, id, data) {
        return apiClient.put(`flightPlan-t6/experienceType/${experienceTypeId}/cliftonStrength/${cliftonStrengthId}/experienceTypeCliftonStrength/${id}`, data);
    },
    updateSystemExperienceTypeCliftonStrength(id, data) {
        return apiClient.put(`flightPlan-t6/experienceTypeCliftonStrength/${id}`, data);
    },
    deleteExperienceTypeCliftonStrength(experienceTypeId, cliftonStrengthId, id) {
        return apiClient.delete(`flightPlan-t6/experienceType/${experienceTypeId}/cliftonStrength/${cliftonStrengthId}/experienceTypeCliftonStrength/${id}`);
    },
    deleteSystemExperienceTypeCliftonStrength(id) {
        return apiClient.delete(`flightPlan-t6/experienceTypeCliftonStrength/${id}`);
    },
    deleteAllExperienceTypeCliftonStrengths(experienceTypeId, cliftonStrengthId) {
        return apiClient.delete(`flightPlan-t6/experienceType/${experienceTypeId}/cliftonStrength/${cliftonStrengthId}/experienceTypeCliftonStrength`);
    },
    deleteAllSystemExperienceTypeCliftonStrengths() {
        return apiClient.delete(`flightPlan-t6/experienceTypeCliftonStrength`);
    }
};