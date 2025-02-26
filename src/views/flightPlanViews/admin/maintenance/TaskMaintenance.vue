<template>
    <v-card flat>
        <div class="title-row">
            <h1 class="table-title">Tasks</h1>
            <div class="search-filter-button-group">
                <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                    density="compact" class="search-bar">
                    <template v-slot:prepend-inner>
                        <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                    </template>
                </v-text-field>

                <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Category"
                    variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addTask()">
                    Add Task
                </v-btn>
                <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedTasks(selected)">
                    Delete Selected Tasks
                </v-btn>
            </div>
        </div>

        <v-data-table :headers="headers" :items="filteredTasks" :search="search" v-model:selectable="selected"
            show-select>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn variant="plain" size="small" @click="editTaskPopup(item)">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-btn>
                <v-btn variant="plain" size="small" @click="deleteTaskConfirmation(item)">
                    <Icon icon="material-symbols:delete-outline" width="24" height="24" />
                </v-btn>
            </template>
        </v-data-table>
    </v-card>

    <div v-if="showDeleteItem" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span @click="showDeleteItem = false" class="close">&times;</span>
                <p v-if="!deleteError">
                    Do you want to DELETE <br />
                    {{ taskToDelete.name }}?
                </p>
                <p v-if="deleteError">
                    Error deleting<br />{{ taskToDelete.name }}.
                </p>
            </div>
            <div class="modal-body">
                <v-btn v-if="!deleteError" color="#708E9A" @click="showDeleteItem = false">CANCEL</v-btn>
                <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteTask(task)">DELETE</v-btn>
                <v-btn v-if="deleteError" @click="
                    deleteError = false;
                showDeleteItem = false;
                ">CLOSE</v-btn>
            </div>
        </div>
    </div>

    <div v-if="showTaskDetails" class="modal">
        <div class="modal-content">
            <!-- <div class="modal-header">
                <span @click="showTaskDetails = false" class="close">&times;</span>
                 <p v-if="editError">
                    Error editing <br />{{ taskToEdit.name }}.
                </p>
            </div> -->
            <div class="modal-body">
                <v-card class="mx-auto" max-width="344">
                    <v-container>
                        <v-text-field v-if="taskEdit" v-model="taskName" color="primary"
                            variant="underlined">{{ taskToEdit.name }}</v-text-field>

                            <v-text-field v-else v-model="taskName" color="primary" placeholder="<Task Name>"
                                variant="underlined"></v-text-field>

                        <v-text-field v-model="taskCategory" color="primary" placeholder="<Task Category>"
                            variant="underlined"></v-text-field>

                        <v-text-field v-model="isRequired" color="primary" placeholder="<Is Required?>" variant="underlined"></v-text-field>

                        <v-text-field v-model="scheduleType" color="primary" placeholder="<Schedule Type>" variant="underlined"></v-text-field>

                        <v-textarea v-model="taskDescription"       rows="3"
                        no-resize color="primary" placeholder="<Task Description>" variant="underlined"></v-textarea>

                        <v-text-field v-model="taskRationale" color="primary" placeholder="<Rationale>" variant="underlined"></v-text-field>

                        <v-text-field v-model="semFromGrad" color="primary" placeholder="<Number of Semesters>" variant="underlined"></v-text-field>

                        <v-text-field v-model="taskPointValue" color="primary" placeholder="<Point Value>" variant="underlined"></v-text-field>

                        <v-text-field v-model="taskPreReq" color="primary" placeholder="<Search Task>" variant="underlined"></v-text-field>

                        <v-text-field v-model="taskVideoLink" color="primary" placeholder="<Video Link>" variant="underlined"></v-text-field>

                        <v-text-field v-model="taskVerificationType" color="primary" placeholder="<Search Verifications>" variant="underlined"></v-text-field>
                    </v-container>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn color="success">
                            Complete Registration
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import TaskServices from '@/services/flightPlanServices/taskServices';
import { Icon } from "@iconify/vue";

const search = ref('');
const tasks = ref([]);
const message = ref('');
const selected = ref([]);
const showTaskDetails = ref(false);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const editError = ref(false);
const selectedFilter = ref('All');

const taskToEdit = ref(null);
const taskToDelete = ref(null);
const taskEdit = ref(false);
const taskAdd = ref(false);

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'category', title: 'Category' },
    { key: 'point_value', title: 'Point Value' },
    { key: 'reflection_required', title: 'Reflection Required?' },
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

export {
    data: () => ({
      form: false,
      email: null,
      password: null,
      loading: false,
    }),
}

const editTaskPopup = (task) => {
    taskToEdit.value = task;
    showTaskDetails.value = true;
    taskEdit.value = true;
    taskAdd.value = false;
};

const editTask = () => {
    console.log('Edit task:', taskToEdit.value.name);
    showTaskDetails.value = false
}

const addTask = () => {
    console.log("Adding a task...");
    showTaskDetails.value = true;
    taskAdd.value = true;
    taskEdit.value = false;
};

const deleteTaskConfirmation = (task) => {
    taskToDelete.value = task;
    showDeleteItem.value = true
    console.log('Delete item:', taskToDelete.value.name);
};

const deleteTask = () => {
    TaskServices.deleteTask(taskToDelete.value.id)
        .then(() => {
            showDeleteItem.value = false;
            tasks.value = tasks.value.filter((allTasks) => allTasks.id !== taskToDelete.value.id);
        })
        .catch((e) => {
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};

const deleteSelectedTasks = (selected) => {
    if (selected.length > 0) {
        console.log("Deleting selected tasks: ", selected);
        selected.forEach(task => {
            console.log("Deleting task: ", task.name);
            TaskServices.deleteTask(task.id)
                .then(() => {
                    showDeleteItem.value = false;
                    tasks.value = tasks.value.filter((allTasks) => allTasks.id !== task.id);
                })
                .catch((e) => {
                    message.value = e.response.data.message;
                    deleteError.value = true;
                });
        });
    } else {
        console.log("No tasks selected.");
    }
}

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

.button-white-text {
    color: white !important;
}
</style>
