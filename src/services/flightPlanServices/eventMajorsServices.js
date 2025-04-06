import apiClient from "../services";

export default {
    createEventMajor(eventId, majorId, data) {
      return apiClient.post(`flightPlan-t6/event/${eventId}/major/${majorId}/eventMajor`, data);
    },
    getAllEventMajors() {
      return apiClient.get(`flightPlan-t6/eventMajor`);
    },
    getEventMajor(eventId, majorId, id, data) {
      return apiClient.post(`flightPlan-t6/event/${eventId}/major/${majorId}/eventMajor/${id}`, data);
    },
    getAllEventMajors(eventId, majorId, id, data) {
        return apiClient.post(`flightPlan-t6/event/${eventId}/major/${majorId}/eventMajor/`, data);
    },
    getSystemEventMajor(id) {
      return apiClient.get(`flightPlan-t6/eventMajor/${id}`);
    },
    updateEventMajor(id, data) {
      return apiClient.put(`flightPlan-t6/eventMajor/${id}`, data);
    },
    deleteEventMajor(eventId, majorId, id) {
      return apiClient.delete(`flightPlan-t6/event/${eventId}/major/${majorId}/eventMajor/${id}`);
    },
    deleteSystemEventMajor(id) {
      return apiClient.delete(`flightPlan-t6/eventMajor/${id}`);
    },
    deleteAllEventMajors() {
      return apiClient.delete(`flightPlan-t6/eventMajor`);
    },
    getAllEventsByMajor(id) {
        return apiClient.get(`flightPlan-t6/major/${id}/events`);
    },
    getAllMajorsByEvent(id) {
        return apiClient.get(`flightPlan-t6/event/${id}/majors`)
    }
}