<template>
    <v-card>
        <v-card-item>
            <v-card-title>
                Welcome to Eagle Flight Plan!
            </v-card-title>
            <v-card-subtitle>
                Where would you like to go?
            </v-card-subtitle>
        </v-card-item>
        <v-card-actions>
            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute(UserRoles.ADMIN)"><span
                    style="color:white">Admin Home</span></v-btn>

            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute(UserRoles.PROFESSOR)"><span
                    style="color:white">Professor Home</span></v-btn>

            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute(UserRoles.STUDENT)"><span
                    style="color:white">Student Home</span></v-btn>

            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute(UserRoles.STUDENT_WORKER)"><span
                    style="color:white">Student Worker Home</span></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useHomePageStore, UserRoles, HomePages } from '@/store/homePageStore';
const router = useRouter();
const homeStore = useHomePageStore();

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
}

</script>

<style scoped>
* {
    font-family: 'Poppins', sans-serif;
}

.v-card-title {
    font-weight: 600;
    font-size: 24px;
}

.v-card-subtitle {
    font-weight: 400;
    font-size: 18px;
}
</style>