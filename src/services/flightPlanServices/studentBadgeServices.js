import apiClient from "../services";

export default {
    createStudentBadge(studentId, badgeId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/badge/${badgeId}/studentBadge`, data);
    },
    createSystemStudentBadge(data) {
        return apiClient.post(`flightPlan-t6/studentBadge`, data);
    },
    getAllStudentBadges(studentId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/studentBadge`);
    },
    getStudentBadge(studentId, badgeId, id) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/badge/${badgeId}/studentBadge/${id}`);
    },
    updateStudentBadge(studentId, badgeId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/badge/${badgeId}/studentBadge/${id}`, data);
    },
    updateSystemStudentBadge(id, data) {
        return apiClient.put(`flightPlan-t6/studentBadge/${id}`, data);
    },
    deleteStudentBadge(studentId, badgeId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/badge/${badgeId}/studentBadge/${id}`);
    },
    deleteSystemStudentBadge(id) {
        return apiClient.delete(`flightPlan-t6/studentBadge/${id}`);
    },
    deleteAllStudentBadges(studentId, badgeId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/badge/${badgeId}/studentBadge`);
    },
    deleteAllSystemStudentBadges() {
        return apiClient.delete(`flightPlan-t6/studentBadge`);
    }
};