import apiClient from "../services";

export default {
    createFlightPlan(semesterId, data) {
        return apiClient.post(`flightPlan-t6/semester/${semesterId}/flightPlan`, data);
    },
    getAllFlightPlans(semesterId) {
        return apiClient.get(`flightPlan-t6/semester/${semesterId}/flightPlan`);
    },
    getAllSystemFlightPlans(){
        return apiClient.get(`flightPlan-t6/flightPlan`);
    },
    getFlightPlan(semesterId, id) {
        return apiClient.get(`flightPlan-t6/semester/${semesterId}/flightPlan/${id}`);
    },
    updateFlightPlan(semesterId, id, data) {
        return apiClient.put(`flightPlan-t6/semester/${semesterId}/flightPlan/${id}`, data);
    },
    deleteFlightPlan(semesterId, id) {
        return apiClient.delete(`flightPlan-t6/semester/${semesterId}/flightPlan/${id}`);
    },
    deleteAllFlightPlans(semesterId) {
        return apiClient.delete(`flightPlan-t6/semester/${semesterId}/flightPlan`);
    }
};