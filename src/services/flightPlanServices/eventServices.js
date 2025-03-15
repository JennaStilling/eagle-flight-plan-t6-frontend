import apiClient from "../services";

export default {
    createEvent(data) {
        return apiClient.post(`flightPlan-t6/event`, data);
    },
    getAllEvents() {
        return apiClient.get(`flightPlan-t6/event`);
    },
    updateEvent(id, data) {
        return apiClient.put(`flightPlan-t6/event/${id}`, data);
    },
    deleteEvent(id) {
        return apiClient.delete(`flightPlan-t6/event/${id}`);
    },
    deleteAllEvents() {
        return apiClient.delete(`flightPlan-t6/verification/event`);
    },
};