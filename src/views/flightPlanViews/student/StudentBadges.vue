<template>
    <h1 class="pa-5">Badges</h1>
    <v-chip>Badges: {{ obtainedBadges.length }} / {{ obtainedBadges.length + badges.length }}</v-chip>
    <h2 class="pa-5">Badges Accomplished</h2>
    <v-card class="stuff">
        <h1 class="pa-5">Tasks</h1>
        <v-data-iterator :items="obtainedBadges" :items-per-page="24" v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="badge in items" :key="badge.raw.id" cols="auto" md="1.5">
                            <div class="badge-item">
                                <img :src="badge.raw.image" :alt="badge.raw.name" class="badge-image">
                                <p class="badge-name">{{ badge.raw.name }}</p>
                                <p class="badge-date">{{ formatDate(badge.raw.date_acquired) }}</p>
                            </div>
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
    <h2 class="pa-5">Available Badges</h2>
    <v-card class="stuff">
        <h1 class="pa-5">Tasks</h1>
        <v-data-iterator :items="badges" :items-per-page="24" v-if="!loading">
            <template v-slot:default="{ items }">
                <v-container class="pa-5" fluid>
                    <v-row dense>
                        <v-col v-for="badge in items" :key="badge.raw.id" cols="auto" md="1.5">
                            <div class="badge-item">
                                <img :src="badge.raw.image" :alt="badge.raw.name" class="badge-image">
                                <p class="badge-name">{{ badge.raw.name }}</p>
                            </div>
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
        const badgeData = {
            ...badge,
            date_acquired: studentBadges.value.find(studentBadge => studentBadge.badgeId === badge.id).date_acquired,
        }
        obtainedBadges.value.push(badgeData);
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    })
}
</script>

<style scoped>
.badge-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 120px;
    height: 190px;
    flex-shrink: 0;
}

.badge-image {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 50%;
    background: rgba(32, 32, 32, 0.15);
}

.badge-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.badge-name,
.badge-date {
    margin: 5px 0;
    font-size: 14px;
}
</style>