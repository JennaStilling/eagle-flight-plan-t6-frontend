<template>
    <h1 class="pa-5">Student Flight Plan</h1>
    <div class="semester-navigation">
        <v-btn :disabled="currentSemesterIndex + 1 === 1" @click="getPreviousSemester" density="comfortable"
            icon="mdi-arrow-left" variant="tonal" rounded>
            < </v-btn>
                <h1>{{ semesters[currentSemesterIndex]?.name || `Loading...` }}</h1>
                <v-btn :disabled="currentSemesterIndex + 1 >= semesters.length" @click="getNextSemester"
                    density="comfortable" icon="mdi-arrow-left" variant="tonal" rounded>
                    >
                </v-btn>
    </div>
    <v-divider />
    <v-card class="stuff">
        <h1 class="pa-5">Tasks</h1>
        <v-data-iterator :items="studentSemesterFlightPlanTasks[currentSemesterIndex] || []" :items-per-page="4"
            v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="task in items" :key="task.raw.id" cols="auto" md="3">
                            <TaskPreview :key="task.raw.id" :task="task.raw" />
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
            <v-data-iterator :items="eventsByExperienceType[experienceType.id] || []" :items-per-page="6"
                v-if="!loading">
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
//Tasks / Semesters
import SemesterServices from '@/services/flightPlanServices/semesterServices';
import FlightPlanServices from "@/services/flightPlanServices/flightPlanServices";
import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import StudentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import TaskServices from "@/services/flightPlanServices/taskServices";
//Experiences
import StudentExperienceTypeServices from "@/services/flightPlanServices/studentExperienceTypeServices";
import ExperienceTypeServices from "@/services/flightPlanServices/experienceTypeServices";
import ExperienceTypeEventServices from "@/services/flightPlanServices/experienceTypeEventServices";
import EventServices from "@/services/flightPlanServices/eventServices";

import { getSemester, getFlightPlan, generateFlightPlan } from '@/utils/flightPlanGeneration';

// Components
import TaskPreview from "@/components/flightPlanComponents/studentPages/taskPreview.vue";
import EventPreview from "@/components/flightPlanComponents/studentPages/eventPreview.vue";

const router = useRouter();
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
    const studentFlightPlans = await StudentFlightPlanServices.getAllFlightPlansForStudent(student.value.id);
    for (const studentFlightPlan of studentFlightPlans.data) {
        const flightPlan = await FlightPlanServices.getFlightPlanById(studentFlightPlan.flightPlanId);
        console.log(flightPlan.data)
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
    if (studentFlightPlan.length < 1) await generateFlightPlan(student.value, semester);
}

const ViewEventsPage = () => {
    router.push({ name: 'student-events' });
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
</style>