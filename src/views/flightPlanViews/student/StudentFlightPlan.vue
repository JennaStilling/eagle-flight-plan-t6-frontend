<template>
    <h1 class="pa-5">Student Flight Plan</h1>
    <div class="semester-navigation">
        <v-btn @click="getPreviousSemester" density="comfortable" icon="mdi-arrow-left" variant="tonal" rounded>
            < </v-btn>
                <h1>{{ semesters[currentSemesterIndex]?.name || `Loading...` }}</h1>
                <v-btn @click="getNextSemester" density="comfortable" icon="mdi-arrow-left" variant="tonal" rounded>
                    >
                </v-btn>
    </div>
    <v-divider />
    <v-card class="stuff">
        <h1 class="pa-5">Tasks</h1>
        <v-data-iterator :items="studentSemesterFlightPlanTasks[currentSemesterIndex] || []" :items-per-page="6"
            v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="task in items" :key="task.taskId" cols="auto" md="4">
                            <td class="task-card" :class="{
                                'task-approved': task.raw.status === 'approved',
                                'task-ready-for-review': task.raw.status === 'ready_for_review',
                                'task-in-progress': task.raw.status === 'in_progress',
                                'task-unapproved': task.raw.status === 'unapproved'
                            }">
                                <div class="task-content">{{ task.raw.name }} - {{ task.raw.points }}pts
                                </div>
                            </td>
                        </v-col>
                    </v-row>
                </v-container>
            </template>

            <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                <div class="d-flex align-center justify-center pa-4">
                    <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="tonal" rounded
                        @click="prevPage">
                        < </v-btn>

                            <div class="mx-2 text-caption">
                                Page {{ page }} of {{ pageCount }}
                            </div>

                            <v-btn :disabled="page >= pageCount" density="comfortable" icon="mdi-arrow-right"
                                variant="tonal" rounded @click="nextPage"> > </v-btn>
                </div>
            </template>
        </v-data-iterator>
    </v-card>

    <div v-for="(experienceType) in experienceTypesForStudent" :key="experienceType.id">
        <v-divider />
        <v-card class="stuff">
            <div class="title-row">
                <h1 class="pa-5">{{ experienceType.name }}</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search for Event" variant="solo" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>
                </div>
            </div>
            <v-data-iterator :items="eventsByExperienceType[experienceType.id] || []" :items-per-page="6"
                v-if="!loading">
                <template v-slot:default="{ items }">
                    <v-container class="pa-5" fluid>
                        <v-row dense>
                            <v-col v-for="event in items" :key="event.id" cols="auto" md="4">
                                <td class="task-card">
                                    <div class="task-content">{{ event.raw.name }} - {{ event.raw.description }}
                                    </div>
                                </td>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>

                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                    <div class="d-flex align-center justify-center pa-4">
                        <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="tonal"
                            rounded @click="prevPage">
                            < </v-btn>

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

import SemesterServices from '@/services/flightPlanServices/semesterServices';
import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import StudentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import TaskServices from "@/services/flightPlanServices/taskServices";

import StudentExperienceTypeServices from "@/services/flightPlanServices/studentExperienceTypeServices";
import ExperienceTypeServices from "@/services/flightPlanServices/experienceTypeServices";
import ExperienceTypeEventServices from "@/services/flightPlanServices/experienceTypeEventServices";
import EventServices from "@/services/flightPlanServices/eventServices";

import { getSemester, getFlightPlan, generateFlightPlan } from '@/utils/flightPlanGeneration';


const user = ref(null);
const student = ref(null);

const semesters = ref([]);
const currentSemesterIndex = ref(0);

const studentSemesterFlightPlanTasks = ref({});

const studentExperienceTypes = ref([]);
const experienceTypesForStudent = ref([]);
const eventsByExperienceType = ref({});

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

onMounted(async () => {
    await getSessionData();
    await checkForFlightPlan();

    await getAllSemesterData();
    await getSemesterTasks(currentSemesterIndex.value);

    await getAllExperienceData();
});

const getSessionData = async () => {
    const userStore = Utils.getStore("user");
    const tempUser = await UserServices.getUser(userStore.userId);
    user.value = tempUser.data;
    const tempStudent = await StudentServices.getStudent(user.value.studentId);
    student.value = tempStudent.data;
}

const getAllSemesterData = async () => {
    await getSemesters();
    sortSemestersByDate();
    await getCurrentSemesterIndex();
}

const getSemesters = async () => {
    const response = await SemesterServices.getAllSemesters();
    semesters.value = response.data;
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

    // checkForNewFlightPlan(semesters.value[semesterIndex]);

    const flightPlan = await getFlightPlan(semesters.value[semesterIndex]);
    const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, flightPlan.id)).data;
    const currentFlightPlan = studentFlightPlan[0];
    const studentFlightPlanTasks = (await StudentFlightPlanTaskServices.getStudentFlightPlanTasks(currentFlightPlan.id)).data;

    // console.log(currentFlightPlan)
    // console.log(studentFlightPlanTasks)

    const newSemesterTasks = [];

    for (const studentFlightPlanTask of studentFlightPlanTasks) {
        const task = await TaskServices.getTask(studentFlightPlanTask.taskId);
        newSemesterTasks.push({
            ...task.data,
            status: studentFlightPlanTask.status,
            unapprove_reason: studentFlightPlanTask.unapprove_reason
        })
    }
    studentSemesterFlightPlanTasks.value[semesterIndex] = newSemesterTasks;
}

const getAllExperienceData = async () => {
    await getStudentExperiences(studentExperienceTypes);
    await getExperienceTypes(studentExperienceTypes, experienceTypesForStudent);

    for (const experienceType of experienceTypesForStudent.value) {
        eventsByExperienceType.value[experienceType.id] = await getEventsForExperienceType(experienceType.id);
    }
}

const getStudentExperiences = async (studentExperienceTypes) => {
    const result = await StudentExperienceTypeServices.getAllExperienceTypesForStudent(student.value.id);
    studentExperienceTypes.value = result.data;
}

const getExperienceTypes = async (studentExperienceTypes, experienceTypesForStudent) => {
    for (const studentExperienceType of studentExperienceTypes.value) {
        const experienceType = await ExperienceTypeServices.getExperienceType(studentExperienceType.experienceTypeId);
        experienceTypesForStudent.value.push(experienceType.data);
    }
}

const getEventsForExperienceType = async (experienceTypeId) => {
    const experienceTypeEvents = await ExperienceTypeEventServices.getAllEpxerienceTypeEventsForExperienceType(experienceTypeId);
    const events = ref([]);
    for (const experienceTypeEvent of experienceTypeEvents.data) {
        const event = await EventServices.getEvent(experienceTypeEvent.eventId);
        events.value.push(event.data);
    }
    return events.value;
}

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
const checkForFlightPlan = async () => {
    const semester = await getSemester();
    const flightPlan = await getFlightPlan(semester);
    const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, flightPlan.id)).data;
    if (studentFlightPlan.length < 1) await generateFlightPlan(student.value);
}

// const checkForNewFlightPlan = async (semester) => {
//     const flightPlan = await getFlightPlan(semester);
//     const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.value.id, flightPlan.id)).data;
//     if (studentFlightPlan.length < 1) await generateFlightPlan(student.value);
// }

</script>

<style scoped>
.modified-width {
    height: 100vh;
    margin: 0 auto;
    padding-top: 15px;
    overflow-y: auto;
}

.user-previews {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(23vw, 1fr));
    gap: 20px;
    grid-auto-flow: dense;
    margin: 20px;
}

.stuff {
    background-color: rgb(255, 255, 255);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    margin: 20px;
    border-radius: 20px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    grid-auto-flow: dense;
}

.pager {
    margin: 20px;
    padding: 10px;
}

.card-outlines {
    background-color: rgb(255, 255, 255);
    width: 100%;
    height: 100;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    border-radius: 20px;
    cursor: pointer;
}


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

.button {
    width: auto;
    color: white !important;
    white-space: nowrap;
}

.add-user {

    background-color: rgb(255, 255, 255);

    width: 70vw;
    height: 70vh;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    border-radius: 20px;
    cursor: pointer;
}

.scroll {
    overflow-y: auto;
    max-height: 100%;
}

/* Delete Later*/












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
}

.left-side {
    margin-left: 2%;
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

.modal-content {
    min-width: 400px;
    min-height: 100px;
    border-radius: 10px;
    background: #FAFAFA;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px;
    max-height: 90vh;
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

.task-approved {
    background-color: #4caf50;
    color: white;
    border: 2px solid #388e3c;
}

.task-ready-for-review {
    background-color: #ffeb3b;
    color: black;
    border: 2px solid #fbc02d;
}

.task-in-progress {
    background-color: #bdbdbd;
    color: white;
    border: 2px solid #9e9e9e;
}

.task-unapproved {
    background-color: #f44336;
    color: white;
    border: 2px solid #d32f2f;
}
</style>