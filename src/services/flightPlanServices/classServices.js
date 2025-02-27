import apiClient from "../services";

export default {
    createFlightPlan(semesterId, data) {
        return apiClient.post(`flightPlan-t6/semester/${semesterId}/class`, data);
    },
    getAllFlightPlans(semesterId) {
        return apiClient.get(`flightPlan-t6/semester/${semesterId}/class`);
    },
    getAllSystemFlightPlans(){
        return apiClient.get(`flightPlan-t6/class`);
    },
    getFlightPlan(semesterId, id) {
        return apiClient.get(`flightPlan-t6/semester/${semesterId}/class/${id}`);
    },
    updateFlightPlan(semesterId, id, data) {
        return apiClient.put(`flightPlan-t6/semester/${semesterId}/class/${id}`, data);
    },
    deleteFlightPlan(semesterId, id) {
        return apiClient.delete(`flightPlan-t6/semester/${semesterId}/class/${id}`);
    },
    deleteAllFlightPlans(semesterId) {
        return apiClient.delete(`flightPlan-t6/semester/${semesterId}/class`);
    },
    deleteAllSystemFlightPlans() {
        return apiClient.delete(`flightPlan-t6/flightPlan`);
    }
};