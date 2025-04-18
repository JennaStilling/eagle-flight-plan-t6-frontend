<template>
    <v-row class="badges-header">
        <h1 class="badges-title">Badges</h1>
        <v-chip class="badges-chip">
            Badges: {{ obtainedBadges.length }} / {{ obtainedBadges.length + nonObtainedBadges.length }}
        </v-chip>
    </v-row>
    <v-card class="stuff">
        <h1 class="pa-5">Accomplished Badges</h1>
        <v-data-iterator :items="obtainedBadges" :items-per-page="7" v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="badge in items" :key="badge.raw.id" cols="auto" md="1.5">
                            <BadgePreview :key="badge.raw.id" :badge="badge.raw" :obtained="true" />
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
    <v-card class="stuff">
        <h1 class="pa-5">Available Badges</h1>
        <v-data-iterator :items="nonObtainedBadges" :items-per-page="7" v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="badge in items" :key="badge.raw.id" cols="auto" md="1.5">
                            <BadgePreview :key="badge.raw.id" :badge="badge.raw" :obtained="false"
                                @claim-badge="claimBadge" />
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
    <v-snackbar v-model="showSnackbar" timeout="3000" color="success" style="color: white">
        {{ snackbarMessage }}
    </v-snackbar>
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
import BadgeServices from "@/services/flightPlanServices/badgeServices";
import StudentBadgeServices from "@/services/flightPlanServices/studentBadgeServices";
import BadgeExperienceTypeServices from "@/services/flightPlanServices/badgeExperienceTypeServices";
import TaskBadgeServices from "@/services/flightPlanServices/taskBadgeServices";
import StudentFlightPlanTaskServices from "@/services/flightPlanServices/studentFlightPlanTaskServices";
import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import StudentFlightPlanExperienceTypeServices from "@/services/flightPlanServices/studentFlightPlanExperienceTypeServices"
import StudentFlightPlanExperienceTypeEventServices from "@/services/flightPlanServices/studentFlightPlanExperienceTypeEventServices"

// Components
import BadgePreview from "@/components/flightPlanComponents/studentPages/badgePreview.vue";
import taskServices from '@/services/flightPlanServices/taskServices';

const router = useRouter();
const user = ref(null);
const student = ref(null);

const studentBadges = ref([]);
const nonObtainedBadges = ref([]);
const obtainedBadges = ref([]);

//Snackbar variables
const showSnackbar = ref(false);
const snackbarMessage = ref("");

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
    await getStudentBadges();
    sortStudentBadges();
    await getBadges();
    sortObtainedBadges();
});

const refresh = async () => {
    await getStudentBadges();
    sortStudentBadges();
    await getBadges();
    sortObtainedBadges();
}

const getSessionData = async () => {
    const userStore = Utils.getStore("user");
    user.value = (await UserServices.getUser(userStore.userId)).data;
    student.value = (await StudentServices.getStudent(user.value.studentId)).data;
}

const getStudentBadges = async () => {
    studentBadges.value = (await StudentBadgeServices.getAllStudentBadges(student.value.id)).data;
}

const sortStudentBadges = () => {
    studentBadges.value.sort((a, b) => new Date(a.date_acquired) - new Date(b.date_acquired));
}

const sortObtainedBadges = () => {
    obtainedBadges.value.sort((a, b) => new Date(a.date_acquired) - new Date(b.date_acquired));
}

const getBadges = async () => {
    const allBadges = await BadgeServices.getAllBadges();
    getNonObtainedBadges(allBadges.data);
    getObtainedBadges(allBadges.data);
}

const getNonObtainedBadges = async (allBadges) => {
    nonObtainedBadges.value = [];
    const notStudentBadge = (badge) => !studentBadges.value.some(studentBadge => studentBadge.badgeId === badge.id);
    const studentEventIsComplete = (studentEvent) => studentEvent.status === 'approved';
    const finishedTaskBadge = (taskBadge) => allStudentTasks.value.some(studentTask => studentTask.taskId === taskBadge.taskId && studentTask.status === 'approved');
    const finishedExperienceBadge = (experienceBadge) => allStudentFlightPlanExperienceTypes.value.some((studentExperienceType) => experienceBadge.experienceTypeId === studentExperienceType.experienceTypeId && studentExperienceType.completed);

    const allStudentFlightPlans = await StudentFlightPlanServices.getAllFlightPlansForStudent(student.value.id);
    const allStudentTasks = ref([]);
    // gets all tasks for the student
    for (const studentFlightPlan of allStudentFlightPlans.data) {
        const studentTasks = await StudentFlightPlanTaskServices.getStudentFlightPlanTasks(studentFlightPlan.id);
        allStudentTasks.value.push(...studentTasks.data);
    }
    // gets all experiences for the student, and adds if they are completed
    const allStudentFlightPlanExperienceTypes = ref([]);
    for (const studentFlightPlan of allStudentFlightPlans.data) {
        const studentExperienceTypes = await StudentFlightPlanExperienceTypeServices.getAllExperienceTypesForStudentFlightPlan(studentFlightPlan.id)
        for (const studentExperienceType of studentExperienceTypes.data) {
            const studentFlightPlanExperienceTypeEvents = await StudentFlightPlanExperienceTypeEventServices.getStudentFlightPlanExperienceTypeEvents(studentExperienceType.id);

            allStudentFlightPlanExperienceTypes.value.push({
                ...studentExperienceType,
                completed: studentFlightPlanExperienceTypeEvents.data.some(studentEventIsComplete),
            });
        }
    }
    // calculates the amount of completed badge tasks
    const badgeTaskProgress = async (badge) => {
        return (await TaskBadgeServices.getAllTaskBadgesForBadge(badge.id)).data.filter(finishedTaskBadge).length
    }
    // calculates the amount of completed badge experience types
    const badgeExperienceTypeProgress = async (badge) => {
        return (await BadgeExperienceTypeServices.getAllBadgeExperienceTypesForBadge(badge.id)).data.filter(finishedExperienceBadge).length
    }
    // calculates the amount of completed badge flight plans
    const badgeFlightPlanProgress = async (badge) => {
        return allStudentFlightPlans.data.filter((studentFlightPlan) => studentFlightPlan.semester_from_grad === badge.semester_from_grad && studentFlightPlan.completion_date !== null).length;
    }
    // calculates the required amount of badge tasks or experiences
    const badgeTaskTotal = async (badge) => {
        return (await TaskBadgeServices.getAllTaskBadgesForBadge(badge.id)).data.length
    }
    // calculates the required amount of badge tasks or experiences
    const badgeExperienceTypeTotal = async (badge) => {
        return (await BadgeExperienceTypeServices.getAllBadgeExperienceTypesForBadge(badge.id)).data.length
    }
    // calculates the required amount of badge flight plans
    const badgeFlightPlanTotal = async (badge) => {
        return 1;
    }

    const availableBadges = allBadges.filter(notStudentBadge);
    for (const badge of availableBadges) {
        const taskProgress = await badgeTaskProgress(badge);
        const taskTotal = await badgeTaskTotal(badge);
        const experienceTypeProgress = await badgeExperienceTypeProgress(badge);
        const experienceTypeTotal = await badgeExperienceTypeTotal(badge);
        const flightPlanProgress = await badgeFlightPlanProgress(badge);
        const flightPlanTotal = await badgeFlightPlanTotal(badge);
        let completed = false;
        if (badge.type === 'task_completion')
            completed = taskProgress != null && taskTotal != null && taskProgress >= taskTotal;
        else if (badge.type === 'experience_completion')
            completed = experienceTypeProgress != null && experienceTypeTotal != null && experienceTypeProgress >= experienceTypeTotal;
        else if (badge.type === 'task_experience_completion')
            completed = taskProgress != null && taskTotal != null && taskProgress >= taskTotal && experienceTypeProgress != null && experienceTypeTotal != null && experienceTypeProgress >= experienceTypeTotal;
        else if (badge.type === 'flightplan_completion')
            completed = flightPlanProgress != null && flightPlanTotal != null && flightPlanProgress >= flightPlanTotal;
        const badgeData = {
            ...badge,
            completed: completed,
            taskProgress: taskProgress,
            taskTotal: taskTotal,
            experienceTypeProgress: experienceTypeProgress,
            experienceTypeTotal: experienceTypeTotal,
            flightPlanProgress: flightPlanProgress,
            flightPlanTotal: flightPlanTotal,
        }
        nonObtainedBadges.value.push(badgeData);
    }
}

const getObtainedBadges = (allBadges) => {
    obtainedBadges.value = [];
    const isStudentBadge = (badge) => studentBadges.value.some(studentBadge => studentBadge.badgeId === badge.id);

    const alreadyObtainedBadges = allBadges.filter(isStudentBadge);
    for (const badge of alreadyObtainedBadges) {
        const studentBadge = studentBadges.value.find(studentBadge => studentBadge.badgeId === badge.id)
        const badgeData = {
            ...badge,
            date_acquired: studentBadge.date_acquired,
            points_earned: studentBadge.points_earned,
        }
        obtainedBadges.value.push(badgeData);
    }
}

const claimBadge = async (badge) => {
    const data = {
        studentId: student.value.id,
        badgeId: badge.id,
        points_earned: badge.points,
        date_acquired: new Date().toISOString(),
    }
    await StudentBadgeServices.createSystemStudentBadge(data)

    student.value.points += badge.points;
    await StudentServices.updateStudent(student.value.id, student.value)
    refresh();

    showSnackbar.value = true;
    snackbarMessage.value = "Badge claimed successfully!";
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

.badges-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1vw;
    margin-bottom: 2vw;
}

.badges-title {
    font-size: 4vw;
    font-weight: 700;
    margin: 0;
}

.badges-chip {
    font-size: 1.5vw;
    padding: 1.5vw 1vw;
    background-color: #811429;
    color: #FFFFFF;
    border-radius: 1vw;
}
</style>