import apiClient from "../services";

export default {
  createStudentFlightPlanExperienceType(data) {
    return apiClient.post(`flightPlan-t6/student/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType`, data);
  },
  createSystemStudentFlightPlanExperienceType(data) {
    return apiClient.post(`flightPlan-t6/studentFlightPlanExperienceType`, data);
  },
  getAllStudentFlightPlanExperienceTypes() {
    return apiClient.get(`flightPlan-t6/student/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType`);
  },
  getStudentFlightPlanExperienceType(id) {
    return apiClient.get(`flightPlan-t6/student/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType/${id}`);
  },
  getStudentFlightPlanExperienceTypeEvents(studentFlightPlanExperienceTypeId) {
    return apiClient.get(`flightPlan-t6/studentFlightPlanExperienceType/${studentFlightPlanExperienceTypeId}/studentFlightPlanExperienceTypeEvent`);
  },
  updateStudentFlightPlanExperienceType(id, data) {
    return apiClient.put(`flightPlan-t6/student/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType/${id}`, data);
  },
  updateSystemStudentFlightPlanExperienceType(id, data) {
    return apiClient.put(`flightPlan-t6/studentFlightPlanExperienceType/${id}`, data);
  },
  deleteStudentFlightPlanExperienceType(id) {
    return apiClient.delete(`flightPlan-t6/student/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType/${id}`);
  },
  deleteSystemStudentFlightPlanExperienceType(id) {
    return apiClient.delete(`flightPlan-t6/studentFlightPlanExperienceType/${id}`);
  },
  deleteAllStudentFlightPlanExperienceTypes() {
    return apiClient.delete(`flightPlan-t6/student/${studentFlightPlanId}/experienceType/${experienceTypeId}/studentFlightPlanExperienceType`);
  },
  deleteAllSystemStudentFlightPlanExperienceTypes() {
    return apiClient.delete(`flightPlan-t6/studentFlightPlanExperienceType`);
  }
};