import apiClient from "../services";

export default {
    createProfessorClass(userId, classId, data) {
        return apiClient.post(`flightPlan-t6/user/${userId}/class/${classId}/professorClass`, data);
    },
    createSystemProfessorClass(data) {
        return apiClient.post(`flightPlan-t6/professorClass`, data);
    },
    getAllProfessorClasses(userId, classId) {
        return apiClient.get(`flightPlan-t6/user/${userId}/class/${classId}/professorClass`);
    },
    getProfessorClass(userId, classId, id) {
        return apiClient.get(`flightPlan-t6/user/${userId}/class/${classId}/professorClass/${id}`);
    },
    updateProfessorClass(userId, classId, id, data) {
        return apiClient.put(`flightPlan-t6/user/${userId}/class/${classId}/professorClass/${id}`, data);
    },
    updateSystemProfessorClass(id, data) {
        return apiClient.put(`flightPlan-t6/professorClass/${id}`, data);
    },
    deleteProfessorClass(userId, classId, id) {
        return apiClient.delete(`flightPlan-t6/user/${userId}/class/${classId}/professorClass/${id}`);
    },
    deleteAllProfessorClasses(userId, classId) {
        return apiClient.delete(`flightPlan-t6/user/${userId}/class/${classId}/professorClass`);
    },
    deleteAllProfessorClasses(userId) {
        return apiClient.delete(`flightPlan-t6/user/${userId}/class/professorClass`);
    },
    deleteAllSystemProfessorClasses() {
        return apiClient.delete(`flightPlan-t6/professorClass`);
    },
};