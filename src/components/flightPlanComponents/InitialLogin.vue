<template>
    <div class="container">
        <v-card class="card">
            <v-card-item class="text-section">
                <v-card-title>
                    Welcome to Eagle Flight Plan!
                </v-card-title>
                <v-card-subtitle>
                    Where would you like to go?
                </v-card-subtitle>
            </v-card-item>
            <v-card-actions class="actions">
                <v-btn v-if="adminAccess" color="#5EC4B6" size="x-large" variant="elevated" class="button"
                    @click="handleRoute(UserRoles.ADMIN)" text="Admin Home">
                </v-btn>

                <!-- <v-btn v-if="professorAccess"  color="#5EC4B6" size="x-large" variant="elevated" class="button" @click="handleRoute(UserRoles.PROFESSOR)"
                    text="Professor Home">
                </v-btn> -->

                <v-btn v-if="studentAccess" color="#5EC4B6" size="x-large" variant="elevated" class="button"
                    @click="handleRoute(UserRoles.STUDENT)" text="Student Home">
                </v-btn>

                <!-- <v-btn v-if="studentAccess" color="#5EC4B6" size="x-large" variant="elevated" class="button" @click="handleRoute(UserRoles.STUDENT_WORKER)"
                    text="Student Worker Home">
                </v-btn> -->
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Utils from '@/config/utils';
import { useHomePageStore, UserRoles, HomePages } from '@/store/homePageStore';
import UserServices from '@/services/resumeBuilderServices/userServices';
import StudentServices from '@/services/resumeBuilderServices/studentServices';
import { hasStudentViewPermissions, hasAdminViewPermissions } from '@/utils/permissions';

const user = ref(null);
const student = ref(null);
const adminAccess = ref(false);
const studentAccess = ref(false);
const professorAccess = ref(false);
const router = useRouter();
const homeStore = useHomePageStore();

onMounted(async () => {
    await getSessionData();
    await getAllUserRoles();

    const savedPage = localStorage.getItem("lastPageAccessed");
    if (savedPage) {
        console.log(savedPage)
        router.push({ name: savedPage });
        return;
    }
});

const getSessionData = async () => {
    const userStore = Utils.getStore("user");
    user.value = (await UserServices.getUser(userStore.userId)).data
    student.value = (await StudentServices.getStudent(user.value.studentId)).data;
}

const getAllUserRoles = async () => {
    adminAccess.value = await hasAdminViewPermissions(user.value);
    studentAccess.value = await hasStudentViewPermissions(user.value);
}

const handleRoute = (loc) => {
    switch (loc) {
        case UserRoles.ADMIN:
            homeStore.switchView(UserRoles.ADMIN, HomePages.ADMIN, router);
            break;
        case UserRoles.STUDENT:
            homeStore.switchView(UserRoles.STUDENT, HomePages.STUDENT, router);
            break;
        case UserRoles.STUDENT_WORKER:
            homeStore.switchView(UserRoles.STUDENT_WORKER, HomePages.STUDENT_WORKER, router);
            break;
        case UserRoles.PROFESSOR:
            homeStore.switchView(UserRoles.PROFESSOR, HomePages.PROFESSOR, router);
            break;
    }
};
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
    padding-top: 5vh;
    padding-left: 5vw;
    padding-right: 5vw;
}

.card {
    width: 100%;
    min-width: 320px;
    max-width: 1000px;
    border-radius: 16px;
    border-color: black;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}


.text-section {
    text-align: center;
    margin-bottom: 24px;
}

.v-card-title {
    font-weight: 700;
    font-size: clamp(24px, 5vw, 36px);
    margin-bottom: 8px;
    word-wrap: break-word;
}

.v-card-subtitle {
    font-weight: 400;
    font-size: clamp(16px, 3vw, 20px);
    word-wrap: break-word;
}

.actions {
    width: 100%;
    justify-content: space-between;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
}

.button {
    padding: 16px 24px;
    font-size: clamp(16px, 2vw, 18px);
    font-weight: 600;
    border-radius: 8px;
    text-transform: none;
}
</style>
