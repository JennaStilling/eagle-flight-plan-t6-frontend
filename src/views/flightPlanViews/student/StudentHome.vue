<template>
  <div class="container">
    <div class="left-side">
      <!-- Semesters -->
      <div class="semester-navigation">
        <button @click="getPreviousSemester">
          <img :src="BackArrow" alt="Previous Semester" />
        </button>
        <h1>{{ semesters[currentSemesterIndex]?.name || `Loading...` }}</h1>
        <button @click="getNextSemester">
          <img :src="ForwardArrow" alt="Next Semester" />
        </button>
      </div>
      <!-- Tasks -->
      <div class="task-data-table-container">
        <table class="task-data-table">
          <tbody>
            <tr v-for="task in studentSemesterFlightPlanTasks[currentSemesterIndex] || []" :key="task.id">
              <td class="task-card" @click="openTaskModal(task)">
                <div class="task-content">{{ task.name }} - {{ task.point_value }}pts</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="right-side">
      <!-- Shop Card -->
      <div class="shop-card" @click="goToShop">
        <img src="@/assets/navigation/shoppingCart.png" alt="Shopping Cart" class="shopping-cart-icon" />
        <div class="shop-info">
          <h1>Shop</h1>
          <p>You have <strong style="color: #811429; font-weight: 700;">{{ student?.points }}</strong> points</p>
        </div>
      </div>
      <div class="events-navigation">
        <h1>Upcoming Recommended Events</h1>
      </div>
      <div class="event-data-table-container">
        <table class="event-data-table">
          <tbody>
            <template v-for="event in limitedEvents" :key="event.id">
              <tr @click="openEventModal(event)" class="clickable-row">
                <td class="date">
                  <div class="month">{{ new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short'
                  }).toLocaleUpperCase() }}</div>
                  <div class="day">{{ new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' }) }}</div>
                </td>
                <td style="user-select: none;">
                  {{ new Date(event.start_date_time).toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: 'numeric',
                    hour12: true
                  }).replace('AM', 'am').replace('PM', 'pm') }} - {{ new
                    Date(event.end_date_time).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: 'numeric', hour12:
                        true
                    }).replace('AM', 'am').replace('PM', 'pm') }}
                  <br>
                  <span style="font-size: 30px; font-weight: 100; user-select: none;">{{ event.name }}</span>
                </td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3">
                  <hr class="event-line">
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <p class="view-more" @click.self="viewMoreEvents">View More 🡺</p>
      </div>
      <!-- Confirm Event Attendance -->
      <div class="events-navigation">
        <h1>Confirm Your Attendance</h1>
      </div>
      <div class="event-data-table-container">
        <table class="event-data-table">
          <tbody>
            <template v-if="pastEvents.length > 0">
              <template v-for="event in pastEvents" :key="event.id">
                <tr @click="openAttendanceEventModal(event)" class="clickable-row">
                  <td class="date">
                    <div class="month">{{ new Date(event.start_date_time).toLocaleDateString('en-US', {
                      month: 'short'
                    }).toLocaleUpperCase() }}</div>
                    <div class="day">{{ new Date(event.start_date_time).toLocaleDateString('en-US', { day: '2-digit' })
                    }}
                    </div>
                  </td>
                  <td style="user-select: none;">
                    {{ new Date(event.start_date_time).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: 'numeric',
                      hour12: true
                    }).replace('AM', 'am').replace('PM', 'pm') }} - {{ new
                      Date(event.end_date_time).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: 'numeric', hour12:
                          true
                      }).replace('AM', 'am').replace('PM', 'pm') }}
                    <br>
                    <span style="font-size: 30px; font-weight: 100; user-select: none;">{{ event.name }}</span>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="3">
                    <hr class="event-line">
                  </td>
                </tr>
              </template>
            </template>
            <template v-else>
              <tr>
                <td colspan="3"
                  style="text-align: center; font-size: 25px; color: black; padding: 16px; user-select: none;">
                  You haven't attended any events recently. Register for an event above to see it here.
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Task Modal -->
  <div v-if="taskModalVisible" class="modal-overlay" @click.self="closeTaskModal">
    <div class="homepage-modal-content">
      <span @click="closeTaskModal" class="close" style="font-size: 2rem;">&times;</span>
      <h2>{{ selectedTask.name }}</h2>
      <div style="font-size: 20px; text-align: center;">{{ selectedTask.description }}</div>
      <div v-if="selectedTask.video_link" style="margin-top: 15px;">
        <a :href="selectedTask.video_link" target="_blank">Access resource</a>
      </div>
      <div style="margin-top: 15px;">Earn <span style="font-weight:bold;">{{ selectedTask.point_value }}</span> points
      </div>
      <div style="margin-top: 15px;">Status: {{ selectedTask.status === 'in_progress' ? 'in progress' :
        selectedTask.status }}</div>
      <div v-if="selectedTask.status === 'unapproved'" style="margin-top: 15px;">Reason: {{
        selectedTask.unapprove_reason
      }}</div>
      <v-spacer></v-spacer>
      <v-card-actions>
        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="viewFlightPlan">
          View Flight Plan
        </v-btn>
        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="takeReflection()" 
          v-if="getVerificationType === 'reflection' && selectedTask.status === 'in_progress' || selectedTask.status === 'unapproved'">
          Reflection
        </v-btn>
        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="takeQuiz()" 
          v-if="getVerificationType === 'quiz' && selectedTask.status != 'approved'">
          Take Quiz
        </v-btn>
      </v-card-actions>
    </div>
  </div>
  <!-- Event Modal -->
  <div v-if="modalVisible" class="modal-overlay" @click.self="closeEventModal">
    <div class="homepage-modal-content">
      <span @click="closeEventModal" class="close" style="font-size: 2rem;">&times;</span>
      <h2>{{ selectedEvent.name }}</h2>
      <div style="font-size: 20px; text-align: center;">{{ selectedEvent.description }}</div>
      <div style="margin-top: 15px;">Earn <span style="font-weight:bold;">{{ selectedEvent.point_value }}</span> points
      </div>
      <div style="margin-top: 15px;">{{ selectedEvent.location }}</div>
      <div style="margin-bottom: 15px;">
        {{ new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
        }}
      </div>
      <div style="margin-bottom: 15px;">
        {{ new Date(selectedEvent.start_date_time).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          hour12: true
        }) }} -
        {{ new Date(selectedEvent.end_date_time).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          hour12:
            true
        }) }}
      </div>
    </div>
  </div>

  <!-- Event Attendance Modal -->
  <div v-if="attendanceModalVisible" class="modal-overlay" @click.self="closeEventModal">
    <div class="modal-content">
      <span @click="closeEventModal" class="close" style="font-size: 2rem;">&times;</span>
      <h2>{{ selectedEvent.name }}</h2>
      <div style="font-size: 20px; text-align: center;">{{ selectedEvent.description }}</div>
      <div style="margin-top: 15px;">Earn <span style="font-weight:bold;">{{ selectedEvent.point_value }}</span> points
      </div>
      <div style="margin-top: 15px;">{{ selectedEvent.location }}</div>
      <div style="margin-bottom: 15px;">
        {{ new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
        }}
      </div>
      <div style="margin-bottom: 15px;">
        {{ new Date(selectedEvent.start_date_time).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          hour12: true
        }) }} -
        {{ new Date(selectedEvent.end_date_time).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
          hour12: true
        }) }}
      </div>
      <div class="button-row">
        <v-btn @click="closeEventModal; studentAttendedEvent(selectedEvent.id)" color="#5EC4B6"
          style="color: white;">Attended</v-btn>
        <v-btn @click="closeEventModal; studentNotAttendedEvent(selectedEvent.id)" color="#F04E3E">Did Not
          Attend</v-btn>
      </div>
    </div>
  </div>

  <div class="modal-overlay" v-if="showReflection">
    <ReflectionSubmission :task="selectedTask"
    @close-reflection="closeModal"
    />
  </div>

  <div class="modal-overlay" v-if="showQuiz">
    <QuizSubmission :task="selectedTask"
    @close-quiz="closeModal"
    />
  </div>
</template>

<script setup>
// Vue Files
import { useHomePageStore } from '@/store/homePageStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Utils from "@/config/utils";
// Image Files
import BackArrow from '@/assets/ArrowBackwardIcon.svg';
import ForwardArrow from '@/assets/ArrowForwardIcon.svg';
// Service Files
import UserServices from "@/services/resumeBuilderServices/userServices";
import StudentServices from "@/services/resumeBuilderServices/studentServices";
import StudentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import TaskServices from "@/services/flightPlanServices/taskServices";
import EventServices from "@/services/flightPlanServices/eventServices";
import SemesterServices from '@/services/flightPlanServices/semesterServices';
import FlightPlanServices from '@/services/flightPlanServices/flightPlanServices';
import StudentEventServices from '@/services/flightPlanServices/studentEventServices';
import verificationServices from '@/services/flightPlanServices/verificationServices';
import { get } from '@vueuse/core';
import { getSemester, getFlightPlan, generateFlightPlan } from '@/utils/flightPlanGeneration';
import "@/assets/generic-stylesheet.css";

import { asyncComputed } from '@vueuse/core';
import ReflectionSubmission from '@/components/flightPlanComponents/studentPages/reflectionSubmission.vue';
import QuizSubmission from '@/components/flightPlanComponents/studentPages/quizSubmission.vue';

// CONSTS
const homeStore = useHomePageStore();
const router = useRouter();
// user consts
const user = ref(null);
const student = ref(null);
// semester & event consts
const currentDate = ref([]);
const events = ref([]);
const limitedEvents = ref([]);
const modalVisible = ref(false);
const selectedEvent = ref({});
const taskModalVisible = ref(false);
const selectedTask = ref({});

const semesters = ref([]);
const currentSemesterIndex = ref(0);
const studentSemesterFlightPlanTasks = ref({});

const attendanceModalVisible = ref(false);
const pastEvents = ref([]);

const showReflection = ref(false);
const showQuiz = ref(false);

onMounted(async () => {
  await getSessionData();
  await checkForFlightPlan(student.value);

  await getAllSemesterData();
  await getSemesterTasks(currentSemesterIndex.value);

  // past events
  try {
    const eventResponse = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
    if (eventResponse.data) {
      events.value = eventResponse.data.filter(event => new Date(event.date) <= new Date(currentDate.value) && event.studentEvent[0].attendence_status === 'registered');
      events.value.sort((a, b) => new Date(a.date) - new Date(b.date));
      pastEvents.value = events.value;
      // console.log(pastEvents.value)
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
  // upcoming events
  try {
    const eventResponse = await StudentServices.getRecommendedEvents(user.value.studentId);
    if (eventResponse.data) {
      events.value = eventResponse.data.filter(event => new Date(event.date) >= new Date(currentDate.value));
      events.value.sort((a, b) => new Date(a.date) - new Date(b.date));
      limitedEvents.value = events.value.slice(0, 3);
      // console.log(limitedEvents.value)
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
});

const getSessionData = async () => {
  const userStore = Utils.getStore("user");
  const tempUser = await UserServices.getUser(userStore.userId);
  user.value = tempUser.data;
  const tempStudent = await StudentServices.getStudent(user.value.studentId);
  student.value = tempStudent.data;
  currentDate.value = new Date().toJSON().slice(0, 24);
}

const getAllSemesterData = async () => {
  await getSemesters();
  sortSemestersByDate();
  await getCurrentSemesterIndex();
}

const getSemesters = async () => {
  const studentFlightPlans = await StudentFlightPlanServices.getAllFlightPlansForStudent(student.value.id);
  for (const studentFlightPlan of studentFlightPlans.data) {
    const flightPlan = await FlightPlanServices.getFlightPlanById(studentFlightPlan.flightPlanId);
    const semester = await SemesterServices.getSemester(flightPlan.data.semesterId);
    semesters.value.push(semester.data);
  }
}

const sortSemestersByDate = () => {
  semesters.value = semesters.value.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
}

const getCurrentSemesterIndex = async () => {
  const currentSemester = await getSemester();
  currentSemesterIndex.value = semesters.value.findIndex(
    (semester) => semester.name === currentSemester.name
  );
}

// flight plan tasks are sorted by semester indexes for the sake of switching between semesters
const getSemesterTasks = async (semesterIndex) => {
  if (studentSemesterFlightPlanTasks.value[semesterIndex]) {
    return;
  }

  const flightPlan = await getFlightPlan(semesters.value[semesterIndex]);
  const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, flightPlan.id)).data;
  const currentFlightPlan = studentFlightPlan[0];
  const studentFlightPlanTasks = (await StudentFlightPlanTaskServices.getStudentFlightPlanTasks(currentFlightPlan.id)).data;

  const newSemesterTasks = [];

  for (const studentFlightPlanTask of studentFlightPlanTasks) {
    const task = await TaskServices.getTask(studentFlightPlanTask.taskId);
    if (studentFlightPlanTask.status !== 'approved') {
      newSemesterTasks.push({
        ...task.data,
        status: studentFlightPlanTask.status,
        unapprove_reason: studentFlightPlanTask.unapprove_reason,
        student_flight_plan_task_id: studentFlightPlanTask.id
      })
    }
  }
  studentSemesterFlightPlanTasks.value[semesterIndex] = newSemesterTasks;
}

// modals --------------------
const openEventModal = async (event) => {
  selectedEvent.value = event;
  await checkIfStudentIsSignedUp(event.id);
  modalVisible.value = true;
};
const closeEventModal = () => {
  modalVisible.value = false;
  attendanceModalVisible.value = false;
};


// exit homepage with router ---
const goToShop = () => {
  router.push({ name: 'shop' });
};
const viewMoreEvents = () => {
  localStorage.setItem('viewPersonalCalendar', false);
  router.push({ name: 'student-events' });
};
// semester navigation ----------------------------------------------
const getPreviousSemester = async () => {
  if (currentSemesterIndex.value > 0) {
    currentSemesterIndex.value--;
    await getSemesterTasks(currentSemesterIndex.value)
  }
};
const getNextSemester = async () => {
  if (currentSemesterIndex.value < semesters.value.length - 1) {
    currentSemesterIndex.value++;
    await getSemesterTasks(currentSemesterIndex.value)
  }
};

// Check for flight plan
const checkForFlightPlan = async (student) => {
  const semester = await getSemester();
  const flightPlan = await getFlightPlan(semester);
  const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.id, flightPlan.id)).data;
  if (studentFlightPlan.length < 1) await generateFlightPlan(student, semester);
}

// event stuff
const viewFlightPlan = () => {
  router.push({ name: 'studentFlightPlan' })
}

const studentAttendedEvent = (id) => {
  StudentEventServices.getAllEventsByStudent(user.value.studentId)
    .then((res) => {
      const studentEvents = res.data;
      const newData = studentEvents.filter(event => event.studentEvent[0].eventId === id)
      if (newData) {
        newData[0].studentEvent[0].attendence_status = 'attended';
        newData[0].studentEvent[0].verification_status = 'in_progress';
      }
      StudentEventServices.updateStudentEvent(newData[0].studentEvent[0].id, newData[0].studentEvent[0])
        .then(async (res) => {
          const eventResponse = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
          if (eventResponse.data) {
            events.value = eventResponse.data.filter(event => new Date(event.date) <= new Date(currentDate.value) && event.studentEvent[0].attendence_status === 'registered');
            events.value.sort((a, b) => new Date(a.date) - new Date(b.date));
            pastEvents.value = events.value;
          }
          closeEventModal();
        })
        .catch((error) => {
          console.log("error", error);
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
}
const studentNotAttendedEvent = (id) => {
  StudentEventServices.getAllEventsByStudent(user.value.studentId)
    .then((res) => {
      const studentEvents = res.data;
      const newData = studentEvents.filter(event => event.studentEvent[0].eventId === id)
      if (newData) {
        newData[0].studentEvent[0].attendence_status = 'did_not_attend';
        newData[0].studentEvent[0].verification_status = 'in_progress';
      }
      StudentEventServices.updateStudentEvent(newData[0].studentEvent[0].id, newData[0].studentEvent[0])
        .then(async (res) => {
          const eventResponse = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
          if (eventResponse.data) {
            events.value = eventResponse.data.filter(event => new Date(event.date) <= new Date(currentDate.value) && event.studentEvent[0].attendence_status === 'registered');
            events.value.sort((a, b) => new Date(a.date) - new Date(b.date));
            pastEvents.value = events.value;
          }
          closeEventModal();
        })
        .catch((error) => {
          console.log("error", error);
        });
    })
    .catch((error) => {
      console.log("error", error);
    });
}
const studentSignUpForEvent = (id) => {
  if (!studentId.value) {
    return
  }
  else {
    const newStudentEvent = {
      eventId: id,
      studentId: studentId.value
    }
    StudentEventServices.createStudentEvent(newStudentEvent)
      .then((res) => {
        console.log("Student event added")
        closeEventModal();
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
}
const studentDeleteStudentEvent = (id) => {
  StudentEventServices.getAllStudentEvents()
    .then((res) => {
      specificStudentEvents.value = res.data;
      if (specificStudentEvents.value) {
        const eventToDelete = specificStudentEvents.value.find(studentEvent => studentEvent.eventId === id && studentEvent.studentId === userStudentId.value);
        if (eventToDelete) {
          StudentEventServices.deleteStudentEvent(eventToDelete.id)
            .then((res) => {
              console.log("Student event deleted")
              closeEventModal();
            })
            .catch((error) => {
              console.log("error", error);
            });
        }
      }
    })
}
const checkIfStudentIsSignedUp = async (id) => {
  try {
    const res = await StudentEventServices.getAllEventsByStudent(studentId.value);
    const studentEvents = res.data;
    const studentSpecificEvent = studentEvents.find(studentEvent =>
      studentEvent.id === id
    );
    console.log(studentSpecificEvent);
    isStudentSignedUp.value = !!studentSpecificEvent;
    return isStudentSignedUp.value;
  } catch (error) {
    console.error('Error checking student signup:', error);
    return false;
  }
}
const getStudentFlightPlanId = async (studentId, flightPlanId) => {
  try {
    const response = await studentFlightPlanServices.getStudentFlightPlanByStudentAndFlightPlan(studentId, flightPlanId);
    if (response.data) {
      return response.data[0].id;
    }
  } catch (error) {
    console.error(`Error fetching student flight plan ID for student ID ${studentId} and flight plan ID ${flightPlanId}:`, error);
  }
};
const getStudentFlightPlanTask = async (studentFlightPlanTaskId) => {
  try {
    const response = await studentFlightPlanTaskServices.getStudentFlightPlanTask(studentFlightPlanTaskId);
    if (response.data) {
      if (response.data.status === 'unapproved' || response.data.status === 'in_progress') {
        unapprovedOrInProgressTasks.value.push(response.data);
      }
      await fetchTaskDetailsForUnapprovedOrInProgressTasks();
    }
  } catch (error) {
    console.error("Error fetching student flight plan task for student: " + error);
  }
};
// Fetch task details for unapproved or in-progress tasks
const fetchTaskDetailsForUnapprovedOrInProgressTasks = async () => {
  taskDetails.value = []; // Clear task details before fetching new ones
  const promises = unapprovedOrInProgressTasks.value.map(async (task) => {
    try {
      const taskDetail = await getTaskDetails(task.taskId);
      if (taskDetail) {
        return {
          ...taskDetail,
          status: task.status,
          unapprove_reason: task.unapprove_reason
        };
      }
    } catch (error) {
      console.error(`Error fetching task details for task ID ${task.taskId}:`, error);
      return null;
    }
  });
  const results = await Promise.all(promises);
  taskDetails.value = results.filter(Boolean); // Remove null values
};
// SIMPLE METHODS
// modals --------------------

const openAttendanceEventModal = (event) => {
  selectedEvent.value = event;
  attendanceModalVisible.value = true;
};

const openTaskModal = (task) => {
  const taskData = studentSemesterFlightPlanTasks.value[currentSemesterIndex.value].find(t => t.id === task.id);
  selectedTask.value = {
    ...task,
    status: taskData.status,
    unapprove_reason: taskData.unapprove_reason
  };
  taskModalVisible.value = true;
};
const closeTaskModal = () => {
  taskModalVisible.value = false;
};

const getVerificationType = asyncComputed(async () => {
  if (selectedTask.value.verificationId){
    const verification = (await verificationServices.getVerification(selectedTask.value.verificationId)).data;
    return verification.type;
  }
});

const takeReflection = () => {
  taskModalVisible.value = false;
  showReflection.value = true;
}

const closeModal = () => {
  showReflection.value = false;
  showQuiz.value = false;
  window.location.reload();
}

const takeQuiz = () => {
  taskModalVisible.value = false;
  showQuiz.value = true;
}
// exit homepage with router ---


</script>

<style scoped>
/* MAIN LAYOUT ----------------------*/
.container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
}

.left-side,
.right-side {
  width: 50%;
  padding: 17px;
  margin-left: 2%;
}

/* SEMESTER NAVIGATION --------------*/
/* Ask about how to balance the buttons on the screen */
.semester-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  color: #FAFAFA;
  border-radius: 20px 20px 0 0;
  padding: 9px;
  position: relative;
  width: 95%;
  margin-top: 2%;
}

.semester-navigation button {
  background-color: #D9D9D9;
  border: none;
  cursor: pointer;
  margin-left: 6%;
  margin-right: 6%;
  margin-top: 1%;
  user-select: none;
}

.semester-navigation h1 {
  margin: 0;
  color: black;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.7rem;
  user-select: none;
}

/* SHOP CARD ---------------------------*/
.shop-card {
  display: flex;
  align-items: center;
  background-color: #FAFAFA;
  color: black;
  border-radius: 16px;
  padding: 27px;
  width: 95%;
  height: 20%;
  margin: 2% 0 4%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, background-color 0.3s ease, border 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.shop-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border: 4px solid #811429;
  background-color: white;
}

/* - Icons and Info */
.shop-card .shopping-cart-icon {
  width: 67px;
  height: 67px;
  margin-right: 20px;
}

.shop-card .shop-info {
  display: flex;
  flex-direction: column;
}

.shop-info p {
  font-size: 1.5rem;
}

/* Data Tables ----------------------------------*/
.event-data-table-container {
  width: 95%;
  background-color: #FAFAFA;
  border: 1px solid #FAFAFA;
  border-radius: 0 0 20px 20px;
}

.task-data-table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 90%;
  background-color: #FAFAFA;
  padding-left: 10%;
  overflow-y: auto;
}

.event-data-table,
.task-data-table {
  width: 100%;
  border-collapse: collapse;
  color: black;
}

.event-data-table td {
  padding: 3px;
  font-size: 16px;
}

.task-data-table tbody {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* EVENT INFO --------------------------*/

/*- Events Navigation */
.events-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: white;
  color: black;
  border-radius: 20px 20px 0 0;
  padding: 18px;
  position: relative;
  width: 95%;
  margin-top: 4%;
}

.events-navigation h1 {
  margin: 0;
  color: black;
  font-size: 1.7rem;
  user-select: none;
}

/* - Date and Time */
.date {
  display: flex;
  flex-direction: column;
  margin-top: 2%;
  font-size: 24px;
}

.month {
  font-size: 16px;
  text-align: center;
}

.day {
  font-size: 30px;
  text-align: center;
  font-weight: 650;
}

.time {
  text-align: left;
  user-select: none;
}

.event-name {
  font-size: 24px;
  text-align: left;
  user-select: none;
}

/* - Divider */
.event-line {
  border: none;
  border-top: 1.1px solid black;
  width: 95%;
  padding: 10;
  margin: 0 auto;
}

.clickable-row:hover {
  cursor: pointer;
  background-color: white;
  transform: scale(1.0009);
}

.view-more {
  font-size: 23px;
  color: black;
  font-weight: 700;
  text-align: right;
  padding-right: 2%;
  margin: 2% 0;
  cursor: pointer;
  user-select: none;
}

/* - Events Modal---------------------------*/
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Events task cards */
.task-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 4px #81142966;
  height: 60px;
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3%;
  cursor: pointer;
}

.task-card:hover {
  box-shadow: 0px 6px 6px #81142966;
  border: 2px solid #811429;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  transform: scale(1.03);
}

.task-card:hover .task-content {
  font-weight: 401;
}

.task-content {
  color: #811429;
  font-size: 120%;
  font-weight: 400;
  text-align: center;
  user-select: none;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  width: 100%;
}
</style>