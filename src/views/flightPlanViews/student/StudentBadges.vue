<template>
    <v-row class="badges-header">
        <h1 class="badges-title">Badges</h1>
        <v-chip class="badges-chip">
            Badges: {{ obtainedBadges.length }} / {{ obtainedBadges.length + badges.length }}
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
    <v-card class="stuff">
        <h1 class="pa-5">Available Badges</h1>
        <v-data-iterator :items="badges" :items-per-page="7" v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="badge in items" :key="badge.raw.id" cols="auto" md="1.5">
                            <BadgePreview :key="badge.raw.id" :badge="badge.raw" :obtained="false" />
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
//import StudentFlightPlanExperienceServices from "@/services/flightPlanServices/studentFlightPlanExperienceServices"

// Components
import BadgePreview from "@/components/flightPlanComponents/studentPages/badgePreview.vue";

const router = useRouter();
const user = ref(null);
const student = ref(null);

const studentBadges = ref([]);
const badges = ref([]);
const obtainedBadges = ref([]);


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
    console.log(badges.value)
    console.log(obtainedBadges.value)
    console.log(studentBadges.value)
});

const getSessionData = async () => {
    const userStore = Utils.getStore("user");
    const tempUser = await UserServices.getUser(userStore.userId);
    user.value = tempUser.data;
    const tempStudent = await StudentServices.getStudent(user.value.studentId);
    student.value = tempStudent.data;
}

const getStudentBadges = async () => {
    const result = await StudentBadgeServices.getAllStudentBadges(student.value.id);
    studentBadges.value = result.data;
}

const sortStudentBadges = () => {
    studentBadges.value.sort((a, b) => new Date(a.date_acquired) - new Date(b.date_acquired));
}

const sortObtainedBadges = () => {
    obtainedBadges.value.sort((a, b) => new Date(a.date_acquired) - new Date(b.date_acquired));
}

const getBadges = async () => {
    const notStudentBadge = (badge) => !studentBadges.value.some(studentBadge => studentBadge.badgeId === badge.id);
    const isStudentBadge = (badge) => studentBadges.value.some(studentBadge => studentBadge.badgeId === badge.id);

    const result = await BadgeServices.getAllBadges();
    const availableBadges = result.data.filter(notStudentBadge);
    for (const badge of availableBadges) {
        const badgeData = {
            ...badge,
        }
        badges.value.push(badgeData);
    }

    const alreadyObtainedBadges = result.data.filter(isStudentBadge);
    for (const badge of alreadyObtainedBadges) {
        const studentBadge = studentBadges.value.find(studentBadge => studentBadge.badgeId === badge.id)
        const badgeData = {
            ...badge,
            date_acquired: studentBadge.date_acquired,
            //points_earned: studentBadge.points_earned,
        }
        obtainedBadges.value.push(badgeData);
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