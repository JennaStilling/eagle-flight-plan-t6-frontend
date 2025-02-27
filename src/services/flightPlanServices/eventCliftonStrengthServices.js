import apiClient from "../services";

export default {
    createEventCliftonStrength(eventId, cliftonStrengthId, data) {
      return apiClient.post(`flightPlan-t6/event/${eventId}/cliftonStrength/${cliftonStrengthId}/eventCliftonStrength`, data);
    },
    getAllEventCliftonStrengths() {
      return apiClient.get(`flightPlan-t6/eventCliftonStrength`);
    },
    getEventCliftonStrength(eventId, cliftonStrengthId, id, data) {
      return apiClient.post(`flightPlan-t6/event/${eventId}/cliftonStrength/${cliftonStrengthId}/eventCliftonStrength/${id}`, data);
    },
    getAllEventCliftonStrengths(eventId, cliftonStrengthId, id, data) {
        return apiClient.post(`flightPlan-t6/event/${eventId}/cliftonStrength/${cliftonStrengthId}/eventCliftonStrength/`, data);
    },
    getSystemEventCliftonStrength(id) {
      return apiClient.get(`flightPlan-t6/eventCliftonStrength/${id}`);
    },
    updateEventCliftonStrength(id, data) {
      return apiClient.put(`flightPlan-t6/eventCliftonStrength/${id}`, data);
    },
    deleteEventCliftonStrength(eventId, cliftonStrengthId, id) {
      return apiClient.delete(`flightPlan-t6/event/${eventId}/cliftonStrength/${cliftonStrengthId}/eventCliftonStrength/${id}`);
    },
    deleteSystemEventCliftonStrength(id) {
      return apiClient.delete(`flightPlan-t6/eventCliftonStrength/${id}`);
    },
    deleteAllEventCliftonStrengths() {
      return apiClient.delete(`flightPlan-t6/eventCliftonStrength`);
    },
}