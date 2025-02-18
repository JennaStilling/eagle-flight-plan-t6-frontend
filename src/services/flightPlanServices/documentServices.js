import apiClient from "../services";

export default {
    createDocument(studentId, data) {
        return apiClient.post(`flightPlan-t6/student/${studentId}/document`, data);
    },
    getAllDocuments(studentId) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/document`);
    },
    getAllSystemDocuments(){
        return apiClient.get(`flightPlan-t6/document`);
    },
    getDocument(studentId, id) {
        return apiClient.get(`flightPlan-t6/student/${studentId}/document/${id}`);
    },
    updateDocument(studentId, id, data) {
        return apiClient.put(`flightPlan-t6/student/${studentId}/document/${id}`, data);
    },
    deleteDocument(studentId, id) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/document/${id}`);
    },
    deleteAllDocuments(studentId) {
        return apiClient.delete(`flightPlan-t6/student/${studentId}/document`);
    }
};