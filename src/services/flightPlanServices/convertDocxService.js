import apiClient from "../services";

export async function convertDocxToPdf(base64Docx) {
  try {
    const response = await apiClient.post("/flightPlan-t6/convert-docx", {
      base64Docx,
    });

    return response.data.base64Pdf; 
  } catch (error) {
    console.error("convertDocxToPdf error:", error);
    throw new Error("Failed to convert DOCX to PDF");
  }
}