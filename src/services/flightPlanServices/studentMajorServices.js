import apiClient from "../services";

export default {
    createStudentMajor(studentId, majorId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/major/${majorId}/studentMajor`, data);
    },
    createSystemStudentMajor(data) {
        return apiClient.post(`flightPlan-t6/studentMajor`, data);
    },
    getAllStudentMajors(studentId, majorId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/major/${majorId}/studentMajor`);
    },
    getStudentMajor(studentId, majorId, id) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/major/${majorId}/studentMajor/${id}`);
    },
    updateStudentMajor(studentId, majorId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/major/${majorId}/studentMajor/${id}`, data);
    },
    updateSystemStudentMajor(id, data) {
        return apiClient.put(`flightPlan-t6/studentMajor/${id}`, data);
    },
    deleteStudentMajor(studentId, majorId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/major/${majorId}/studentMajor/${id}`);
    },
    deleteSystemStudentMajor(id) {
        return apiClient.delete(`flightPlan-t6/studentMajor/${id}`);
    },
    deleteAllStudentMajors(studentId, majorId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/major/${majorId}/studentMajor`);
    },
    deleteAllSystemStudentMajors() {
        return apiClient.delete(`flightPlan-t6/studentMajor`);
    }
};