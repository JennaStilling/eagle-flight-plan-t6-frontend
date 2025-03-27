import apiClient from "../services";

export default {
    createStudentCliftonStrength(studentId, cliftonStrengthId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength`, data);
    },
    createSystemStudentCliftonStrength(data) {
        return apiClient.post(`flightPlan-t6/studentCliftonStrength`, data);
    },
    getAllStudentCliftonStrengths(studentId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/studentCliftonStrength`);
    },
    getAllSystemStudentCliftonStrengths() {
        return apiClient.get(`flightPlan-t6/studentCliftonStrength`);
    },
    getAllStudentCliftonStrengths(studentId, cliftonStrengthId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength`);
    },
    getStudentCliftonStrength(studentId, cliftonStrengthId, id) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength/${id}`);
    },
    updateStudentCliftonStrength(studentId, cliftonStrengthId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength/${id}`, data);
    },
    updateSystemStudentCliftonStrength(id, data) {
        return apiClient.put(`flightPlan-t6/studentCliftonStrength/${id}`, data);
    },
    deleteStudentCliftonStrengthTwoIds(studentId, cliftonStrengthId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength/`);
    },
    deleteStudentCliftonStrength(studentId, cliftonStrengthId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength/${id}`);
    },
    deleteSystemStudentCliftonStrength(id) {
        return apiClient.delete(`flightPlan-t6/studentCliftonStrength/${id}`);
    },
    deleteAllStudentCliftonStrengths(studentId, cliftonStrengthId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/cliftonStrength/${cliftonStrengthId}/studentCliftonStrength`);
    },
    deleteAllSystemStudentCliftonStrengths() {
        return apiClient.delete(`flightPlan-t6/studentCliftonStrength`);
    }
};