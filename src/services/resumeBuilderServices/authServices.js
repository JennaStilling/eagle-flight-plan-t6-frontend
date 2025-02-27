import apiClient from "../services.js";

export default {
  loginUser(user) {
    return apiClient.post("resume-t6/login", user);
  },
  authorizeUser(code) {
    return apiClient.post("resume-t6/authorize", code);
  },
  logoutUser(token) {
    return apiClient.post("resume-t6/logout", token);
  },
};