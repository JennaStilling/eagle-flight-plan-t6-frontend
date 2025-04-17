<template>
  <div class="container" style="overflow-y: auto">
    <div class="left-side">
      <!-- Semesters -->
      <div class="semester-navigation">
        <h1>{{ currentSemester?.name || `Loading...` }}</h1>
      </div>
      <!-- Tasks -->
      <div class="task-data-table-container">
        <table class="task-data-table">
          <tbody>
            <tr v-for="task in currentStudentSemesterFlightPlanTasks" :key="task.id">
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
            <template v-if="limitedEvents.length > 0">
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
            </template>
            <template v-else>
              <tr>
                <td colspan="3"
                  style="text-align: center; font-size: 25px; color: black; padding: 16px; user-select: none;">
                  There are no upcoming events recommended for you at this time. Click the button below to view all
                  upcoming events!
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
                  You haven't attended any events recently. Register for an event above to see it here!
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
    <div class="modal-content">
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
        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="uploadDocument()"
          v-if="getVerificationType === 'required_document' && selectedTask.status === 'in_progress' || selectedTask.status === 'unapproved'">
          Upload Document
        </v-btn>
      </v-card-actions>
    </div>
  </div>
  <!-- Event Modal -->
  <div v-if="modalVisible" class="modal-overlay" @click.self="closeEventModal">
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
      <v-btn v-if="!isStudentSignedUp" @click="closeEventModal; studentSignUpForEvent(selectedEvent.id)"
        color="#F68D76">Register</v-btn>
      <v-btn v-if="isStudentSignedUp" @click="closeEventModal; studentDeleteStudentEvent(selectedEvent.id)"
        color="#F68D76">Unregister</v-btn>
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
    <ReflectionSubmission :task="selectedTask" @close-reflection="closeModal" />
  </div>

  <div class="modal-overlay" v-if="showQuiz">
    <QuizSubmission :task="selectedTask" @close-quiz="closeModal" />
  </div>

  <div class="modal-overlay" v-if="showDocument">
    <DocumentSubmission :task="selectedTask" @close-document="closeModal" />
  </div>

  <div v-if="currentStudentFlightPlanComplete">
    <v-overlay v-model="completedOverlay" class="popup" persistent>
      <v-card class="completed-flightplan">
        <h1 style="text-align: center; color: #4CAF50;">🎉 Congratulations! 🎉</h1>
        <p style="text-align: center; font-size: 1.2rem; margin-top: 1rem;">
          You have successfully completed your Flightplan for
          <strong>{{ currentSemester?.name || `this semester` }}</strong>!
        </p>
        <p style="text-align: center; font-size: 1rem; margin-top: 1rem;">
          Keep up the great work and continue striving for success!
        </p>
        <v-btn class="button" variant="elevated" color="#5EC4B6"
          @click="completedOverlay = false, setFlightPlanComplete(currentStudentFlightPlan)">
          Take Flight!
        </v-btn>
      </v-card>
    </v-overlay>
  </div>
</template>

<script setup>
// Vue Files
import { useHomePageStore } from '@/store/homePageStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Utils from "@/config/utils";
// Service Files
import UserServices from "@/services/resumeBuilderServices/userServices";
import StudentServices from "@/services/resumeBuilderServices/studentServices";
import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import StudentEventServices from '@/services/flightPlanServices/studentEventServices';
import verificationServices from '@/services/flightPlanServices/verificationServices';
import { get } from '@vueuse/core';
import { getSemester, getFlightPlan, checkForFlightPlan } from '@/utils/flightPlanGeneration';
import { getStudentFlightPlanTasks, isStudentSemesterFlightPlanCompleteNotClaimed, setFlightPlanComplete } from '@/utils/flightPlanCompletion'
import "@/assets/generic-stylesheet.css";

import { asyncComputed } from '@vueuse/core';
import ReflectionSubmission from '@/components/flightPlanComponents/studentPages/ReflectionSubmission.vue';
import QuizSubmission from '@/components/flightPlanComponents/studentPages/QuizSubmission.vue';
import DocumentSubmission from '@/components/flightPlanComponents/studentPages/DocumentSubmission.vue';

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

const currentSemester = ref(null);
const currentFlightPlan = ref(null);
const currentStudentFlightPlan = ref(null);
const currentStudentSemesterFlightPlanTasks = ref({});
const currentStudentFlightPlanComplete = ref(false);
const completedOverlay = ref(true);

const attendanceModalVisible = ref(false);
const pastEvents = ref([]);
const registeredEventIds = ref([]);
const isStudentSignedUp = ref(false);
const specificStudentEvents = ref([]);
const showReflection = ref(false);
const showQuiz = ref(false);
const showDocument = ref(false);

onMounted(async () => {
  await getSessionData();
  await checkForFlightPlan(student.value);
  await getCurrentStudentFlightPlan();
  await getCurrentStudentFlightPlanTasks(currentStudentFlightPlan.value);

  // past events
  try {
    const eventResponse = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
    if (eventResponse.data) {
      events.value = eventResponse.data.filter(event => new Date(event.date) <= new Date(currentDate.value) && event.studentEvent[0].attendence_status === 'registered');
      events.value.sort((a, b) => new Date(a.date) - new Date(b.date));
      pastEvents.value = events.value;
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
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }

  currentStudentFlightPlanComplete.value = await isStudentSemesterFlightPlanCompleteNotClaimed(currentSemester.value, student.value);
});

const getSessionData = async () => {
  const userStore = Utils.getStore("user");
  user.value = (await UserServices.getUser(userStore.userId)).data;
  student.value = (await StudentServices.getStudent(user.value.studentId)).data;
  currentDate.value = new Date().toJSON().slice(0, 24);
}

const getCurrentStudentFlightPlan = async () => {
  currentSemester.value = await getSemester();
  currentFlightPlan.value = await getFlightPlan(currentSemester.value);
  currentStudentFlightPlan.value = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, currentFlightPlan.value.id)).data[0]
}

const getCurrentStudentFlightPlanTasks = async (currentStudentFlightPlan) => {
  currentStudentSemesterFlightPlanTasks.value = (await (getStudentFlightPlanTasks(currentStudentFlightPlan))).filter(task => task.status !== 'approved');
}

// modals --------------------
const openEventModal = async (event) => {
  selectedEvent.value = event;
  await loadRegisteredEvents(); // Load current registrations
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
  if (!user.value.studentId) {
    return
  }
  else {
    const newStudentEvent = {
      eventId: id,
      studentId: user.value.studentId
    }
    StudentEventServices.createStudentEvent(newStudentEvent)
      .then((res) => {
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
        const eventToDelete = specificStudentEvents.value.find(studentEvent => studentEvent.eventId === id && studentEvent.studentId === user.value.studentId);
        if (eventToDelete) {
          StudentEventServices.deleteStudentEvent(eventToDelete.id)
            .then((res) => {
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
    const res = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
    const studentEvents = res.data;
    const studentSpecificEvent = studentEvents.find(studentEvent =>
      studentEvent.id === id
    );
    isStudentSignedUp.value = !!studentSpecificEvent;
    return isStudentSignedUp.value;
  } catch (error) {
    console.error('Error checking student signup:', error);
    return false;
  }
}

const loadRegisteredEvents = async () => {
  try {
    const res = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
    registeredEventIds.value = res.data.map(event => event.id);
  } catch (error) {
    console.error('Error loading registered events:', error);
    registeredEventIds.value = [];
  }
};

// SIMPLE METHODS
// modals --------------------

const openAttendanceEventModal = (event) => {
  selectedEvent.value = event;
  attendanceModalVisible.value = true;
};

const openTaskModal = (task) => {
  const taskData = currentStudentSemesterFlightPlanTasks.value.find(t => t.id === task.id);
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
  if (selectedTask.value.verificationId) {
    const verification = (await verificationServices.getVerification(selectedTask.value.verificationId)).data;
    return verification.type;
  }
});

const takeReflection = () => {
  taskModalVisible.value = false;
  showReflection.value = true;
}

const takeQuiz = () => {
  taskModalVisible.value = false;
  showQuiz.value = true;
}

const uploadDocument = () => {
  taskModalVisible.value = false;
  showDocument.value = true;
}

const closeModal = () => {
  showReflection.value = false;
  showQuiz.value = false;
  showDocument.value = false;
  window.location.reload();
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
  height: 50px;
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

.completed-flightplan {
  background-color: #ffffff;
  width: 700px;
  height: 350px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>