import apiClient from "../services";

export default {
    createStudentFlightPlanExperienceType(studentFlightPlanId, experienceTypeId, data) {
        return apiClient.post(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType`, data);
    },
    createSystemStudentFlightPlanExperienceType(data) {
        return apiClient.post(`flightPlan-t6/studentFlightPlanExperienceType`, data);
    },
    getAllStudentFlightPlanExperienceTypes(studentFlightPlanId, experienceTypeId) {
        return apiClient.get(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType`);
    },
    getAllExperienceTypesForStudentFlightPlan(studentFlightPlanId) {
        return apiClient.get(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/studentFlightPlanExperienceType`);
    },
    getStudentFlightPlanExperienceType(studentFlightPlanId, experienceTypeId, id) {
        return apiClient.get(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType/${id}`);
    },
    updateStudentFlightPlanExperienceType(studentFlightPlanId, experienceTypeId, id, data) {
        return apiClient.put(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType/${id}`, data);
    },
    updateSystemStudentFlightPlanExperienceType(id, data) {
        return apiClient.put(`flightPlan-t6/studentFlightPlanExperienceType/${id}`, data);
    },
    deleteStudentFlightPlanExperienceType(studentFlightPlanId, experienceTypeId, id) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType/${id}`);
    },
    deleteSystemStudentFlightPlanExperienceType(id) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlanExperienceType/${id}`);
    },
    deleteAllStudentFlightPlanExperienceTypes(studentFlightPlanId, experienceTypeId) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType`);
    },
    deleteAllSystemStudentFlightPlanExperienceTypes() {
        return apiClient.delete(`flightPlan-t6/studentFlightPlanExperienceType`);
    }
};