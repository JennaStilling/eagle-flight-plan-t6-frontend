import apiClient from "../services";

export default {
    createStudentClass(studentId, classId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/class/${classId}/studentClass`, data);
    },
    createSystemStudentClass(data) {
        return apiClient.post(`flightPlan-t6/studentClass`, data);
    },
    getAllStudentClasses(studentId, classId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/class/${classId}/studentClass`);
    },
    getStudentClass(studentId, classId, id) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/class/${classId}/studentClass/${id}`);
    },
    updateStudentClass(studentId, classId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/class/${classId}/studentClass/${id}`, data);
    },
    updateSystemStudentClass(id, data) {
        return apiClient.put(`flightPlan-t6/studentClass/${id}`, data);
    },
    deleteStudentClass(studentId, classId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/class/${classId}/studentClass/${id}`);
    },
    deleteSystemStudentClass(id) {
        return apiClient.delete(`flightPlan-t6/studentClass/${id}`);
    },
    deleteAllStudentClasses(studentId, classId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/class/${classId}/studentClass`);
    },
    deleteAllSystemStudentClasses() {
        return apiClient.delete(`flightPlan-t6/studentClass`);
    }
};