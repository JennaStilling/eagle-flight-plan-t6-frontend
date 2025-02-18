import apiClient from "../services.js";

// Instead of having 11 API requests, would it be better to add an if statement 
//  somehow that checks to see if the user that is making the request is a student or not?
export default {
    createUser(data) {
      return apiClient.post(`resume-t6/user/`, data);
    },
    getAllUsers() {
      return apiClient.get(`resume-t6/user/`);
    },
    getUser(id) {
      return apiClient.get(`resume-t6/user/${id}`);
    },
    updateUser(id, data) {
      return apiClient.put(`resume-t6/user/${id}`, data);
    },
    deleteUser(id) {
      return apiClient.delete(`resume-t6/user/${id}`);
    },
    deleteAllUsers() {
      return apiClient.delete(`resume-t6/user/`);
    },
    // Users as students
    createStudentUser(studentId, data) {
      return apiClient.post(`resume-t6/student/${studentId}/user`, data);
    },
    // Does this even make sense? User and student have a one-to-one relationship
    getAllStudentUsers(studentId) {
      return apiClient.get(`resume-t6/student/${studentId}/user`);
    },
    // This does the same thing as the one above it, why am I even keeping this
    getStudentUser(studentId, id) {
      return apiClient.get(`resume-t6/student/${studentId}/user/${id}`);
    },
    updateStudentUser(studentId, id, data) {
      return apiClient.put(`resume-t6/student/${studentId}/user/${id}`, data);
    },
    deleteStudentUser(studentId, id) {
      return apiClient.delete(`resume-t6/student/${studentId}/user/${id}`);
    },
  };