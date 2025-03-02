<template>
    <v-card flat>
        <div class="title-row">
            <h1 class="table-title">Experiences</h1>
            <div class="search-filter-button-group">
                <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                    density="compact" class="search-bar">
                    <template v-slot:prepend-inner>
                        <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                    </template>
                </v-text-field>

                <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Category"
                    variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addExperiencePopup()">
                    Add Experiences
                </v-btn>
                <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedExperiences(selected)">
                    Delete Selected Experiences
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

    <div v-if="showExperienceDetails" class="modal edit-form-body">
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
                        <v-select v-model="expCategory" :items="categoryOptions" variant="solo-filled" density="compact"
                            hide-details class="filter-menu"></v-select>
                    </v-col>
                </v-row>

                <!-- Verification Type-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.verification }}</label>
                    </v-col>

                    <v-col cols="7">
                        <v-select v-model="expVerificationType" :items="typeOptions" variant="solo-filled"
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
                        <v-select v-model="expScheduleType" :items="frequencyOptions" variant="solo-filled"
                            density="compact" hide-details class="filter-menu"></v-select>
                    </v-col>
                </v-row>

                <!-- Description-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.description }}</label>
                    </v-col>
                    <v-col cols="7">
                        <v-textarea v-model="expDescription" rows="3" variant="outlined" density="compact"></v-textarea>
                    </v-col>
                </v-row>

                <!-- Rationale-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.rationale }}</label>
                    </v-col>

                    <v-col cols="7">
                        <v-textarea v-model="expRationale" rows="3" variant="outlined" density="compact"
                            hide-details></v-textarea>
                    </v-col>
                </v-row>

            </v-container>

            <v-divider></v-divider>

            <v-card-actions class="popup-actions">
                <v-spacer></v-spacer>
                <v-btn v-if="experienceEdit" color="#F04E3E" variant="flat">Delete</v-btn>
                <v-btn color="#708E9A" variant="flat" @click="showExperienceDetails = false">Cancel</v-btn>
                <v-btn color="#5EC4B6" variant="flat" style="color: white;"
                    @click="experienceEdit ? editExperience() : addExperience()">Save</v-btn>

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
const showExperienceDetails = ref(false);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const editError = ref(false);
const selectedFilter = ref('All');

const experienceToEdit = ref(null);
const categoryToDelete = ref(null);
const experienceEdit = ref(false);
const experienceAdd = ref(false);

const expName = ref("");
const expCategory = ref("");
const expScheduleType = ref("");
const expRationale = ref("");
const expDescription = ref("");
const expVerificationType = ref("")



const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'category', title: 'Category' },
    { key: 'actions', title: '', sortable: false }
]);

const filterOptions = ref(['All', 'Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer']);
const categoryOptions = ['Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer'];
const typeOptions = ['Automatic', 'Manual']
const frequencyOptions = ['One Time', 'Every Semester', 'Special Event']


const isRequired = ref(false);

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
    verification: "Verification Type",
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
    experienceToEdit.value = task;
    showExperienceDetails.value = true;
    experienceEdit.value = true;
    experienceAdd.value = false;
    expVerificationType.value = capitalize(experienceToEdit.value.type)
    expCategory.value = capitalize(experienceToEdit.value.category);
    expRationale.value = experienceToEdit.value.rationale;
    expDescription.value = experienceToEdit.value.description;
    isRequired.value = experienceToEdit.value.reflection_required;
    expName.value = experienceToEdit.value.name;
    expScheduleType.value = capitalize(experienceToEdit.value.schedule_type);
};

function capitalize(s) {
    return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

const editExperience = () => {
    if (expCategory.value === 'Career Prep') {
        expCategory.value = 'career_prep'
    }

    if (expScheduleType.value === 'One Time') {
        expScheduleType.value = 'one_time'
    }

    if (expScheduleType.value === 'Special Event') {
        expScheduleType.value = 'special_event'
    }

    if (expScheduleType.value === 'Every Semester') {
        expScheduleType.value = 'every_semester'
    }

    const updatedExperience = {
        category: expCategory.value.toLowerCase(),
        type: expVerificationType.value.toLowerCase(),
        req_reflection: isRequired.value,
        schedule_type: expScheduleType.value.toLowerCase(),
        name: expName.value,
        description: expDescription.value,
        rational: expRationale.value,
    };

    ExperienceTypeServices.updateExperienceType(experienceToEdit.value.id, updatedExperience)
        .then((response) => {
            console.log("Task updated successfully:", response.data);
            showExperienceDetails.value = false;
            getAllExperiences();
        })
        .catch((e) => {
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};


const addExperiencePopup = () => {
    showExperienceDetails.value = true;
    experienceAdd.value = true;
    experienceEdit.value = false;
    experienceToEdit.value = null;
    expVerificationType.value = ""
    expName.value = "";
    expCategory.value = "";
    expRationale.value = "";
    expDescription.value = "";
    isRequired.value = false;
    expScheduleType.value = "";
};


const addExperience = () => {
    if (expCategory.value === 'Career Prep') {
        expCategory.value = 'career_prep'
    }

    if (expScheduleType.value === 'One Time') {
        expScheduleType.value = 'one_time'
    }

    if (expScheduleType.value === 'Special Event') {
        expScheduleType.value = 'special_event'
    }

    if (expScheduleType.value === 'Every Semester') {
        expScheduleType.value = 'every_semester'
    }

    //   category enum('academic','leadership','networking','strengths','career_prep','mentoring','volunteer','') 
    // type enum('automatic','manual') 
    // req_reflection tinyint(1) 
    // schedule_type enum('one_time','every_semester','special_event') 
    // name varchar(255) 
    // description varchar(255) 
    // rational varchar(255)

    const newExperience = {
        category: expCategory.value.toLowerCase(),
        type: expVerificationType.value.toLowerCase(),
        req_reflection: isRequired.value,
        schedule_type: expScheduleType.value.toLowerCase(),
        name: expName.value,
        description: expDescription.value,
        rational: expRationale.value,
    };

    console.log(newExperience)

    ExperienceTypeServices.createExperienceType(newExperience).then((response) => {
        showExperienceDetails.value = false;
        console.log("Task added successfully:", response.data);
        getAllExperiences();
    })
        .catch((e) => {
            console.log(e)
            message.value = e.response.data.message;
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

const deleteSelectedExperiences = (selected) => {
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