<template>
  <v-card flat>
    <div class="title-row">
      <h1 class="table-title">Tasks</h1>
      <div class="search-filter-button-group">
        <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line density="compact"
          class="search-bar">
          <template v-slot:prepend-inner>
            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
          </template>
        </v-text-field>

        <v-select v-model="selectedFilter" :items="filterOptions" label="Filter By Category" variant="solo-filled"
          density="compact" hide-details class="filter-menu"></v-select>

        <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addTask()">
          Add Task
        </v-btn>
        <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteSelectedTasks(selected)">
          Delete Selected Tasks
        </v-btn>
      </div>
    </div>

    <v-data-table :headers="headers" :items="filteredTasks" :search="search" v-model:selectable="selected" show-select>
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

  <div v-if="showTaskDetails" class="modal edit-form-body">
    <v-card class="edit-popup mx-auto">
      <v-card-title class="popup-header">
        <v-text-field> {{ taskEdit ? taskName : "<Task Name>" }}</v-text-field>

      </v-card-title>

      <v-divider></v-divider>

      <v-container class="popup-content">
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ label }}</label>
          </v-col>

          <v-col cols="7">
            <v-text-field v-model="taskFields[index]" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>Reflection Required?</label>
          </v-col>
          <v-col cols="7">
            <v-switch v-model="taskEdit" hide-details>{{ taskEdit ? taskDescription : false }}</v-switch>
          </v-col>
        </v-row>

        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>Description</label>
          </v-col>
          <v-col cols="7">
            <v-textarea v-model="taskDescription" rows="2" variant="outlined" density="compact">{{ taskEdit ? isRequired
              :
              "" }}</v-textarea>
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

const taskName = ref("");
const taskCategory = ref("");
const scheduleType = ref("");
const taskRationale = ref("");
const semFromGrad = ref("");
const taskPointValue = ref("");
const taskPreReq = ref("");
const taskVideoLink = ref("");
const taskVerificationType = ref("");
const isRequired = ref(false);
const taskDescription = ref("");



const headers = ref([
  { align: 'start', key: 'name', title: 'Name' },
  { key: 'description', title: 'Description' },
  { key: 'category', title: 'Category' },
  { key: 'point_value', title: 'Point Value' },
  { key: 'reflection_required', title: 'Reflection Required?' },
  { key: 'actions', title: '', sortable: false }
]);

const filterOptions = ref(['All', 'Academic', 'Leadership', 'Networking', 'Strengths', 'Career Prep', 'Mentoring', 'Volunteer', 'Other']);

const labels = {
  category: "Category",
  reflection: "Reflection",
  schedule: "Frequency",
  description: "Description",
  rationale: "Rationale",
  semesters: "Semesters",
  points: "Point Value",
  prereq: "Pre-Requisites",
  video: "Video Link",
  verification: "Verification Type"
};

const taskFields = ref([
  taskCategory, scheduleType, taskRationale, semFromGrad,
  taskPointValue, taskPreReq, taskVideoLink, taskVerificationType
]);

const taskFieldValues = ref([]);


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



const editTaskPopup = (task) => {
  taskToEdit.value = task;
  showTaskDetails.value = true;
  taskEdit.value = true;
  taskAdd.value = false;

  taskFields.value = [
    taskToEdit.value.category, 
    taskToEdit.value.rationale, 
    taskToEdit.value.semester_from_grad, 
    taskToEdit.value.point_value, 
    taskToEdit.value.taskId, 
    taskToEdit.value.video_link, 
    taskToEdit.value.verificationId]

  taskDescription.value = taskToEdit.value.description;
  isRequired.value = taskToEdit.reflection_required
  taskName.value = taskToEdit.value.name;
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
  taskFields.value = ["", "", "", "", "", "", "", ""]
  taskDescription.value = "";
  isRequired.value = false;
  taskName.value = "";
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

/* .edit-form-body {
  padding-top: 10% !important;
  padding-bottom: 10% !important;
  padding-left: 25% !important;
  padding-right: 25% !important;
} */

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
  /* Increased width */
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
  /* Prevents labels from wrapping */
  text-align: right;
  /* Aligns labels to the right */
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

.v-text-field,
.v-textarea {
  width: 100%;
  /* Ensures input fields take up full width */
}
</style>
