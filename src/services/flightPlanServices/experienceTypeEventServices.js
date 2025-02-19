import { c } from "vite/dist/node/types.d-aGj9QkWt";
import apiClient from "../services";

export default {
    createExperienceTypeEvent(experienceTypeId, eventId, data) {
      return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/event/${eventId}/experienceTypeEvent`, data);
    },
    createSystemExperienceTypeEvent(data) {
        return apiClient.post(`flightPlan-t6/experienceTypeEvent`, data);
    },
    getAllExperienceTypeEvents() {
      return apiClient.get(`flightPlan-t6/experienceTypeEvent`);
    },
    getExperienceTypeEvent(experienceTypeId, eventId, id, data) {
      return apiClient.post(`flightPlan-t6/experienceType/${experienceTypeId}/event/${eventId}/experienceTypeEvent/${id}`, data);
    },
    getSystemExperienceTypeEvent(id) {
      return apiClient.get(`flightPlan-t6/experienceTypeEvent/${id}`);
    },
    updateExperienceTypeEvent(id, data) {
      return apiClient.put(`flightPlan-t6/experienceTypeEvent/${id}`, data);
    },
    deleteExperienceTypeEvent(experienceTypeId, eventId, id) {
      return apiClient.delete(`flightPlan-t6/experienceType/${experienceTypeId}/event/${eventId}/experienceTypeEvent/${id}`);
    },
    deleteSystemExperienceTypeEvent(id) {
      return apiClient.delete(`flightPlan-t6/experienceTypeEvent/${id}`);
    },
    deleteAllExperienceTypeEvents() {
      return apiClient.delete(`flightPlan-t6/experienceTypeEvent`);
    },
}