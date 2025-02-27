import apiClient from "../services";

export default {
    createStudentFlightPlan(studentId, flightPlanId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/flightPlan/${flightPlanId}/studentFlightPlan`, data);
    },
    createSystemStudentFlightPlan(data) {
        return apiClient.post(`flightPlan-t6/studentFlightPlan`, data);
    },
    getAllStudentFlightPlans(studentId, flightPlanId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/flightPlan/${flightPlanId}/studentFlightPlan`);
    },
    getStudentFlightPlan(id) {
        return apiClient.get(`flightPlan-t6/studentFlightPlan/${id}`);
    },
    updateStudentFlightPlan(studentId, flightPlanId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/flightPlan/${flightPlanId}/studentFlightPlan/${id}`, data);
    },
    updateSystemStudentFlightPlan(id, data) {
        return apiClient.put(`flightPlan-t6/studentFlightPlan/${id}`, data);
    },
    deleteStudentFlightPlan(studentId, flightPlanId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/flightPlan/${flightPlanId}/studentFlightPlan/${id}`);
    },
    deleteSystemStudentFlightPlan(id) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlan/${id}`);
    },
    deleteAllStudentFlightPlans(studentId, flightPlanId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/flightPlan/${flightPlanId}/studentFlightPlan`);
    },
    deleteAllSystemStudentFlightPlans() {
        return apiClient.delete(`flightPlan-t6/studentFlightPlan`);
    }
};