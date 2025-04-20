<template>
  <div class="admin-dashboard">
    <!-- Snackbar Notification -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout" color="#5EC4B6" style="color: white">
      {{ snackbar.text }}
    </v-snackbar>

    <!-- Header Section -->
    <div class="homepage-header">
      <div class="header-left">
        <h1>Admin Homepage</h1>
      </div>
      <div class="header-right">
        <button @click="exportDataToCSV" class="export-btn">
          Export System Analytics
        </button>
      </div>
    </div>

    <!-- Analytics Section -->
    <section class="analytics-section">
      <div class="section-header">
        <h2>Student Activity Analytics</h2>
        <div class="time-filter">
          <button class="time-btn" :class="{ active: timeFrame === 'month' }" @click="timeFrame = 'month'">
            Past 30 Days
          </button>
          <button class="time-btn" :class="{ active: timeFrame === 'all' }" @click="timeFrame = 'all'">
            Past 6 Months
          </button>
        </div>
      </div>
      <div class="graph-container">
        <StudentActivityChart :time-frame="timeFrame" />
      </div>
    </section>

    <!-- Main Content Area -->
    <div class="content">
      <!-- Student Tasks List -->
      <div class="left-column">
        <div class="content-header">
          <img :src="BackArrow" alt="Back Arrow" class="arrow-button" @click="prevTaskPage"
            :class="{ disabled: currentTaskPage === 1 }" />
          Student Tasks ({{ currentTaskPage }}/{{ totalTaskPages }})
          <img :src="ForwardArrow" alt="Forward Arrow" class="arrow-button" @click="nextTaskPage"
            :class="{ disabled: currentTaskPage === totalTaskPages }" />
        </div>
        <div class="student-tasks-body">
          <div v-if="paginatedTasks.length === 0" class="empty-state">
            <p>No tasks pending review</p>
          </div>
          <div class="card-item" v-for="(task, index) in paginatedTasks" :key="index" @click="getSelectedTask(task)">
            <div class="list-text">
              <div class="list-title">{{ getTaskName(paginatedTasks[index]) }}</div>
              <div class="list-sub">{{ getStudentName(paginatedTasks[index]) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Events List -->
      <div class="right-column">
        <div class="content-header">
          <img :src="BackArrow" alt="Back Arrow" class="arrow-button" @click="prevEventPage"
            :class="{ disabled: currentEventPage === 1 }" />
          Upcoming Events ({{ currentEventPage }}/{{ totalEventPages }})
          <img :src="ForwardArrow" alt="Forward Arrow" class="arrow-button" @click="nextEventPage"
            :class="{ disabled: currentEventPage === totalEventPages }" />
        </div>
        <div class="upcoming-events-body">
          <div v-if="paginatedEvents.length === 0" class="empty-state">
            <p>No upcoming events</p>
          </div>
          <div class="card-item" v-for="(event, index) in paginatedEvents" :key="index"
            @click="getSelectedEvent(index)">
            <div class="list-text">
              <div class="list-title">{{ event.name }}</div>
              <div class="list-sub">{{ eventDate(event.date) }}</div>
            </div>
            <div class="event-action">
              <i class="fas fa-calendar-alt"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Task View Modal -->
    <div v-if="viewingTask" class="modal">
      <div class="homepage-modal-content">
        <span @click="toggleTaskView()" class="close">&times;</span>
        <div class="modal-header" style="font-weight: bold;"> {{ getTaskName(currentTask) }} </div>
        {{ getStudentName(currentTask) }}
        <div class="reflection-box" v-if="getVerificationType === 'reflection'">
          {{ currentTask.reflection }}
        </div>
        <div v-else-if="getVerificationType === 'required_document'">
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

    <!-- Event Viewer modal -->
    <div v-if="viewingEvent" class="modal">
      <div class="homepage-modal-content">
        <span @click="toggleEventView()" class="close">&times;</span>
        <div class="modal-header" style="font-size: 30px; font-weight: bold;">
          {{ selectedEvent.name }}
        </div>
        <div style="font-size: 20px;">{{ selectedEvent.description }}</div>
        <div style="margin-top: 15px;">{{ selectedEvent.location }}</div>
        <div style="margin-bottom: 15px;">Time: {{ startTime }} - {{ endTime }}</div>
        <button @click="toggleEventView()">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useHomePageStore } from '@/store/homePageStore';
import { asyncComputed } from '@vueuse/core';
import BackArrow from '@/assets/ArrowBackwardIcon.svg';
import ForwardArrow from '@/assets/ArrowForwardIcon.svg';
import Utils from "@/config/utils";
import { format } from 'date-fns';
// Service Files
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import studentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import studentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import taskServices from "@/services/flightPlanServices/taskServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";
import eventServices from "@/services/flightPlanServices/eventServices";
import StudentEventServices from "@/services/flightPlanServices/studentEventServices";
import verificationServices from "@/services/flightPlanServices/verificationServices";
// Chart Component
import StudentActivityChart from '@/components/flightPlanComponents/adminPages/StudentActivityChart.vue';
import userServices from "@/services/resumeBuilderServices/userServices.js";

const timeFrame = ref('month'); 

const snackbar = ref({
  show: false,
  text: '',
  color: '',
  timeout: 4000
});

function showSnackbar(text, color = '#5EC4B6', timeout = 4000) {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.timeout = timeout;
  snackbar.value.show = true;
}

const user = ref(null);
const studentTasks = ref({
  name: { names: [] },
  task: { tasks: [] },
  reflection: { reflections: [] },
  id: { ids: [] }
});

const currentDate = ref(null);
const upcomingEvents = ref([]);

const studentFlightPlanTasksList = ref([]);

const viewingTask = ref(false);
const viewingEvent = ref(false);
const currentTask = ref(null);

// Modal Variables
const selectedOption = ref(null);
const userInput = ref("");
const isReasonEmpty = ref(false);
const studentFlightPlanTask = ref(null);
const selectedEvent = ref(null);

const taskNames = ref({});
const studentNames = ref({});

const homeStore = useHomePageStore();

onMounted(() => {
  user.value = Utils.getStore("user");
  currentDate.value = new Date().toJSON().slice(0, 24);
  // Get Student Tasks function call
  listStudentTasks();
  // Get Upcoming Events function call
  getAllFutureEvents();
});

// Pagination
const itemsPerPage = 6;
const currentTaskPage = ref(1);
const currentEventPage = ref(1);

// Total task pages
const totalTaskPages = computed(() => Math.ceil(studentFlightPlanTasksList.value.length / itemsPerPage));

// Total event pages
const totalEventPages = computed(() => Math.ceil(upcomingEvents.value.length / itemsPerPage));

// Get paginated tasks
const paginatedTasks = computed(() => {
  const start = (currentTaskPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return studentFlightPlanTasksList.value.slice(start, end);
});

const preloadTasks = async () => {
  for (const task of paginatedTasks.value) {
    if (!taskNames.value[task.id]) {
      const studentTask = (await taskServices.getTask(task.taskId)).data;
      const studentFlightPlan = (await studentFlightPlanServices.getStudentFlightPlan(task.studentFlightPlanId)).data;
      const studentUser = (await userServices.getAllStudentUsers(studentFlightPlan.studentId)).data[0];
      taskNames.value[task.id] = studentTask.name;
      studentNames.value[task.id] = `${studentUser.fName} ${studentUser.lName}`;
    }
  }
};

watch(paginatedTasks, preloadTasks, { immediate: true });

// Get paginated events
const paginatedEvents = computed(() => {
  const start = (currentEventPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return upcomingEvents.value.slice(start, end);
})

// Task Navigation Functions
const nextTaskPage = () => {
  if (currentTaskPage.value < totalTaskPages.value) {
    currentTaskPage.value++;
  }
};

const prevTaskPage = () => {
  if (currentTaskPage.value > 1) {
    currentTaskPage.value--;
  }
};

// Events Navigation Functions
const nextEventPage = () => {
  if (currentEventPage.value < totalEventPages.value) {
    currentEventPage.value++;
  }
};

const prevEventPage = () => {
  if (currentEventPage.value > 1) {
    currentEventPage.value--;
  }
};

const eventDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
};

const startTime = computed(() => new Date(selectedEvent.value.start_date_time)
  .toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }));

const endTime = computed(() => new Date(selectedEvent.value.end_date_time)
  .toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }));

const getAllFutureEvents = () => {
  eventServices.getAllEvents()
    .then((res) => {
      upcomingEvents.value = res.data.filter((event) => event.date > currentDate.value);
      upcomingEvents.value.sort((a, b) => new Date(a.date) - new Date(b.date));
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const listStudentTasks = () => {
  studentFlightPlanTaskServices.getAllStudentFlightPlanTasks()
    .then((res) => {
      clearArrays();
      // Gets only the tasks with status = ready_for_review
      res.data.forEach(studentFlightPlanTask => {
        if (studentFlightPlanTask.status === 'ready_for_review') studentFlightPlanTasksList.value.push(studentFlightPlanTask);
      });

      const homeStore = useHomePageStore();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getSelectedTask = async (task) => {
  currentTask.value = (await studentFlightPlanTaskServices.getStudentFlightPlanTask(task.id)).data;
  viewingTask.value = !viewingTask.value;
}

const getSelectedEvent = (index) => {
  selectedEvent.value = upcomingEvents.value[(currentEventPage.value - 1) * itemsPerPage + index];
  viewingEvent.value = !viewingEvent.value;
}

// Toggle Modal
const toggleTaskView = () => {
  viewingTask.value = !viewingTask.value;
  selectedOption.value = "";
  isReasonEmpty.value = false;
}

const toggleEventView = () => {
  viewingEvent.value = !viewingEvent.value;
}

// Approve or Deny Options
const selectOption = (option) => {
  selectedOption.value = option;
};

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
}

const clearArrays = () => {
  studentFlightPlanTasksList.value = [];
}

const exportDataToCSV = async () => {
  try {
    showSnackbar('Preparing analytics export...', 'info', 60000);

    // Fetch all required data
    const [eventResponse, taskResponse] = await Promise.all([
      StudentEventServices.getAllStudentEvents(),
      studentFlightPlanTaskServices.getAllStudentFlightPlanTasks()
    ]);

    const events = eventResponse.data;
    const tasks = taskResponse.data;

    // Create monthly data summaries
    const monthlySummaries = generateMonthlySummaries(events, tasks);

    // Create CSV content
    const csvRows = [];

    // Add CSV header
    csvRows.push(['Month', 'Task Submissions', 'Approved Tasks', 'Event Submissions', 'Approved Events', 'Total Activities']);

    // Add data rows
    monthlySummaries.forEach(month => {
      csvRows.push([
        month.label,
        month.taskSubmissions,
        month.taskApprovals,
        month.eventSubmissions,
        month.eventApprovals,
        month.taskSubmissions + month.taskApprovals + month.eventSubmissions + month.eventApprovals
      ]);
    });

    // Convert the data to CSV string
    let csvContent = csvRows.map(row =>
      row.map(cell =>
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(',')
    ).join('\n');

    // Create download link
    const date = new Date();
    const fileName = `eagle_flight_plan_analytics_${format(date, 'yyyy-MM-dd')}.csv`;

    // Create download link and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSnackbar('Analytics exported successfully!', 'success', 3000);
  } catch (error) {
    console.error('Error exporting data:', error);
    showSnackbar('Error exporting data. Please try again.', 'error', 5000);
  }
};

/**
 * Generate monthly summaries for CSV export - all time since Jan 2025
 */
const generateMonthlySummaries = (events, tasks) => {
  const now = new Date(); // Current date
  const summaries = [];

  // Start from January 2025, change later for production whenever system goes live
  const startDate = new Date(2025, 0, 1); // January 1, 2025

  // Calculate how many months to process
  const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth() + 1;

  // Process each month from Jan 2025 to current month
  for (let i = 0; i < monthsDiff; i++) {
    const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    monthStart.setHours(0, 0, 0, 0);

    let monthEnd;
    if (i === monthsDiff - 1) {
      // Last month (current month) ends today
      monthEnd = new Date(now);
    } else {
      // Other months end on their last day
      monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    }
    monthEnd.setHours(23, 59, 59, 999);

    const monthLabel = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Initialize counters
    let taskSubmissions = 0;
    let taskApprovals = 0;
    let eventSubmissions = 0;
    let eventApprovals = 0;

    // Count events in this month
    events.forEach(event => {
      if (!event.updatedAt) return;

      const eventDate = new Date(event.updatedAt);
      if (eventDate >= monthStart && eventDate <= monthEnd) {
        if (event.verification_status === 'in_progress') {
          eventSubmissions++;
        } else if (event.verification_status === 'approved') {
          eventApprovals++;
        }
      }
    });

    // Count tasks in this month
    tasks.forEach(task => {
      if (!task.updatedAt) return;

      const taskDate = new Date(task.updatedAt);
      if (taskDate >= monthStart && taskDate <= monthEnd) {
        if (task.status === 'ready_for_review') {
          taskSubmissions++;
        } else if (task.status === 'approved') {
          taskApprovals++;
        }
      }
    });

    summaries.push({
      label: monthLabel,
      taskSubmissions,
      taskApprovals,
      eventSubmissions,
      eventApprovals
    });
  }

  return summaries;
};

const getTaskName = (task) => {
  return taskNames.value[task.id] || 'Loading...';
};

const getStudentName = (task) => {
  return studentNames.value[task.id] || 'Loading...';
}

const getVerificationType = asyncComputed(async () => {
  const task = (await taskServices.getTask(currentTask.value.taskId)).data;
  if (task.verificationId){
    const verification = (await verificationServices.getVerification(task.verificationId)).data;
    return verification.type;
  }
});
</script>

<style scoped>
/* Global Dashboard Styles */
.admin-dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  background-color: #ffffff;
  padding: 2rem;
  min-height: 100vh;
}

/* Dashboard Header */
.homepage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.homepage-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.user-info {
  background-color: #FAFAFA;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

/* Analytics Section */
.analytics-section {
  background-color: #FAFAFA;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.time-filter {
  display: flex;
  gap: 0.5rem;
}

.time-btn {
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-btn:hover {
  background-color: #edf2f7;
}

.time-btn.active {
  background-color: #5EC4B6;
  border-color: #5EC4B6;
  color: white;
}

.graph-container {
  width: 100%;
  height: 300px;
  background-color: #f9fafc;
  border-radius: 10px;
  overflow: hidden;
}

.graph-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background-color: #f7fafc;
  border: 1px dashed #cbd5e0;
}

.graph-placeholder span {
  font-size: 1.25rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.graph-placeholder p {
  font-size: 0.875rem;
  color: #718096;
  max-width: 400px;
}

/* Content Section */
.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 0 0 35px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
}

.arrow-button {
  width: 65px;
  height: 65px;
  background: #D9D9D9;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 65px;
  color: #202020;
  font-size: 2vw;
  font-weight: 400;
  text-align: center;
}

.student-tasks-body,
.upcoming-events-body {
  width: 100%;
  max-width: 700px;
  background: #FAFAFA;
  flex-grow: 1;
  min-height: 500px;
  height: 75vh;
  overflow-y: auto;
}

.list-text {
  display: flex;
  flex-direction: column;
}

.list-title {
  font-size: clamp(14px, 1.5vw, 22px);
}

.list-sub {
  font-size: 16px;
  color: #555;
}

.card-item {
  width: 100%;
  max-width: 700px;
  background: #F9F7F7;
  box-shadow: 0px 4px 4px rgba(32, 32, 32, 0.20);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  font-size: 1.2vw;
  border-radius: 10px;
  margin: 5px 0;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 8px 12px rgba(32, 32, 32, 0.3);
}

.card-item button {
  color: white;
  border: none;
  padding: 4px 12px;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 15px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
  color: #a0aec0;
  text-align: center;
}

.arrow-button.disabled {
  opacity: 0.5;
  cursor: auto;
}

.event-action i {
  font-size: 1.25rem;
  color: #5EC4B6;
}

/* Modal Styling */
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

/* Export Button Styles */
.export-btn {
  background-color: white;
  color: #5EC4B6;
  border: 2px solid #5EC4B6;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: auto;
}

.export-btn:hover {
  background-color: #5EC4B6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.export-btn i {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.role-icon {
  color: #5EC4B6;
  font-size: 1.8rem;
  margin-right: 0.75rem;
}
</style>