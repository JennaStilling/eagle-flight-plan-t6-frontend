import apiClient from "../services";

export default {
    createStudentFlightPlanTask(studentFlightPlanId, taskId, userId, data) {
        return apiClient.post(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/task/${taskId}/user/${userId}/studentFlightPlanTask`, data);
    },
    createSystemStudentFlightPlanTask(data) {
        return apiClient.post(`flightPlan-t6/studentFlightPlanTask`, data);
    },
    getAllStudentFlightPlanTasks() {
        return apiClient.get(`flightPlan-t6/studentFlightPlanTask`);
    },
    getStudentFlightPlanTask(id) {
        return apiClient.get(`flightPlan-t6/studentFlightPlanTask/${id}`);
    },
    updateStudentFlightPlanTask(studentFlightPlanId, taskId, userId, id, data) {
        return apiClient.put(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/task/${taskId}/user/${userId}/studentFlightPlanTask/${id}`, data);
    },
    updateSystemStudentFlightPlanTask(id, data) {
        return apiClient.put(`flightPlan-t6/studentFlightPlanTask/${id}`, data);
    },
    deleteStudentFlightPlanTask(studentFlightPlanId, taskId, userId, id) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/task/${taskId}/user/${userId}/studentFlightPlanTask/${id}`);
    },
    deleteSystemStudentFlightPlanTask(id) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlanTask/${id}`);
    },
    deleteAllStudentFlightPlanTasks(studentFlightPlanId, taskId, userId) {
        return apiClient.delete(`flightPlan-t6/studentFlightPlan/${studentFlightPlanId}/task/${taskId}/user/${userId}/studentFlightPlanTask`);
    },
    deleteAllSystemStudentFlightPlanTasks() {
        return apiClient.delete(`flightPlan-t6/studentFlightPlanTask`);
    }
};