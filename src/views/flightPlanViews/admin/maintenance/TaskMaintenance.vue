<template>
    <v-card flat>
        <div class="title-row">
            <h1 class="table-title">Tasks</h1>
            <div class="search-filter-button-group">
                <v-text-field v-model="search" label="Search" variant="outlined" hide-details single-line
                    density="compact" class="search-bar">
                    <template v-slot:prepend-inner>
                        <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                    </template>
                </v-text-field>

                <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Category" variant="outlined"
                    density="compact" class="filter-menu"></v-select>

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addTask()">
                    Add Task
                </v-btn>
            </div>
        </div>

        <v-data-table :headers="headers" :items="filteredTasks" :search="search" v-model:selectable="selected"
            item-value="name" show-select>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn variant="plain" size="small" @click="editTask(item)">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-btn>
                <v-btn variant="plain" size="small" @click="deleteTask(item)">
                    <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TaskServices from '@/services/flightPlanServices/taskServices';
import { Icon } from "@iconify/vue";

const search = ref('');
const tasks = ref([]);
const message = ref('');
const selected = ref([]);
const selectedFilter = ref('All');

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'category', title: 'Category' },
    { key: 'point_value', title: 'Point Value' },
    { key: 'reflection', title: 'Reflection Required?' },
    { key: 'actions', title: '', sortable: false }
]);

const filterOptions = ref(['All', 'Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer', 'Other']);

const filteredTasks = computed(() => {
    if (selectedFilter.value === 'All') {
        return tasks.value;
    }

    if (selectedFilter.value === 'Career Prep') {
        selectedFilter.value = 'career_prep'
    }

    return tasks.value.filter(task => {
        return task.category === selectedFilter.value.toLowerCase();
    });
});

onMounted(() => {
    TaskServices.getAllTasks()
        .then((res) => {
            tasks.value = res.data;
            message.value = '';
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
});

const editTask = (task) => {
    console.log('Edit task:', task.name);
};

const deleteTask = (task) => {
    console.log('Delete item:', task.name);
};

const addTask = () => {
    console.log("Adding a task...");
};
</script>


<style>
/* @import "insert style sheet here later" */
</style>

<style scoped>
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
</style>
