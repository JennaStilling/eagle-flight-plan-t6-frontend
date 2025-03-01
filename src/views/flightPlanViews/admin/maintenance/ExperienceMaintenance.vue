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

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addTaskPopup()">
                    Add Category
                </v-btn>
                <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedCategories(selected)">
                    Delete Selected Categories
                </v-btn>
            </div>
        </div>

        <v-data-table :headers="headers" :items="filteredExperiences" :search="search" v-model:selectable="selected"
            show-select>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn variant="plain" size="small" @click="editExperiencePopup(item)">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-btn>
                <v-btn variant="plain" size="small" @click="deleteExperienceConfirmatoin(item)">
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
                    {{ categoryToDelete.name }}?
                </p>
                <p v-if="deleteError">
                    Error deleting<br />{{ categoryToDelete.name }}.
                </p>
            </div>
            <div class="modal-body">
                <v-btn v-if="!deleteError" color="#708E9A" @click="showDeleteItem = false">CANCEL</v-btn>
                <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteExperience(task)">DELETE</v-btn>
                <v-btn v-if="deleteError" @click="
                    deleteError = false;
                showDeleteItem = false;
                ">CLOSE</v-btn>
            </div>
        </div>
    </div>

    <div v-if="showTaskDetails" class="modal edit-form-body">
        <v-card class="edit-popup mx-auto">
            <v-card-title class="popup-header">
                <v-text-field v-model="expName">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-text-field>

            </v-card-title>

            <v-divider></v-divider>
            <!-- Category-->
            <v-container class="popup-content">
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.category }}</label>
                    </v-col>

                    <v-col cols="7">
                        <v-select v-model="expCategory" :items="categoryOptions" variant="solo-filled"
                            density="compact" hide-details class="filter-menu"></v-select>
                    </v-col>
                </v-row>

                <!-- Reflection Required-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.reflection }}</label>
                    </v-col>
                    <v-col cols="7">
                        <v-switch v-model="isRequired" hide-details></v-switch>
                    </v-col>
                </v-row>

                <!-- Frequency-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.schedule }}</label>
                    </v-col>

                    <v-col cols="7">
                        <v-select v-model="scheduleType" :items="frequencyOptions" variant="solo-filled"
                            density="compact" hide-details class="filter-menu"></v-select>
                    </v-col>
                </v-row>

                <!-- Description-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.description }}</label>
                    </v-col>
                    <v-col cols="7">
                        <v-textarea v-model="taskDescription" rows="2" variant="outlined"
                            density="compact"></v-textarea>
                    </v-col>
                </v-row>

                <!-- Rationale-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.rationale }}</label>
                    </v-col>

                    <v-col cols="7">
                        <v-text-field v-model="taskRationale" variant="outlined" density="compact"
                            hide-details></v-text-field>
                    </v-col>
                </v-row>

            </v-container>

            <v-divider></v-divider>

            <v-card-actions class="popup-actions">
                <v-spacer></v-spacer>
                <v-btn v-if="taskEdit" color="red" variant="outlined">Delete</v-btn>
                <v-btn color="grey" variant="outlined" @click="showTaskDetails = false">Cancel</v-btn>
                <v-btn color="green" variant="flat" @click="taskEdit ? editTask() : addTask()">Save</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ExperienceTypeServices from '@/services/flightPlanServices/experienceTypeServices';
import { Icon } from "@iconify/vue";

const search = ref('');
const experiences = ref([]);
const message = ref('');
const selected = ref([]);
const showTaskDetails = ref(false);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const editError = ref(false);
const selectedFilter = ref('All');

const taskToEdit = ref(null);
const categoryToDelete = ref(null);
const taskEdit = ref(false);
const taskAdd = ref(false);

const expName = ref("");
const expCategory = ref("");
const scheduleType = ref("");
const taskRationale = ref("");
const semFromGrad = ref("");
const taskPointValue = ref("");
const taskPreReq = ref("");
const taskVideoLink = ref("");
const taskVerificationType = ref("");

const taskDescription = ref("");



const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'category', title: 'Category'},
    { key: 'actions', title: '', sortable: false }
]);

const filterOptions = ref(['All', 'Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer']);
const categoryOptions = ['Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer'];
const typeOptions = ['Automatic', 'Manual']
const frequencyOptions = ['One Time', 'Every Semester', 'Special Event']

const expType = ref(null);
const isRequired = ref(false);
const expScheduleType = ref(null);

const expDescription = ref(null);
const expRationale = ref(null);

//   category enum('academic','leadership','networking','strengths','career_prep','mentoring','volunteer','') 
// type enum('automatic','manual') 
// req_reflection tinyint(1) 
// schedule_type enum('one_time','every_semester','special_event') 
// name varchar(255) 
// description varchar(255) 
// rational varchar(255)

const labels = {
    category: "Category",
    reflection: "Reflection Required?",
    schedule: "Frequency",
    description: "Description",
    rationale: "Rationale",
};

const filteredExperiences = computed(() => {
    if (selectedFilter.value === 'All') {
        return experiences.value;
    }

    if (selectedFilter.value === 'Career Prep') {
        selectedFilter.value = 'career_prep'
    }

    return experiences.value.filter(experience => {
        return experience.category === selectedFilter.value.toLowerCase();
    });
});

onMounted(() => {
    getAllExperiences();
});

const getAllExperiences = () => {
    ExperienceTypeServices.getAllExperienceTypes()
        .then((res) => {
            experiences.value = res.data;
            message.value = '';
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
}


const editExperiencePopup = (task) => {
    taskToEdit.value = task;
    showTaskDetails.value = true;
    taskEdit.value = true;
    taskAdd.value = false;

    expCategory.value = capitalize(taskToEdit.value.category);
    taskRationale.value = taskToEdit.value.rationale;
    semFromGrad.value = taskToEdit.value.semester_from_grad;
    taskPointValue.value = taskToEdit.value.point_value;
    taskPreReq.value = taskToEdit.value.taskId;
    taskVideoLink.value = taskToEdit.value.video_link;
    taskVerificationType.value = taskToEdit.value.verificationId;
    taskDescription.value = taskToEdit.value.description;
    isRequired.value = taskToEdit.value.reflection_required;
    expName.value = taskToEdit.value.name;
    scheduleType.value = capitalize(taskToEdit.value.schedule_type);
};

function capitalize(s) {
    return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

const editTask = () => {
    if (expCategory.value === 'Career Prep') {
        expCategory.value = 'career_prep'
    }

    if (scheduleType.value === 'One Time') {
        scheduleType.value = 'one_time'
    }

    if (scheduleType.value === 'Special Event') {
        scheduleType.value = 'special_event'
    }

    const updatedTask = {
        category: expCategory.value.toLowerCase(),
        reflection_required: isRequired.value,
        schedule_type: scheduleType.value.toLowerCase(),
        name: expName.value,
        description: taskDescription.value,
        rationale: taskRationale.value,
        semester_from_grad: semFromGrad.value,
        point_value: taskPointValue.value,
        video_link: taskVideoLink.value,
        taskId: taskPreReq.value,
        verificationId: taskVerificationType.value,
    };

    ExperienceTypeServices.updateExperienceType(taskToEdit.value.id, updatedTask)
        .then((response) => {
            console.log("Task updated successfully:", response.data);
            showTaskDetails.value = false;
            getAllExperiences();
        })
        .catch((e) => {
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};


const addTaskPopup = () => {
    showTaskDetails.value = true;
    taskAdd.value = true;
    taskEdit.value = false;
    taskToEdit.value = null;

    expName.value = "";
    expCategory.value = "";
    taskRationale.value = "";
    semFromGrad.value = "";
    taskPointValue.value = "";
    taskPreReq.value = "";
    taskVideoLink.value = "";
    taskVerificationType.value = "";
    taskDescription.value = "";
    isRequired.value = false;
    scheduleType.value = "";
};


const addTask = () => {
    if (expCategory.value === 'Career Prep') {
        expCategory.value = 'career_prep'
    }

    if (scheduleType.value === 'One Time') {
        scheduleType.value = 'one_time'
    }

    if (scheduleType.value === 'Special Event') {
        scheduleType.value = 'special_event'
    }

    const newTask = {
        category: expCategory.value.toLowerCase(),
        reflection_required: isRequired.value,
        schedule_type: scheduleType.value.toLowerCase(),
        name: expName.value,
        description: taskDescription.value,
        rationale: taskRationale.value,
        semester_from_grad: semFromGrad.value,
        point_value: taskPointValue.value,
        video_link: taskVideoLink.value,
        // taskId: taskPreReq.value,
        // verificationId: taskVerificationType.value,
    };

    console.log(newTask)

    ExperienceTypeServices.createExperienceType(newTask).then((response) => {
        showTaskDetails.value = false;
        console.log("Task added successfully:", response.data);
        getAllExperiences();
    })
        .catch((e) => {
            console.log(e)
            //message.value = e.response.data.message;
            deleteError.value = true;
        });
}


const deleteExperienceConfirmatoin = (task) => {
    categoryToDelete.value = task;
    showDeleteItem.value = true
    console.log('Delete item:', categoryToDelete.value.name);
};

const deleteExperience = () => {
    ExperienceTypeServices.deleteExperienceType(categoryToDelete.value.id)
        .then((res) => {
            showDeleteItem.value = false;
            getAllExperiences();
        })
        .catch((e) => {
            message.value = e.res.data.message;
            deleteError.value = true;
        });
};

const deleteSelectedCategories = (selected) => {
    if (selected.length > 0) {
        console.log("Deleting selected category: ", selected);
        selected.forEach(category => {
            console.log("Deleting category: ", category.name);
            ExperienceTypeServices.deleteExperienceType(category.id)
                .then((res) => {
                    showDeleteItem.value = false;
                    getAllExperiences();
                })
                .catch((e) => {
                    message.value = e.res.data.message;
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

.label-column p {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 12px;
    color: #555;
}

.popup-header {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
}

.popup-actions {
    padding: 12px;
    display: flex;
    justify-content: flex-end;
}

.edit-popup {
    max-width: 550px;
    max-height: 80vh;
    overflow-y: auto;
    padding: 16px;
}

.popup-content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 16px;
}

.form-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.label-column {
    white-space: nowrap;
    text-align: right;
    font-weight: 500;
    font-size: 14px;
    color: #555;
}

.v-text-field,
.v-textarea {
    width: 100%;
}
</style>