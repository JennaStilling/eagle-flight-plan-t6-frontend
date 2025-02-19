import apiClient from "../services";

export default {
    createTransaction(userId, studentId, awardId, data) {
        return apiClient.post(`flightPlan-t6/user/${userId}/student/${studentId}/award/${awardId}/transaction`, data);
    },
    createSystemTransaction(data) {
        return apiClient.post(`flightPlan-t6/transaction`, data);
    },
    getAllTransactions(userId, studentId, awardId) {
        return apiClient.get(`flightPlan-t6/user/${userId}/student/${studentId}/award/${awardId}/transaction`);
    },
    getTransaction(userId, studentId, awardId, id) {
        return apiClient.get(`flightPlan-t6/user/${userId}/student/${studentId}/award/${awardId}/transaction/${id}`);
    },
    updateTransaction(userId, studentId, awardId, id, data) {
        return apiClient.put(`flightPlan-t6/user/${userId}/student/${studentId}/award/${awardId}/transaction/${id}`, data);
    },
    updateSystemTransaction(id, data) {
        return apiClient.put(`flightPlan-t6/transaction/${id}`, data);
    },
    deleteTransaction(userId, studentId, awardId, id) {
        return apiClient.delete(`flightPlan-t6/user/${userId}/student/${studentId}/award/${awardId}/transaction/${id}`);
    },
    deleteSystemTransaction(id) {
        return apiClient.delete(`flightPlan-t6/transaction/${id}`);
    },
    deleteAllTransactions(userId, studentId, awardId) {
        return apiClient.delete(`flightPlan-t6/user/${userId}/student/${studentId}/award/${awardId}/transaction`);
    },
    deleteAllSystemTransactions() {
        return apiClient.delete(`flightPlan-t6/transaction`);
    }
};