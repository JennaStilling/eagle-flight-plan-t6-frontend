import apiClient from "../services.js";

export default {
    createSkill(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/skill/`, data);
    },
    getAllSkills(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/skill/`);
    },
    getSkill(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/skill/${id}`);
    },
    updateSkill(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/skill/${id}`, data);
    },
    deleteSkill(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/skill/${id}`);
    },
    deleteAllSkills(studentId) {
      return apiClient.delete(`resume-t6/student/${studentId}/skill/`);
    },
};