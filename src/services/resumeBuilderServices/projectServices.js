import apiClient from "../services.js";

export default {
    createProject(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/project/`, data);
    },
    getAllProjects(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/project/`);
    },
    getProject(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/project/${id}`);
    },
    updateProject(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/project/${id}`, data);
    },
    deleteProject(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/project/${id}`);
    },
    deleteAllProjects(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/project/`);
    },
};