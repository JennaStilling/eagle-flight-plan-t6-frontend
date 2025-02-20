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
            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute('adminHome')"><span
                    style="color:white">Admin Home</span></v-btn>

            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute('professorHome')"><span
                    style="color:white">Professor Home</span></v-btn>

            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute('studentHome')"><span
                    style="color:white">Student Home</span></v-btn>

            <v-btn color="#5EC4B6" size="x-large" variant="elevated" @click="handleRoute('studentWorkerHome')"><span
                    style="color:white">Student Worker Home</span></v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useHomePageStore } from '@/store/homePageStore';
const router = useRouter();
const homeStore = useHomePageStore();


const handleRoute = (loc) => {
    switch (loc) {
        case 'adminHome':
            homeStore.switchView("admin", "adminHome"); 
            router.push({ name: "adminHomeFP" });
            break;
        case 'studentHome':
            homeStore.switchView("student", "studentHome");
            router.push({ name: "studentHomeFP" });
            break;
        case 'studentWorkerHome':
            homeStore.switchView("studentWorker", "studentWorkerHome");
            router.push({ name: "studentWorkerHomeFP" });
            break;
        case 'professorHome':
            homeStore.switchView("professor", "professorHome");
            router.push({ name: "professorHomeFP" });
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