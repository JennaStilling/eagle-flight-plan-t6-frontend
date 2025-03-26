import apiClient from "../services";

export default {
  createStudentEvent(data) {
    return apiClient.post(`flightPlan-t6/studentEvent`, data);
  },
  getAllStudentEvents() {
    return apiClient.get(`flightPlan-t6/studentEvent`);
  },
  getStudentEvent(id) {
    return apiClient.get(`flightPlan-t6/studentEvent/${id}`);
  },
  updateStudentEvent(id, data) {
    return apiClient.put(`flightPlan-t6/studentEvent/${id}`, data);
  },
  deleteStudentEvent(id) {
    return apiClient.delete(`flightPlan-t6/studentEvent/${id}`);
  },
  deleteAllStudentEvents() {
    return apiClient.delete(`flightPlan-t6/studentEvent`);
  },
  getAllEventsByStudent(id) {
    return apiClient.get(`flightPlan-t6/student/${id}/events`);
  },
  getAllStudentsByEvent(id) {
    return apiClient.get(`flightPlan-t6/event/${id}/students`)
  }
};