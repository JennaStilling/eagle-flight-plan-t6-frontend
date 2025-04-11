<template>
    <h1 class="pa-5">Student Flight Plan</h1>
    <div class="semester-navigation">
        <v-btn :disabled="currentSemesterIndex + 1 === 1" @click="getPreviousSemester" density="comfortable"
            icon="mdi-arrow-left" variant="tonal" rounded>
            </v-btn>
                <h1>{{ semesters[currentSemesterIndex]?.name || `Loading...` }}</h1>
                <v-btn :disabled="currentSemesterIndex + 1 >= semesters.length" @click="getNextSemester"
                    density="comfortable" icon="mdi-arrow-right" variant="tonal" rounded>
                    >
                </v-btn>
    </div>
    <v-divider />
    <v-card class="stuff">
        <h1 class="pa-5">Tasks
            <v-btn class="button" variant="elevated" color="#5EC4B6" @click="requestTaskPopup()">
                Request Custom Task
            </v-btn>
        </h1>
        <v-data-iterator :items="studentSemesterFlightPlanTasks[currentSemesterIndex] || []" :items-per-page="4"
            v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="task in items" :key="task.raw.id" cols="auto" md="3">
                            <TaskPreview :key="task.raw.id" :task="task.raw"
                                :show-overlay="selectedTaskId === task.raw.id"
                                @show-recommended-events="showRecommendedEventsModal"
                                @update:showOverlay="(value) => handleTaskOverlay(value, task.raw.id)" />
                        </v-col>
                    </v-row>
                </v-container>
            </template>

            <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                <div class="d-flex align-center justify-center pa-4">
                    <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="tonal" rounded
                        @click="prevPage">
                    </v-btn>

                            <div class="mx-2 text-caption">
                                Page {{ page }} of {{ pageCount }}
                            </div>

                            <v-btn :disabled="page >= pageCount" density="comfortable" icon="mdi-arrow-right"
                                variant="tonal" rounded @click="nextPage"> > </v-btn>
                </div>
            </template>
        </v-data-iterator>
    </v-card>

    <v-overlay v-model="showRecommendedEvents" class="recommended-events-overlay">
        <v-card class="modal-content">
            <div class="modal-header">
                <h3>Recommended Events</h3>
            </div>
            <div class="event-data-table-container">
                <table class="event-data-table">
                    <tbody>
                        <template v-for="event in recommendedEvents" :key="event.id">
                            <tr @click="openEventModal(event)" class="clickable-row">
                                <td class="date">
                                    <Icon v-if="isEventRegistered(event)" icon="material-symbols:bookmark-rounded"
                                        width="24" height="24" />
                                    <div class="month">{{ new Date(event.start_date_time).toLocaleDateString('en-US', {
                                        month: 'short'
                                    }).toLocaleUpperCase() }}</div>
                                    <div class="day">{{ new Date(event.start_date_time).toLocaleDateString('en-US', {
                                        day: '2-digit'
                                    }) }}</div>
                                </td>
                                <td style="user-select: none;">
                                    {{ new Date(event.start_date_time).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true
                                    }).replace('AM', 'am').replace('PM', 'pm') }} - {{ new
                                        Date(event.end_date_time).toLocaleTimeString('en-US', {
                                            hour: 'numeric', minute:
                                                'numeric', hour12:
                                                true
                                        }).replace('AM', 'am').replace('PM', 'pm') }}
                                    <br>
                                    <span style="font-size: 30px; font-weight: 100; user-select: none;">{{ event.name
                                    }}</span>
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
            </div>
            <v-divider></v-divider>
            <v-card-actions class="popup-actions">
                <v-spacer></v-spacer>
                <v-btn color="#708E9A" variant="flat" @click="closeRecommendedEvents">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-overlay>

    <v-overlay v-model="modalVisible" class="recommended-events-overlay">
        <v-card class="modal-content">
            <span @click="closeEventModal" class="close" style="font-size: 2rem;">&times;</span>
            <h2>{{ selectedEvent.name }}</h2>
            <div style="font-size: 20px; text-align: center;">{{ selectedEvent.description }}</div>
            <div style="margin-top: 15px;">Earn <span style="font-weight:bold;">{{ selectedEvent.point_value }}</span>
                points
            </div>
            <div style="margin-top: 15px;">{{ selectedEvent.location }}</div>
            <div style="margin-bottom: 15px;">
                {{ new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    month: 'long', day: '2-digit', year:
                        'numeric'
                })
                }}
            </div>
            <div style="margin-bottom: 15px;">
                {{ new Date(selectedEvent.start_date_time).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute:
                        '2-digit',
                    hour12: true
                }) }} -
                {{ new Date(selectedEvent.end_date_time).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute:
                        '2-digit',
                    hour12: true
                }) }}
            </div>
            <v-btn v-if="!isStudentSignedUp" @click="closeEventModal; studentSignUpForEvent(selectedEvent.id)"
                color="#F68D76">Register</v-btn>
        </v-card>
    </v-overlay>

    <div v-for="(experienceType) in experienceTypesForStudentFlightPlans[currentSemesterIndex] || []"
        :key="experienceType.id">
        <v-divider />
        <v-card class="stuff" :class="{
            'experience-completed': experienceType.experienceCompleted === true,
        }">
            <div class="title-row">
                <h1>{{ experienceType.name }}</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search for Event" variant="solo" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>
                    <v-btn class="button" variant="elevated" color="#5EC4B6" @click="ViewEventsPage()">
                        View All Events
                    </v-btn>
                </div>
            </div>
            <v-data-iterator
                :items="eventsByExperienceTypesForStudentFlightPlans[currentSemesterIndex][experienceType.id] || []"
                :items-per-page="6" v-if="!loading">
                <template v-slot:default="{ items }">
                    <v-container class="pa-5" fluid>
                        <v-row dense>
                            <v-col v-for="event in items" :key="event.id" cols="auto" md="4">
                                <EventPreview :key="event.raw.id" :event="event.raw" />
                            </v-col>
                        </v-row>
                    </v-container>
                </template>

                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                    <div class="d-flex align-center justify-center pa-4">
                        <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="tonal"
                            rounded @click="prevPage">
                        </v-btn>

                                <div class="mx-2 text-caption">
                                    Page {{ page }} of {{ pageCount }}
                                </div>

                                <v-btn :disabled="page >= pageCount" density="comfortable" icon="mdi-arrow-right"
                                    variant="tonal" rounded @click="nextPage"> > </v-btn>
                    </div>
                </template>
            </v-data-iterator>
        </v-card>
    </div>

    <div v-if="showTaskDetails" class="modal edit-form-body">
    <v-card class="edit-popup mx-auto">
      <v-card-title class="popup-header">
        <v-text-field v-model="requestName"></v-text-field>
      </v-card-title>

      <v-divider></v-divider>
      <!-- Start of Body -->
      <v-container class="popup-content">
        <!-- Description-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.description }}</label>
          </v-col>
          <v-col cols="7">
            <v-textarea v-model="requestDescription" rows="2" variant="outlined" density="compact"></v-textarea>
          </v-col>
        </v-row>

        <!-- Rationale-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.rationale }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="requestRationale" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-divider></v-divider>

      <v-card-actions class="popup-actions">
        <v-spacer></v-spacer>
        <v-btn color="#708E9A" variant="flat" class="button" @click="showTaskDetails = false">Cancel</v-btn>
        <v-btn color="#5EC4B6" variant="flat" class="button" @click="taskRequest = requestTask()">Request</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
// Vue Files
import { useHomePageStore } from '@/store/homePageStore';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Utils from "@/config/utils";
import { Icon } from "@iconify/vue";

import UserServices from "@/services/resumeBuilderServices/userServices.js";
import StudentServices from "@/services/resumeBuilderServices/studentServices";
//Tasks / Semesters
import SemesterServices from '@/services/flightPlanServices/semesterServices';
import FlightPlanServices from "@/services/flightPlanServices/flightPlanServices";
import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import StudentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import TaskServices from "@/services/flightPlanServices/taskServices";
import StudentEventServices from "@/services/flightPlanServices/studentEventServices"
//Experiences
import StudentFlightPlanExperienceTypeEventServices from "@/services/flightPlanServices/studentFlightPlanExperienceTypeEventServices";
import StudentFlightPlanExperienceTypeServices from "@/services/flightPlanServices/studentFlightPlanExperienceTypeServices";
import ExperienceTypeServices from "@/services/flightPlanServices/experienceTypeServices";
import ExperienceTypeEventServices from "@/services/flightPlanServices/experienceTypeEventServices";
import EventServices from "@/services/flightPlanServices/eventServices";

import { getSemester, getFlightPlan, generateFlightPlan } from '@/utils/flightPlanGeneration';
import { getRecommendedEventsForTask, getRecommendedEventsForExperience } from '@/utils/eventRecommendation'

// Components
import TaskPreview from "@/components/flightPlanComponents/studentPages/taskPreview.vue";
import EventPreview from "@/components/flightPlanComponents/studentPages/eventPreview.vue";
import "@/assets/generic-stylesheet.css";

const router = useRouter();
const user = ref(null);
const student = ref(null);

const semesters = ref([]);
const currentSemesterIndex = ref(0);

const studentSemesterFlightPlanTasks = ref({});

const experienceTypesForStudentFlightPlans = ref({});
const eventsByExperienceTypesForStudentFlightPlans = ref({});

const recommendedEvents = ref([]);
const modalVisible = ref(false);
const selectedEvent = ref(null);
const isStudentSignedUp = ref(false);

const registeredEventIds = ref([]);

const deleteError = ref(false);
const showTaskDetails = ref(false);
const taskRequest = ref(false);
const requestCategory = ref("");
const requestScheduleType = ref("");
const requestName = ref("");
const requestDescription = ref("");
const requestPointValue = ref(0);
const requestRationale = ref("");

const loadRegisteredEvents = async () => {
    try {
        const res = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
        registeredEventIds.value = res.data.map(event => event.id);
    } catch (error) {
        console.error('Error loading registered events:', error);
        registeredEventIds.value = [];
    }
};

const isEventRegistered = (event) => {
    return registeredEventIds.value.includes(event.id);
};

const search = ref(""); //fix search for each event

const loading = computed(() => {
    return Object.values(loadingData.value).some(value => value);
});

const loadingData = ref({
    studentExperiences: false,
    experienceTypes: false,
    roles: false,
    students: false,
    cliftonStrengths: false,
    studentCliftonStrengths: false,
});

const labels = {
  category: "Category",
  reflection: "Reflection Required?",
  schedule: "Frequency",
  description: "Description",
  rationale: "Rationale",
  semesters: "Semesters",
  points: "Point Value",
  prereq: "Pre-Requisites",
  video: "Video Link",
  verification: "Verification Type"
};

const showRecommendedEvents = ref(false);
const selectedTaskId = ref(null);
const currentTaskData = ref(null);

const handleTaskOverlay = (show, taskId) => {
    selectedTaskId.value = show ? taskId : null;
};

const showRecommendedEventsModal = async (task) => {
    currentTaskData.value = task;
    showRecommendedEvents.value = true;

    try {
        recommendedEvents.value = await getRecommendedEventsForTask(task);
        await loadRegisteredEvents(); // Load registered events when opening the modal
        console.log('Recommended events:', recommendedEvents.value);
    } catch (error) {
        console.error('Error fetching recommended events:', error);
    }
};

const closeRecommendedEvents = () => {
    showRecommendedEvents.value = false;
    // Reopen the task preview
    if (currentTaskData.value) {
        selectedTaskId.value = currentTaskData.value.id;
    }
};

const studentSignUpForEvent = async (eventId) => {
    try {
        const newStudentEvent = {
            eventId: eventId,
            studentId: user.value.studentId
        }
        await StudentEventServices.createStudentEvent(newStudentEvent);
        await loadRegisteredEvents();
    } catch (error) {
        console.error('Error signing up for event:', error);
    }
};

const studentDeleteStudentEvent = async (eventId) => {
    try {
        const eventToUnregister = await StudentEventServices.getStudentEventByEvent(user.value.studentId, eventId)
        console.log("Test: " + eventToUnregister)
        await StudentEventServices.deleteStudentEvent(user.value.studentId, eventToUnregister.id);
        await loadRegisteredEvents();
    } catch (error) {
        console.error('Error deleting student event:', error);
    }
};

const requestTaskPopup = () => {
    showTaskDetails.value = true;
    taskRequest.value = true;

    requestCategory.value = "other";
    requestScheduleType.value = "special_event";
    requestName.value = "";
    requestDescription.value = "";
    requestPointValue.value = 0;
    requestRationale.value = "";
};

const requestTask = () => {
    const task = {
        category: requestCategory.value,
        schedule_type: requestScheduleType.value,
        name: requestName.value,
        description: requestDescription.value,
        rationale: requestRationale.value,
        point_value: requestPointValue.value,
        // verificationId: "Requested", Change this to the correct verification type
    };
    
    console.log(task)

    TaskServices.createTask(task).then((response) => {
        showTaskDetails.value = false;
        console.log("Task added successfully:", response.data);
        getAllTasks();
    })
    .catch((e) => {
        console.log(e)
        deleteError.value = true;
    });

    //Send email to admin
}

onMounted(async () => {
    await getSessionData();
    await checkForFlightPlan();

    await getAllSemesterData();
    await fetchFlightPlanInformationForSemester(currentSemesterIndex.value)
});

const getSessionData = async () => {
    const userStore = Utils.getStore("user");
    user.value = (await UserServices.getUser(userStore.userId)).data
    student.value = (await StudentServices.getStudent(user.value.studentId)).data;
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
    semesters.value.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
}

const getCurrentSemesterIndex = async () => {
    const currentSemester = await getSemester();
    currentSemesterIndex.value = semesters.value.findIndex(
        (semester) => semester.name === currentSemester.name
    );
}

// run to get information for current semester if not already fetched
const fetchFlightPlanInformationForSemester = async (semesterIndex) => {
    if (isSemesterFlightPlanInfoMissing(semesterIndex)) {
        getSemesterFlightPlanInformation(semesterIndex);
    }
}

const isSemesterFlightPlanInfoMissing = (semesterIndex) => {
    return !studentSemesterFlightPlanTasks.value[semesterIndex] && !experienceTypesForStudentFlightPlans.value[semesterIndex];
}

// run to refresh all current semester information
const getSemesterFlightPlanInformation = async (semesterIndex) => {
    const flightPlan = await getFlightPlan(semesters.value[semesterIndex]);
    const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, flightPlan.id)).data;
    const currentStudentFlightPlan = studentFlightPlan[0];
    await getSemesterTasks(semesterIndex, currentStudentFlightPlan);
    await getSemesterExperienceData(semesterIndex, currentStudentFlightPlan);
}

// flight plan tasks are sorted by semester indexes for the sake of switching between semesters
const getSemesterTasks = async (semesterIndex, currentStudentFlightPlan) => {
    const studentFlightPlanTasks = (await StudentFlightPlanTaskServices.getStudentFlightPlanTasks(currentStudentFlightPlan.id)).data;
    const newSemesterTasks = [];

    for (const studentFlightPlanTask of studentFlightPlanTasks) {
        const task = await TaskServices.getTask(studentFlightPlanTask.taskId);
        newSemesterTasks.push({
            ...task.data,
            status: studentFlightPlanTask.status,
            unapprove_reason: studentFlightPlanTask.unapprove_reason,
            student_flight_plan_task_id: studentFlightPlanTask.id
        })
    }
    studentSemesterFlightPlanTasks.value[semesterIndex] = newSemesterTasks;
}

// flight plan tasks are sorted by semester indexes for the sake of switching between semesters
const getSemesterExperienceData = async (semesterIndex, currentStudentFlightPlan) => {
    const studentEventIsComplete = (studentEvent) => studentEvent.status === 'approved';
    const studentFlightPlanExperienceTypes = (await StudentFlightPlanExperienceTypeServices.getAllExperienceTypesForStudentFlightPlan(currentStudentFlightPlan.id)).data;
    const newSemesterExperienceTypes = [];

    for (const studentFlightPlanExperienceType of studentFlightPlanExperienceTypes) {
        const experienceType = (await ExperienceTypeServices.getExperienceType(studentFlightPlanExperienceType.experienceTypeId)).data;
        const studentFlightPlanExperienceTypeEvents = (await StudentFlightPlanExperienceTypeEventServices.getStudentFlightPlanExperienceTypeEvents(studentFlightPlanExperienceType.id)).data;
        newSemesterExperienceTypes.push({
            ...experienceType,
            experienceCompleted: studentFlightPlanExperienceTypeEvents.some(studentEventIsComplete),
        })
    }

    experienceTypesForStudentFlightPlans.value[semesterIndex] = newSemesterExperienceTypes;

    eventsByExperienceTypesForStudentFlightPlans.value[semesterIndex] = {};
    for (const experienceType of experienceTypesForStudentFlightPlans.value[semesterIndex]) {
        eventsByExperienceTypesForStudentFlightPlans.value[semesterIndex][experienceType.id] = await getEventsForExperienceType(experienceType.id);
    }
}

// Old method, could return here?

// const getEventsForExperienceType = async (experienceTypeId) => {
//     const experienceTypeEvents = await ExperienceTypeEventServices.getAllEpxerienceTypeEventsForExperienceType(experienceTypeId);
//     const events = ref([]);
//     for (const experienceTypeEvent of experienceTypeEvents.data) {
//         const event = await EventServices.getEvent(experienceTypeEvent.eventId);
//         events.value.push(event.data);
//     }
//     return events.value;
// }

const getEventsForExperienceType = async (experienceTypeId) => {
    const experienceTypeEvents = await getRecommendedEventsForExperience(experienceTypeId);
    // const events = ref([]);
    // for (const experienceTypeEvent of experienceTypeEvents) {
    //     const event = await EventServices.getEvent(experienceTypeEvent.eventId);
    //     events.value.push(event.data);
    // }
    return experienceTypeEvents;
}

const getPreviousSemester = async () => {
    if (currentSemesterIndex.value > 0) {
        currentSemesterIndex.value--;
        await fetchFlightPlanInformationForSemester(currentSemesterIndex.value)
    }
};
const getNextSemester = async () => {
    if (currentSemesterIndex.value < semesters.value.length - 1) {
        currentSemesterIndex.value++;
        await fetchFlightPlanInformationForSemester(currentSemesterIndex.value)

    }
};

// Check for flight plan
const checkForFlightPlan = async () => {
    const semester = await getSemester();
    const flightPlan = await getFlightPlan(semester);
    const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, flightPlan.id)).data;
    if (studentFlightPlan.length < 1) await generateFlightPlan(student.value, semester);
}

// Event stuff
const ViewEventsPage = () => {
    router.push({ name: 'student-events' });
}

const openEventModal = async (event) => {
    selectedEvent.value = event;
    await loadRegisteredEvents(); // Load current registrations
    await checkIfStudentIsSignedUp(event.id);
    modalVisible.value = true;
};
const closeEventModal = () => {
    modalVisible.value = false;
};

const checkIfStudentIsSignedUp = async (id) => {
    try {
        const res = await StudentEventServices.getAllEventsByStudent(user.value.studentId);
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
</script>

<style scoped>
.stuff {
    background-color: rgb(255, 255, 255);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    margin: 20px;
    border-radius: 20px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    grid-auto-flow: dense;
}

.experience-completed {
    box-shadow: 2px 2px 5px #4caf50;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
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

/* SEMESTER NAVIGATION --------------*/
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

.semester-navigation img {
    width: 2.6rem;
    height: 2.6rem;
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

.recommended-events-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background-color: white;
    border-radius: 15px;
    padding: 20px;
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
    margin-bottom: 20px;
}

.modal-header h3 {
    font-size: 24px;
    color: #333;
    text-align: center;
}

.event-data-table-container {
    margin: 20px 0;
}

.event-data-table {
    width: 100%;
}

.clickable-row {
    cursor: pointer;
}

.clickable-row:hover {
    background-color: rgba(94, 196, 182, 0.1);
}

.date {
    text-align: center;
    padding: 10px;
    width: 80px;
}

.month {
    font-size: 14px;
    color: #666;
}

.day {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.event-line {
    border: none;
    border-top: 1px solid #eee;
    margin: 10px 0;
}
</style>