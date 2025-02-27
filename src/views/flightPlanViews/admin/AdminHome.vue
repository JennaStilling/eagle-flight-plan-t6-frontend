<template>
  <div class="content">
      <!-- Student Tasks List -->
      <div class="left-column">
          <div class="content-header">
            <img 
              :src="BackArrow" 
              alt="Back Arrow" 
              class="arrow-button"
              @click="prevTaskPage"
              :class="{ disabled: currentTaskPage === 1 }"
            />
            Student Tasks ({{ currentTaskPage }}/{{ totalTaskPages }})
            <img 
              :src="ForwardArrow" 
              alt="Forward Arrow" 
              class="arrow-button"
              @click="nextTaskPage"
              :class="{ disabled: currentTaskPage === totalTaskPages }"
            />
          </div>
          <div class="student-tasks-body">
            <div class="card-item" v-for="(name, index) in paginatedTasks" 
              :key="index" 
              @click="getSelectedTask(
                name, 
                studentTasks.task.tasks[(currentTaskPage - 1) * itemsPerPage + index], 
                studentTasks.reflection.reflections[(currentTaskPage - 1) * itemsPerPage + index], 
                studentTasks.id.ids[(currentTaskPage - 1) * itemsPerPage + index])">
              <div class="list-text">
                <div class="list-title"> {{ studentTasks.task.tasks[(currentTaskPage - 1) * itemsPerPage + index] }} </div>
                <div class="list-sub"> {{ name }} </div>
              </div>
            </div>
          </div>
      </div>

      <!-- Ucoming Events List -->
      <div class="right-column">
          <div>
              <div class="content-header">
                <img 
                  :src="BackArrow" 
                  alt="Back Arrow" 
                  class="arrow-button"
                  @click="prevEventPage"
                  :class="{ disabled: currentEventPage === 1 }"
                />
                Upcoming Events ({{ currentEventPage }}/{{ totalEventPages }})
                <img 
                  :src="ForwardArrow" 
                  alt="Forward Arrow" 
                  class="arrow-button"
                  @click="nextEventPage"
                  :class="{ disabled: currentEventPage === totalEventPages }"
                />
              </div>
              <div class="upcoming-events-body">
                <div class="card-item" v-for="(event, index) in paginatedEvents" 
                  :key="index" 
                  @click="getSelectedEvent(index)">
                  <div class="list-text">
                    <div class="list-title">{{ event.name }}</div>
                    <div class="list-sub">{{ eventDate(event.date) }}</div>
                  </div>
                </div>
              </div>
          </div>
      </div>
  </div>

  <!-- Student Task View Modal -->
  <div v-if="viewingTask" class="modal">
    <div class="modal-content"> 
      <span @click="toggleTaskView()" class="close">&times;</span>
      <div class="modal-header" style="font-weight: bold;"> {{ currentTask.task }} </div> 
      {{ currentTask.name }}  
      <div class="reflection-box">
        {{ currentTask.reflection }} 
      </div>

      <div class="button-group">
        <button 
          @click="selectOption('approve')" 
          :class="{ selected: selectedOption === 'approve' }">
          Approve
        </button>
        <button 
          @click="selectOption('deny')" 
          :class="{ selected: selectedOption === 'deny' }">
          Deny
        </button>
      </div>
      <div v-if="isReasonEmpty" style="color: red"> Fill out Reason for Denying </div>
      <div v-if="selectedOption === 'deny'" class="textarea-container"> 
        <textarea v-model="userInput" placeholder="Reason for Not Approving"></textarea>
      </div>
      <button v-if="selectedOption === 'deny' || selectedOption === 'approve'" 
        class="submit-button"  
        @click="completeTaskReview(currentTask.id)"> 
        Submit 
      </button>
    </div>
  </div>

  <!-- Event Viewer modal -->
  <div v-if="viewingEvent" class="modal">
    <div class="modal-content"> 
      <span @click="toggleEventView()" class="close">&times;</span>
      <div class="modal-header" style="font-size: 30px; font-weight: bold;"> 
        {{ selectedEvent.name }} 
      </div> 
      <div style="font-size: 20px;">{{ selectedEvent.description }}</div>
      <div style="margin-top: 15px;">{{ selectedEvent.location }}</div>
      <div style="margin-bottom: 15px;">Time: {{ startTime }} - {{ endTime }}</div>
      <button 
        @click="toggleEventView()"> 
        Close 
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useHomePageStore } from '@/store/homePageStore';
import BackArrow from '@/assets/ArrowBackwardIcon.svg';
import ForwardArrow from '@/assets/ArrowForwardIcon.svg';
import Utils from "@/config/utils";
// Service Files
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import studentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import studentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import taskServices from "@/services/flightPlanServices/taskServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";
import eventServices from "@/services/flightPlanServices/eventServices";

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
const currentTask = ref({
  name: null,
  task: null,
  reflection: null,
  id: null
});

// Modal Variables
const selectedOption = ref(null);
const userInput = ref("");
const isReasonEmpty = ref(false);
const studentFlightPlanTask = ref(null);
const selectedEvent = ref(null);

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
const totalTaskPages = computed(() => Math.ceil(studentTasks.value.name.names.length / itemsPerPage));

// Total event pages
const totalEventPages = computed(() => Math.ceil(upcomingEvents.value.length / itemsPerPage));

// Get paginated tasks
const paginatedTasks = computed(() => {
  const start = (currentTaskPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return studentTasks.value.name.names.slice(start, end);
});

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

const eventDate = (date) => { return new Date(date).toLocaleDateString('en-US', {
  month: 'short',  
  day: 'numeric',  
  year: 'numeric' 
})};

const startTime = computed(() => new Date(selectedEvent.value.start_date_time)
  .toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
}));

const endTime = computed(() => new Date(selectedEvent.value.end_date_time)
  .toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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
      // Add to object and put into a list
      addToStudentList();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

// Get all the information needed to put into the list
const addToStudentList = async () => {
  const promises = studentFlightPlanTasksList.value.map(async (studentFlightPlanTask) => {
    try {
      // Get task info
      const taskRes = await taskServices.getTask(studentFlightPlanTask.taskId);
      const taskName = taskRes.data.name;

      // StudentFlightPlan
      const flightPlanRes = await studentFlightPlanServices.getStudentFlightPlan(studentFlightPlanTask.studentFlightPlanId);
      const studentRes = await studentServices.getStudent(flightPlanRes.data.studentId);
      const userRes = await UserServices.getAllStudentUsers(studentRes.data.id);
      
      const studentName = userRes.data[0].fName + " " + userRes.data[0].lName;

      // Returns the data in order
      return {
        task: taskName,
        name: studentName,
        reflection: studentFlightPlanTask.reflection,
        id: studentFlightPlanTask.id,
      };
    } catch (error) {
      console.log("Error:", error);
      return null; 
    }
  });

  // Promise waits for calls to finish
  const results = await Promise.all(promises);

  // removes null values
  studentTasks.value = {
    name: { names: results.map(res => res?.name).filter(Boolean) },
    task: { tasks: results.map(res => res?.task).filter(Boolean) },
    reflection: { reflections: results.map(res => res?.reflection).filter(Boolean) },
    id: { ids: results.map(res => res?.id).filter(Boolean) }
  };
};

const getSelectedTask = (name, task, reflection, id) => {
  currentTask.value.name = name;
  currentTask.value.task = task;
  currentTask.value.reflection = reflection;
  currentTask.value.id = id;
  viewingTask.value = !viewingTask.value;
  console.log(studentTasks.value);
}

const getSelectedEvent = (index) => {
  selectedEvent.value = upcomingEvents.value[index];
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

const completeTaskReview = (id) => {
  if (selectedOption.value === 'deny' && userInput.value === "") {
    isReasonEmpty.value = true;
  }
  else {
    studentFlightPlanTaskServices.getStudentFlightPlanTask(id)
      .then((res) => {
        studentFlightPlanTask.value = res.data;
        if (selectedOption.value === 'deny') {
          studentFlightPlanTask.value.status = "unapproved";
          studentFlightPlanTask.value.unapprove_reason = userInput.value;
        }
        else {
          studentFlightPlanTask.value.status = "approved";
          studentFlightPlanTask.value.userId = user.value.userId;
        }
        studentFlightPlanTaskServices.updateSystemStudentFlightPlanTask(id, studentFlightPlanTask.value)
          .then((res) => {
            toggleTaskView();
            listStudentTasks();
          })
          .catch((error) => {
            console.log("Error: " + error);
          })
      })
      .catch((error) => {
        console.log("Error: ", error)
      })
  }
}

const clearArrays = () => {
  studentFlightPlanTasksList.value = [];
  studentTasks.value.name.names = [];
  studentTasks.value.task.tasks = [];
  studentTasks.value.reflection.reflections = [];
  studentTasks.value.id.ids = [];
}
</script>

<style scoped>
.content {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 20px; 
  padding: 35px 5%;
}


.left-column, .right-column {
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

/* .student-tasks-body {
  height: 725px;
}

.upcoming-events-body {
  height: 725px;
} */

.list-text {
  display: flex;
  flex-direction: column;
}

.list-title {
  /* font-weight: bold; */
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
  background-color: #007bff; 
  color: white;
  border: none;
  padding: 4px 12px;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 15px;
}

.card-item button:hover {
  background-color: #0056b3;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.pagination-arrow {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.arrow-button.disabled {
  opacity: 0.5;
  cursor: auto;
}

.modal {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}

.modal-content {
  min-width: 400px;
  min-height: 100px; 
  border-radius: 10px;
  background: #FFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  max-height: 90vh; 
  overflow-y: auto;
  overflow-x: auto;
}

.modal-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    color: #000;
    text-align: center;
    /* font-family: Poppins; */
    font-size: 20px;
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
  background-color: #007bff;
  border-color: #0056b3;
  color: white;
}

.submit-button {
  background-color: green;
  margin-top: 15px;
  color: white;
}
</style>