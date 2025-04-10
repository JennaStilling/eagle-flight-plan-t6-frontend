<template>
    <v-card class="centered-card modal-content">
        <h2>{{ task.name }}</h2>
        <p>{{ task.description }}</p>
        <a v-if="task.video_link" :href="task.video_link" target="_blank">Watch Video</a>
        <div style="color: red">{{ message }}</div>
        <v-textarea v-model="reflection" placeholder="Enter a reflection for this task" style="min-height: 300px;"></v-textarea>
        <v-card-actions>
            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="submitReflection()">Submit</v-btn>
            <v-btn class="button" variant="elevated" color="#D9D9D9" @click="closeReflection()">Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref } from "vue";
import studentFlightPlanTaskServices from "@/services/flightPlanServices/studentFlightPlanTaskServices";

const emit = defineEmits(['close-reflection']);

const reflection = ref('');
const message = ref('');

const props = defineProps({
    task: Object
});

const closeReflection = () => {
    emit('close-reflection');
}

const submitReflection = async () => {
    if (reflection.value == ''){
        message.value = 'You did not add a reflection';
        return;
    }
    const studentFlightPlanTask = (await studentFlightPlanTaskServices.getStudentFlightPlanTask(props.task.student_flight_plan_task_id)).data;
    studentFlightPlanTask.reflection = reflection.value;
    studentFlightPlanTask.status = "ready_for_review"
    await studentFlightPlanTaskServices.updateSystemStudentFlightPlanTask(studentFlightPlanTask.id, studentFlightPlanTask);
    emit('close-reflection');
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
}
</style>