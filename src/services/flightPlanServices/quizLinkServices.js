import apiClient from "../services";
const googleSheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;

export async function linkFormToSheet(formId) {
    try {
      const response = await apiClient.post("/flightPlan-t6/link-form", {
        formId: formId,
        sheetId: googleSheetId,
      });
  
      return response.data.result || response.data.error || "No response";
    } catch (error) {
      console.error("linkFormToSheet error:", error);
      return "Failed to link form. See console for details.";
    }
  }
