import { get } from "@vueuse/core";
import apiClient from "../services";

export default {
    createFlightPlanTask(flightPlanId, taskId, data) {
        return apiClient.post(`flightPlan-t6/flightPlan/${flightPlanId}/task/${taskId}/flightPlanTask`, data);
    },
    getAllFlightPlanTasks(flightPlanId, taskId) {
        return apiClient.get(`flightPlan-t6/flightPlan/${flightPlanId}/task/${taskId}/flightPlanTask`);
    },
    getAllFlightPlanTasksByFlightPlanId(flightPlanId) {
        return apiClient.get(`flightPlan-t6/flightPlan/${flightPlanId}/flightPlanTask`);
    },
    getAllSystemFlightPlanTasks() {
        return apiClient.get(`flightPlan-t6/flightPlanTask`);
    },
    getFlightPlanTask(flightPlanId, taskId, id) {
        return apiClient.get(`flightPlan-t6/flightPlan/${flightPlanId}/task/${taskId}/flightPlanTask/${id}`);
    },
    updateFlightPlanTask(flightPlanId, taskId, id, data) {
        return apiClient.put(`flightPlan-t6/flightPlan/${flightPlanId}/task/${taskId}/flightPlanTask/${id}`, data);
    },
    deleteFlightPlanTask(flightPlanId, taskId, id) {
        return apiClient.delete(`flightPlan-t6/flightPlan/${flightPlanId}/task/${taskId}/flightPlanTask/${id}`);
    },
    deleteAllFlightPlanTasks(flightPlanId, taskId) {
        return apiClient.delete(`flightPlan-t6/flightPlan/${flightPlanId}/task/${taskId}/flightPlanTask`);
    }
};