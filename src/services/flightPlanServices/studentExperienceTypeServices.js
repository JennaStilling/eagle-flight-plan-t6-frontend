import apiClient from "../services";

export default {
    createStudentExperienceType(studentId, experienceTypeId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType`, data);
    },
    createSystemStudentExperienceType(data) {
        return apiClient.post(`flightPlan-t6/studentExperienceType`, data);
    },
    getAllStudentExperienceTypes(studentId, experienceTypeId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType`);
    },
    getStudentExperienceType(studentId, experienceTypeId, id) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType/${id}`);
    },
    updateStudentExperienceType(studentId, experienceTypeId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType/${id}`, data);
    },
    updateSystemStudentExperienceType(id, data) {
        return apiClient.put(`flightPlan-t6/studentExperienceType/${id}`, data);
    },
    deleteStudentExperienceType(studentId, experienceTypeId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType/${id}`);
    },
    deleteSystemStudentExperienceType(id) {
        return apiClient.delete(`flightPlan-t6/studentExperienceType/${id}`);
    },
    deleteAllStudentExperienceTypes(studentId, experienceTypeId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType`);
    },
    deleteAllSystemStudentExperienceTypes() {
        return apiClient.delete(`flightPlan-t6/studentExperienceType`);
    }
};