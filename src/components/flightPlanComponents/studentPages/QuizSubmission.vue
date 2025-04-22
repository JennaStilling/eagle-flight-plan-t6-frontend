<template>
    <v-card class="centered-card modal-content">
        <h2>{{ task.name }}</h2>
        <p>{{ task.description }}</p>
        <a v-if="task.video_link" :href="task.video_link" target="_blank">Watch Video</a>
        <p>Complete the quiz to close the window</p>
        <div style="color: red">{{ message }}</div>

        <div class="form-wrapper">
            <iframe
                ref="googleFormIframe"
                :src="googleFormUrl"
                class="form-iframe"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
            >
                Loading…
            </iframe>
        </div>

        <v-card-actions>
            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="closeQuiz()" :disabled="loading">Done</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount  } from "vue";
import { deleteQuizResult } from "@/services/flightPlanServices/quizLinkServices";
import studentFlightPlanTaskServices from "@/services/flightPlanServices/studentFlightPlanTaskServices";
import verificationServices from "@/services/flightPlanServices/verificationServices";
import userServices from "@/services/resumeBuilderServices/userServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";
import Utils from "@/config/utils";


const emit = defineEmits(['close-quiz']);

const props = defineProps({
    task: Object
});

const user = ref(null);
const student = ref(null);
const verification = ref(null);
const googleFormUrl = ref(null);
const message = ref('');
const quizUpdates = ref([]);
const loading = ref(true);
const googleFormIframe = ref(null);
let eventSource = null;

onMounted(async () => {
    user.value = Utils.getStore("user");
    setListener();
    await getVerification();
    googleFormUrl.value = verification.value.public_google_form_url + "?embedded=true";
    await getStudent();
});

const setListener = () => {
    const baseurl = getBaseUrl()
    eventSource = new EventSource(baseurl + 'flightPlan-t6/quiz-results/events');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.payload.email === user.value.email) {
            quizUpdates.value.push(data);
            loading.value = false;
            checkScore(data);
        }
    };

    eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        eventSource.close();
        loading.value = false;
    };
}

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close();
  }
});

const getStudent = async () => {
    const studentUser = (await userServices.getUser(user.value.userId)).data;
    student.value = (await studentServices.getStudent(studentUser.studentId)).data;
}

const getBaseUrl = () => {
    let baseurl = "";
    if (import.meta.env.DEV) {
    baseurl = "http://localhost:3026/";
    } else {
    baseurl = "/";
    }
    return baseurl;
}

const closeQuiz = () => {
    if (!loading.value) {
        emit('close-quiz');
    }
}

const getVerification = async () => {
    verification.value = (await verificationServices.getVerification(props.task.verificationId)).data;
}

const checkScore = async (results) => {
    const studentFlightPlanTask = (await studentFlightPlanTaskServices.getStudentFlightPlanTask(props.task.student_flight_plan_task_id)).data;

    if (results.payload.status === "Passed") {
        message.value = `Congratulations, you passed. You can now close the window`;
        studentFlightPlanTask.status = "approved";
        studentFlightPlanTask.points_earned = props.task.point_value;
        studentFlightPlanTask.completed_date = new Date().toISOString;
        student.value.total_points += props.task.point_value;
        student.value.points += props.task.point_value;
        await studentServices.updateStudent(student.value.id, student.value);
    }
    else {
        message.value = `Unfortunatly, you did not pass. Close the window and retake the quiz`;
        studentFlightPlanTask.status = "unapproved";
        studentFlightPlanTask.unapprove_reason = "Did not pass the quiz";
    }
    await studentFlightPlanTaskServices.updateSystemStudentFlightPlanTask(studentFlightPlanTask.id, studentFlightPlanTask);
    await clearResults(results.payload.id);
}

const clearResults = async (id) => {
    return await deleteQuizResult(id);
}
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  max-width: 600px;
  width: 90vw;
  border-radius: 15px;
}

.form-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
}

.form-iframe {
  width: 100%;
  height: 40vh;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>