import apiClient from "../services.js";

export default {
    createStudent(data) {
      return apiClient.post(`resume-t6/student/`, data);
    },
    getAllStudents() {
      return apiClient.get(`resume-t6/student/`);
    },
    getStudent(id) {
      return apiClient.get(`resume-t6/student/${id}`);
    },
    updateStudent(id, data) {
      return apiClient.put(`resume-t6/student/${id}`, data);
    },
    deleteStudent(id) {
      return apiClient.delete(`resume-t6/student/${id}`);
    },
    deleteAllStudents() {
      return apiClient.delete(`resume-t6/student/`);
    },
};