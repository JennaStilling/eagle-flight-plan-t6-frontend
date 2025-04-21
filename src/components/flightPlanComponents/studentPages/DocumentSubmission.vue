<template>
    <v-card class="centered-card modal-content">
        <h2>{{ task.name }}</h2>
        <p>{{ task.description }}</p>
        <a v-if="task.video_link" :href="task.video_link" target="_blank">Watch Video</a>
        <div style="color: red">{{ message }}</div>
        
        <div style="margin-bottom: 5px;">
            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="triggerFileInput">Upload File</v-btn>

            <input
                type="file"
                ref="fileInput"
                style="display: none"
                @change="fileUpload"
            />
        </div>

        <div v-if="isLoading">
            <v-progress-circular indeterminate color="primary" />
            <p>Loading...</p>
        </div>
        
        <div v-else-if="documentSubmission">
            <img
                v-if="documentType?.startsWith('image/')"
                :src="display"
                alt="Uploaded Image"
                style="max-width: 100%; max-height: 300px"
            />

            <iframe
                v-else-if="documentType === 'application/pdf'"
                :src="display"
                width="600px"
                height="450px"
            ></iframe>

            <div v-else>
                <p>Preview not available for this file type.</p>
                <a :href="display" download target="_blank">
                    Download {{ documentType }}
                </a>
            </div>
        </div>

        <v-card-actions>
            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="submitDocument()" :disabled="!documentSubmission && !isLoading">Submit</v-btn>
            <v-btn class="button" variant="elevated" color="#D9D9D9" @click="closeDocument()">Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref } from "vue";
import studentFlightPlanTaskServices from "@/services/flightPlanServices/studentFlightPlanTaskServices";
import { convertDocxToPdf } from "@/services/flightPlanServices/convertDocxService";

const emit = defineEmits(['close-document']);

const message = ref('');
const documentSubmission = ref(null);
const documentType = ref(null);
const display = ref(null);
const isLoading = ref(false);

const props = defineProps({
    task: Object
});

const closeDocument = () => {
    emit('close-document');
}

const submitDocument = async () => {
    if (!documentSubmission) {
        message.value = "No File selected";
        return;
    }

    const studentFlightPlanTask = (await studentFlightPlanTaskServices.getStudentFlightPlanTask(props.task.student_flight_plan_task_id)).data;
    studentFlightPlanTask.required_document = documentSubmission.value;
    studentFlightPlanTask.required_document_type = documentType.value;
    studentFlightPlanTask.status = "ready_for_review";
    await studentFlightPlanTaskServices.updateSystemStudentFlightPlanTask(studentFlightPlanTask.id, studentFlightPlanTask);
    emit('close-document');
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.click();
};

const fileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file); 
        reader.onload = () => {
            isLoading.value = true;
            const base64String = reader.result; 
            documentSubmission.value = base64String; 
            documentType.value = file.type;
            checkFileType();
        };
    }
};

const checkFileType = async () => {
    display.value = documentSubmission.value;
    if (documentType.value === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        documentSubmission.value = await convertDocxToPdf(documentSubmission.value);
        documentType.value = "application/pdf";
        display.value = `data:${documentType.value};base64,${documentSubmission.value}`;
    }
    documentSubmission.value = documentSubmission.value.replace(/^data:.*;base64,/, '');
    isLoading.value = false;
}

</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  width: fit-content;
  max-width: 100%;
  border-radius: 15px;
}
</style>