import apiClient from "../services";

export default {
    createStudentExperienceType(data) {
      return apiClient.post(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType`, data);
    },
    createSystemStudentExperienceType(data) {
        return apiClient.post(`flightPlan-t6/studentExperienceType`, data);
    },
    getAllStudentExperienceTypes() {
      return apiClient.get(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType`);
    },
    getStudentExperienceType(id) {
      return apiClient.get(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType/${id}`);
    },
    updateStudentExperienceType(id, data) {
      return apiClient.put(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType/${id}`, data);
    },
    updateSystemStudentExperienceType(id, data) {
        return apiClient.put(`flightPlan-t6/studentExperienceType/${id}`, data);
    },
    deleteStudentExperienceType(id) {
      return apiClient.delete(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType/${id}`);
    },
    deleteSystemStudentExperienceType(id) {
        return apiClient.delete(`flightPlan-t6/studentExperienceType/${id}`);
    },
    deleteAllStudentExperienceTypes() {
      return apiClient.delete(`flightPlan-t6/student/${studentId}/experienceType/${experienceTypeId}/studentExperienceType`);
    },
    deleteAllSystemStudentExperienceTypes() {
      return apiClient.delete(`flightPlan-t6/studentExperienceType`);
    }
};