<template>
    <div>
        <v-card flat>
            <div class="title-row">
                <h1 class="table-title">Task Approvals</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>
                </div>
            </div>
        </v-card>
        <v-data-table :headers="headers" :items="filteredTasks" :search="search" v-model:selectable="selected"
            show-select @click:row="(task, { item }) => getSelectedTask(item)">
        </v-data-table>

        <!-- Popup Modal -->
        <div v-if="viewingTask" class="modal">
            <div class="homepage-modal-content">
                <span @click="toggleTaskView()" class="close">&times;</span>
                <div class="modal-header" style="font-weight: bold;"> {{ currentTask.taskName }} </div>
                {{ currentTask.studentName }}
                <div class="reflection-box" v-if="currentTask.verificationType === 'Reflection'">
                    {{ currentTask.reflection }}
                </div>
                <div v-else-if="currentTask.verificationType === 'Document'">
                    <img
                        v-if="currentTask.required_document_type?.startsWith('image/')"
                        :src="currentTask.required_document"
                        alt="Uploaded Image"
                        style="max-width: 100%; max-height: 300px"
                    />

                    <iframe
                        v-else-if="currentTask.required_document_type === 'application/pdf'"
                        :src="currentTask.required_document"
                        width="600px"
                        height="450px"
                    ></iframe>

                    <div v-else>
                        <p>Preview not available for this file type.</p>
                        <a :href="currentTask.required_document" download target="_blank">
                        Download {{ currentTask.required_document_type }}
                        </a>
                    </div>
                </div>

                <div class="button-group">
                <button @click="selectOption('approve')" :class="{ selected: selectedOption === 'approve' }">
                    Approve
                </button>
                <button @click="selectOption('deny')" :class="{ selected: selectedOption === 'deny' }">
                    Deny
                </button>
                </div>
                <div v-if="isReasonEmpty" style="color: red"> Fill out Reason for Denying </div>
                <div v-if="selectedOption === 'deny'" class="textarea-container">
                    <textarea v-model="userInput" placeholder="Reason for Not Approving"></textarea>
                </div>
                <button v-if="selectedOption === 'deny' || selectedOption === 'approve'" class="submit-button"
                    @click="completeTaskReview(currentTask.id)">
                    Submit
                </button>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, watch, nextTick } from 'vue';
import Utils from "@/config/utils";
import verificationServices from "@/services/flightPlanServices/verificationServices";
import studentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import studentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import userServices from "@/services/resumeBuilderServices/userServices.js";
import taskServices from "@/services/flightPlanServices/taskServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";

const user = ref(null);
const search = ref('');
const tasks = ref([]);
const message = ref('');
const selected = ref([]);
const viewingTask = ref(false);
const selectedFilter = ref('All');
const currentTask = ref(null);
const selectedOption = ref(null);
const userInput = ref("");
const isReasonEmpty = ref(false);
const studentFlightPlanTask = ref(null);

const studentFlightPlanTasksList = ref(null);

const headers = ref([
    { align: 'start', key: 'taskName', title: 'Task' },
    { key: 'studentName', title: 'Student' },
    { key: 'verificationType', title: 'Submission Type' }
]);

const tasksForApproval = ref([]);

onMounted(() => {
  user.value = Utils.getStore("user");
  
  listStudentTasks();
});

const filteredTasks = computed(() => {
  return tasksForApproval.value.map(task => ({
    ...task,
    verificationType:
      task.verificationType === "reflection"
        ? "Reflection"
        : task.verificationType === "required_document"
        ? "Document"
        : task.verificationType
  }));
});

const listStudentTasks = async () => {
    clearArrays();
    const data = (await studentFlightPlanTaskServices.getAllStudentFlightPlanTasks()).data;
    studentFlightPlanTasksList.value = data.filter(task => task.status === "ready_for_review");
    studentFlightPlanTasksList.value.forEach(async task => {
        const studentTask = (await taskServices.getTask(task.taskId)).data;
        const studentFlightPlan = (await studentFlightPlanServices.getStudentFlightPlan(task.studentFlightPlanId)).data;
        const studentUser = (await userServices.getAllStudentUsers(studentFlightPlan.studentId)).data[0];
        const verification = await getVerificationForTask(studentTask);
        tasksForApproval.value.push({
            id: task.id,
            taskName: studentTask.name,
            studentName: `${studentUser.fName} ${studentUser.lName}`,
            verificationType: verification.type
        });
    });
}

const getSelectedTask = async (task) => {
    const data = (await studentFlightPlanTaskServices.getStudentFlightPlanTask(task.id)).data;
    currentTask.value = {
        ...data,
        taskName: task.taskName,
        studentName: task.studentName,
        verificationType: task.verificationType,
    }
    viewingTask.value = !viewingTask.value;
}

const getVerificationForTask = async (task) => {
    if (task.verificationId){
        return (await verificationServices.getVerification(task.verificationId)).data;
    }
}

const toggleTaskView = () => {
  viewingTask.value = !viewingTask.value;
  selectedOption.value = "";
  isReasonEmpty.value = false;
}

const selectOption = (option) => {
  selectedOption.value = option;
};

const clearArrays = () => {
  tasksForApproval.value = [];
}

const completeTaskReview = async (id) => {
  if (selectedOption.value === 'deny' && userInput.value === "") {
    isReasonEmpty.value = true;
    return
  }

  studentFlightPlanTask.value = (await studentFlightPlanTaskServices.getStudentFlightPlanTask(id)).data;
  if (selectedOption.value === 'deny') {
    studentFlightPlanTask.value.status = "unapproved";
    studentFlightPlanTask.value.unapprove_reason = userInput.value;
  }
  else {
    studentFlightPlanTask.value.status = "approved";  
    studentFlightPlanTask.value.userId = user.value.userId;
    const task = (await taskServices.getTask(studentFlightPlanTask.value.taskId)).data;
    const studentFlightPlan = (await studentFlightPlanServices.getStudentFlightPlan(studentFlightPlanTask.value.studentFlightPlanId)).data;
    const student = (await studentServices.getStudent(studentFlightPlan.studentId)).data;
    student.points = task.point_value;
    student.total_points = task.point_value;
    await studentServices.updateStudent(student.id, student);
  }

  await studentFlightPlanTaskServices.updateSystemStudentFlightPlanTask(id, studentFlightPlanTask.value);
  toggleTaskView();
  listStudentTasks();
  userInput.value = '';
}
</script>

<style scope>
.title-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
}

.table-title {
    font-family: 'Poppins', sans-serif !important;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
}

.search-filter-button-group {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
    justify-content: flex-start;
}

.search-bar {
    width: 250px;
    min-width: 180px;
    max-width: 300px;
    flex-shrink: 1;
}

.filter-menu {
    width: 180px;
    min-width: 150px;
    max-width: 200px;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.homepage-modal-content {
  background-color: white;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

.modal-header {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 15px;
  font-size: 30px;
  font-weight: bold;
}

.reflection-box {
  width: 100%;
  display: flex;
  justify-content: center;
  border: 2px solid #B0B0B0;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  resize: vertical;
  outline: none;
  justify-content: space-between;
  margin: 15px 0;
}

.search-field {
    margin-bottom: 8px;
}

.search-container {
    padding: 16px 24px;
    width: 100%;
    box-sizing: border-box;
}

.search-field {
    width: 100%;
}

.header-row {
    background-color: #f5f5f5;
    pointer-events: none;
}

.textarea-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.textarea-container textarea {
  width: 100%;
  min-height: 100px;
  border: 2px solid #B0B0B0;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  resize: vertical;
  outline: none;
}

.textarea-container textarea:focus {
  border-color: #888;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

button {
  background-color: #e0e0e0;
  border: 2px solid transparent;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
  transition: all 0.3s ease;
  width: 100px;
}

button:hover {
  background-color: #d6d6d6;
}

button.selected {
  background-color: #5EC4B6;
  border-color: #4dafa0;
  color: white;
}

.submit-button {
  background-color: #5EC4B6;
  margin-top: 15px;
  color: white;
  width: 100%;
}
</style>