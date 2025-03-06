import apiClient from "../services";

export default {
    createEvent(verificationId, data) {
        return apiClient.post(`flightPlan-t6/verification/${verificationId}/event`, data);
    },
    getAllEvents() {
        return apiClient.get(`flightPlan-t6/event`);
    },
    getAllSystemEvents() {
        return apiClient.get(`flightPlan-t6/event`);
    },
    getEvent(verificationId, id) {
        return apiClient.get(`flightPlan-t6/verification/${verificationId}/event/${id}`);
    },
    updateEvent(verificationId, id, data) {
        return apiClient.put(`flightPlan-t6/verification/${verificationId}/event/${id}`, data);
    },
    deleteEvent(verificationId, id) {
        return apiClient.delete(`flightPlan-t6/verification/${verificationId}/event/${id}`);
    },
    deleteAllEvents(verificationId) {
        return apiClient.delete(`flightPlan-t6/verification/${verificationId}/event`);
    },
};