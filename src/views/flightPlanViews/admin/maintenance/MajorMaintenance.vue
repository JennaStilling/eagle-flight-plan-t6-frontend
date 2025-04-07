<template>
    <v-card flat>
        <div class="title-row">
            <h1 class="table-title">Majors</h1>
            <div class="search-filter-button-group">
                <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                    density="compact" class="search-bar">
                    <template v-slot:prepend-inner>
                        <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                    </template>
                </v-text-field>

                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addMajorPopup()">
                    Add Major
                </v-btn>
                <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedMajors(selected)">
                    Delete Selected Majors
                </v-btn>
            </div>
        </div>

        <v-data-table :headers="headers" :items="majors" :search="search" v-model:selectable="selected"
            show-select>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn variant="plain" size="small" @click="editMajorPopup(item)">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-btn>
                <v-btn variant="plain" size="small" @click="deleteMajorConfirmation(item)">
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
                    {{ majorToDelete.name }}?
                </p>
                <p v-if="deleteError">
                    Error deleting<br />{{ majorToDelete.name }}.
                </p>
            </div>
            <div class="modal-body">
                <v-btn v-if="!deleteError" class="button" color="#708E9A" @click="showDeleteItem = false">CANCEL</v-btn>
                <v-btn v-if="!deleteError" color="#F04E3E" class="error button"
                    @click="deleteMajor(major)">DELETE</v-btn>
                <v-btn v-if="deleteError" class="button" @click="
                    deleteError = false;
                showDeleteItem = false;
                ">CLOSE</v-btn>
            </div>
        </div>
    </div>

    <div v-if="showMajorDetails" class="modal edit-form-body">
        <v-card class="edit-popup mx-auto">
            <v-card-title class="popup-header">
                <v-text-field v-model="majorName">
                    <Icon icon="material-symbols:edit-outline" width="24" height="24" />
                </v-text-field>

            </v-card-title>

            <v-divider></v-divider>

            <!-- Department-->
            <v-container class="popup-content">
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.department }}</label>
                    </v-col>

                    <v-col cols="7">
                        <v-text-field v-model="majorDepartment" variant="outlined" density="compact"
                            hide-details></v-text-field>
                    </v-col>
                </v-row>


                <!-- Description-->
                <v-row class="form-row">
                    <v-col cols="5" class="label-column">
                        <label>{{ labels.description }}</label>
                    </v-col>
                    <v-col cols="7">
                        <v-textarea v-model="majorDescription" rows="6" auto-grow variant="outlined"
                            density="compact"></v-textarea>
                    </v-col>
                </v-row>

            </v-container>

            <v-divider></v-divider>

            <v-card-actions class="popup-actions">
                <v-spacer></v-spacer>
                <v-btn v-if="majorEdit" class="button" color="#F04E3E" variant="flat"
                    @click="deleteMajorConfirmation(majorToEdit)">Delete</v-btn>
                <v-btn color="#708E9A" class="button" variant="flat" @click="showMajorDetails = false">Cancel</v-btn>
                <v-btn color="#5EC4B6" class="button" variant="flat"
                    @click="majorEdit ? editMajor() : addMajor()">Save</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MajorServices from '@/services/flightPlanServices/majorServices';
import { Icon } from "@iconify/vue";

const search = ref('');
const majors = ref([]);
const message = ref('');
const showMajorDetails = ref(false);
const majorName = ref('');
const majorDescription = ref('');
const majorDepartment = ref('');
const majorToEdit = ref(null);
const majorToDelete = ref(null);
const showDeleteItem = ref(false);
const deleteError = ref(false);
const selected = ref([]);
const majorEdit = ref(false);
const majorAdd = ref(false);

const headers = ref([
    { align: 'start', key: 'name', title: 'Name' },
    { key: 'description', title: 'Description' },
    { key: 'department', title: 'Department' },
    { key: 'actions', title: '', sortable: false }
]);

const labels = {
    department: "Department",
    description: "Description",
};

onMounted(() => {
    getAllMajors();
});

const getAllMajors = () => {
    MajorServices.getAllMajors()
        .then((res) => {
            majors.value = res.data;
            message.value = '';
        })
        .catch((err) => {
            message.value = `Error: ${err.code}: ${err.message}`;
            console.error(err);
        });
}

const editMajorPopup = (major) => {
    majorToEdit.value = major;
    showMajorDetails.value = true;
    majorEdit.value = true;
    majorAdd.value = false;

    majorDepartment.value = capitalize(majorToEdit.value.department);
    majorDescription.value = majorToEdit.value.description;
    majorName.value = majorToEdit.value.name;
};

function capitalize(s) {
    return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

const editMajor = () => {
    if (majorDepartment.value === 'Relationship Building') {
        majorDepartment.value = 'relationship_building'
    }

    if (majorDepartment.value === 'Strategic Thinking') {
        majorDepartment.value = 'strategic_thinking'
    }

    const updatedMajor = {
        department: majorDepartment.value.toLowerCase(),
        name: majorName.value,
        description: majorDescription.value,
    };

    MajorServices.updateMajor(majorToEdit.value.id, updatedMajor)
        .then((response) => {
            console.log("Major updated successfully:", response.data);
            showMajorDetails.value = false;
            getAllMajors();
        })
        .catch((e) => {
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};


const addMajorPopup = () => {
    showMajorDetails.value = true;
    majorAdd.value = true;
    majorEdit.value = false;
    majorToEdit.value = null;

    majorName.value = "";
    majorDescription.value = "";
    majorDepartment.value = "";

};


const addMajor = () => {
    if (majorDepartment.value === 'Relationship Building') {
        majorDepartment.value = 'relationship_building'
    }

    if (majorDepartment.value === 'Strategic Thinking') {
        majorDepartment.value = 'strategic_thinking'
    }

    const newMajor = {
        name: majorName.value,
        description: majorDescription.value,
        department: majorDepartment.value.toLowerCase(),
    };

    console.log(newMajor)

    MajorServices.createMajor(newMajor).then((response) => {
        showMajorDetails.value = false;
        console.log("Major added successfully:", response.data);
        getAllMajors();
    })
        .catch((e) => {
            console.log(e)
            //message.value = e.response.data.message;
            deleteError.value = true;
        });
}


const deleteMajorConfirmation = (major) => {
    majorToDelete.value = major;
    showDeleteItem.value = true
    showMajorDetails.value = false;

    console.log('Delete item:', majorToDelete.value.name);
};

const deleteMajor = () => {
    MajorServices.deleteMajor(majorToDelete.value.id)
        .then(() => {
            showDeleteItem.value = false;
            majors.value = majors.value.filter((allMajors) => allMajors.id !== majorToDelete.value.id);
        })
        .catch((e) => {
            message.value = e.response.data.message;
            deleteError.value = true;
        });
};

const deleteSelectedMajors = (selected) => {
    if (selected.length > 0) {
        console.log("Deleting selected majors: ", selected);
        selected.forEach(major => {
            console.log("Deleting major: ", major.name);
            MajorServices.deleteMajor(major.id)
                .then(() => {
                    showDeleteItem.value = false;
                    majors.value = majors.value.filter((allMajors) => allMajors.id !== major.id);
                })
                .catch((e) => {
                    message.value = e.response.data.message;
                    deleteError.value = true;
                });
        });
    } else {
        console.log("No majors selected.");
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