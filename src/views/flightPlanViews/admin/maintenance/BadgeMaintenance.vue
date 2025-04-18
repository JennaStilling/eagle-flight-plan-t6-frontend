<template>
  <div>
    <v-card flat>
      <!-- Title, includes search, add, and mass deletion function -->
      <div class="title-row">
        <h1 class="table-title">Badges</h1>
        <div class="search-filter-button-group">
          <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line density="compact"
            class="search-bar">
            <template v-slot:prepend-inner>
              <Icon icon="material-symbols:search-rounded" width="24" height="24" />
            </template>
          </v-text-field>

          <!-- Filter By category -->
          <v-select v-model="selectedFilterDisplay" :items="filterOptions" label="Filter By Type" variant="solo-filled"
            density="compact" hide-details class="filter-menu">
          </v-select>

          <!-- Add Badge -->
          <v-btn class="button" variant="elevated" color="#5EC4B6" @click="addBadgePopup()">
            Add Badge
          </v-btn>
        </div>
      </div>

      <!-- List of all items as cards -->
      <v-list class="card-holder">
        <div v-for="item in filteredItems" :key="item.id" class="badge-card">
          <!-- Image on the Left -->
          <div class="image-container">
            <img :src="item.image" alt="Badge Image">
          </div>

          <!-- Content on the Right -->
          <div class="badge-content">
            <div class="item-name">{{ item.name }}</div>

            <!-- Buttons -->
            <div class="button-container">
              <button class="button" @click="editBadgePopup(item)">Edit</button>
              <button class="button" @click="deleteBadgeConfirmation(item)">Delete</button>
            </div>
          </div>
        </div>
      </v-list>
    </v-card>

    <!-- Delete Modal -->
    <div v-if="showDeleteBadge" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <span @click="showDeleteBadge = false" class="close">&times;</span>
          <p v-if="!deleteError">
            Do you want to DELETE <br />
            {{ badgeToDelete.name }}?
          </p>
          <p v-if="deleteError">
            Error deleting<br />{{ badgeToDelete.name }}.
          </p>
        </div>
        <div class="modal-body">
          <v-btn v-if="!deleteError" class="button" color="#708E9A" @click="showDeleteBadge = false">CANCEL</v-btn>
          <v-btn v-if="!deleteError" color="#F04E3E" class="error button" @click="deleteBadge(badge)">DELETE</v-btn>
          <v-btn v-if="deleteError" class="button" @click="
            deleteError = false;
          showDeleteBadge = false;
          ">CLOSE</v-btn>
        </div>
      </div>
    </div>
    <v-snackbar v-model="showSnackbar" timeout="3000" color="success" style="color: white">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>

  <!-- Badge Add/Edit Modal -->
  <div v-if="showBadgeDetails" class="modal">
    <v-card class="edit-popup">
      <div v-if="hasError" style="color: red; width:100%; white-space: pre-line;">{{ errorMessage }}</div>
      <v-card-title class="popup-header">
        <!-- Badge Image -->
        <div class="add-edit-image-container" @click="triggerFileInput">
          <input type="file" ref="fileInput" style="display: none" @change="fileUpload($event)" />
          <div v-if="badgeImage" class="image-preview">
            <img :src="badgeImage" alt="Uploaded Image" />
          </div>
          <div v-else class="placeholder-text">Insert Image</div>
        </div>

        <!-- Badge Name -->
        <v-text-field v-model="badgeName" class="name-input" density="comfortable">
          <template v-slot:append-inner>
            <Icon icon="material-symbols:edit-outline" width="24" height="24" />
          </template>
        </v-text-field>
      </v-card-title>

      <v-divider></v-divider>

      <v-container class="popup-content">
        <!-- Description-->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.description }}</label>
          </v-col>
          <v-col cols="7">
            <v-textarea v-model="badgeDescription" rows="2" variant="outlined" density="compact"></v-textarea>
          </v-col>
        </v-row>

        <!-- Points -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.points }}</label>
          </v-col>
          <v-col cols="7">
            <v-text-field v-model="badgePoints" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

        <!-- Type -->
        <v-row class="form-row">
          <v-col cols="5" class="label-column">
            <label>{{ labels.type }}</label>
          </v-col>
          <v-col cols="7">
            <v-select v-model="badgeType" :items="badgeOptions" variant="solo-filled" density="compact" hide-details
              class="filter-menu"></v-select>
          </v-col>
        </v-row>

        <!-- Required Tasks -->
        <v-row class="form-row" v-if="badgeType === 'Task Completion' || badgeType === 'Task Experience Completion'">
          <v-col cols="5" class="label-column">
            <label>{{ labels.tasks }}</label>
          </v-col>
          <v-col cols="7">
            <v-row align="center" justify="start">
              <v-col v-for="(taskSelection, i) in taskSelections" :key="taskSelection.name" class="py-1 pe-0"
                cols="auto">
                <v-chip closable class="ma-1" color="primary" rounded="lg"
                  @click:close="newTasks.tasksToAdd.splice(i, 1)">

                  {{ taskSelection.name }}
                </v-chip>
              </v-col>

              <v-col cols="12">
                <v-menu v-model="taskMenu" close-on-content-click>
                  <template v-slot:activator="{ props }">
                    <v-text-field ref="taskSearchField" v-model="taskSearch" label="Search" hide-details single-line
                      variant="solo" density="compact" v-bind="props">
                    </v-text-field>
                  </template>

                  <v-list style="max-height: 300px; overflow-y: auto;">
                    <template v-for="tasks in filteredTasks">
                      <v-list-item v-if="!newTasks.tasksToAdd.includes(tasks)" :key="tasks.id"
                        @click="newTasks.tasksToAdd.push(tasks)">
                        <template v-slot:prepend>
                        </template>

                        <v-list-item-title v-text="tasks.name">
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Required Experience Types -->
        <v-row class="form-row"
          v-if="badgeType === 'Experience Completion' || badgeType === 'Task Experience Completion'">
          <v-col cols="5" class="label-column">
            <label>{{ labels.experienceTypes }}</label>
          </v-col>
          <v-col cols="7">
            <v-row align="center" justify="start">
              <v-col v-for="(experienceTypeSelection, i) in experienceTypeSelections"
                :key="experienceTypeSelection.name" class="py-1 pe-0" cols="auto">
                <v-chip closable class="ma-1" color="primary" rounded="lg"
                  @click:close="newExperienceTypes.experienceTypesToAdd.splice(i, 1)">

                  {{ experienceTypeSelection.name }}
                </v-chip>
              </v-col>

              <v-col cols="12">
                <v-menu v-model="experienceTypeMenu" close-on-content-click>
                  <template v-slot:activator="{ props }">
                    <v-text-field ref="experienceTypeSearchField" v-model="experienceTypeSearch" label="Search"
                      hide-details single-line variant="solo" density="compact" v-bind="props">
                    </v-text-field>
                  </template>

                  <v-list style="max-height: 300px; overflow-y: auto;">
                    <template v-for="experienceTypes in filteredexperienceTypes">
                      <v-list-item v-if="!newExperienceTypes.experienceTypesToAdd.includes(experienceTypes)"
                        :key="experienceTypes.id"
                        @click="newExperienceTypes.experienceTypesToAdd.push(experienceTypes)">
                        <template v-slot:prepend>
                        </template>

                        <v-list-item-title v-text="experienceTypes.name">
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Semester From Graduation -->
        <v-row class="form-row" v-if="badgeType === 'Flightplan Completion'">
          <v-col cols="5" class="label-column">
            <label>{{ labels.semesterFromGraduation }}</label>
          </v-col>
          <v-col cols="7">
            <v-text-field v-model="badgeSemester" variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
        </v-row>

      </v-container>

      <v-divider></v-divider>

      <v-card-actions class="popup-actions">
        <v-spacer></v-spacer>
        <v-btn v-if="badgeEdit" class="button" color="red" variant="outlined"
          @click="deleteBadgeConfirmation(badgeToEdit)">Delete</v-btn>
        <v-btn class="button" color="grey" variant="outlined" @click="showBadgeDetails = false">Cancel</v-btn>
        <v-btn class="button" color="#5EC4B6" variant="flat" @click="badgeEdit ? editBadge() : addBadge()">Save</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref, computed, onMounted, watch } from "vue";
import badgeServices from "@/services/flightPlanServices/badgeServices";
import taskServices from "@/services/flightPlanServices/taskServices";
import taskBadgeServices from "@/services/flightPlanServices/taskBadgeServices";
import experienceTypeServices from "@/services/flightPlanServices/experienceTypeServices";
import badgeExperienceTypeServices from "@/services/flightPlanServices/badgeExperienceTypeServices";
import { Icon } from '@iconify/vue';

// Search and filter related variables
const search = ref("");
const selectedFilterDisplay = ref(null);
const selectedFilter = ref(null);

const badges = ref([]);
const showBadgeDetails = ref(false);
const badgeAdd = ref(false);
const badgeEdit = ref(false);

// Popup Search and Filter
const tasks = ref([]);
const taskMenu = ref(false);
const taskSearch = ref('');
const taskSearchField = ref()
const newTasks = ref({
  tasksToAdd: [],
})
const oldBadgeTasks = ref([]);

const experienceTypes = ref([]);
const experienceTypeMenu = ref(false);
const experienceTypeSearch = ref('');
const experienceTypeSearchField = ref()
const newExperienceTypes = ref({
  experienceTypesToAdd: [],
})
const oldBadgeExperienceTypes = ref([]);

// Delete Variables
const showDeleteBadge = ref(false);
const badgeToDelete = ref(null);
const deleteError = ref(false);

// Add/Edit Variables
const badgeToEdit = ref(null);
const badgeName = ref(null);
const badgeDescription = ref(null);
const badgeType = ref(null);
const badgePoints = ref(null);
const badgeSemester = ref(null);
const hasError = ref(false);
const errorMessage = ref("");

// Badge Image Variables
const badgeImage = ref(null);
const badgeImageType = ref(null);

//Snackbar variables
const showSnackbar = ref(false);
const snackbarMessage = ref("");

// Labels for Add/Edit Modal
const labels = {
  description: "Description",
  type: "Type",
  points: "Points",
  tasks: "Tasks",
  experienceTypes: "Experience Types",
  semesterFromGraduation: "Semester",
};

const badgeOptions = ['Task Completion', 'Experience Completion', 'Task Experience Completion', 'Flightplan Completion'];

onMounted(async () => {
  getAllBadges();
  await getAllTasks();
  await getAllExperienceTypes();
});

// Gets the 
const filterOptions = ref(['All', 'Task Completion', 'Experience Completion', 'Task Experience Completion', 'Flightplan Completion']);

// Search function
const filteredItems = computed(() => {
  if (selectedFilterDisplay.value === 'Task Completion') selectedFilter.value = 'task_completion';
  else if (selectedFilterDisplay.value === 'Experience Completion') selectedFilter.value = 'experience_completion';
  else if (selectedFilterDisplay.value === 'Task Experience Completion') selectedFilter.value = 'task_experience_completion';
  else if (selectedFilterDisplay.value === 'Flightplan Completion') selectedFilter.value = 'flightplan_completion';
  else if (selectedFilterDisplay.value === 'All') selectedFilter.value = 'All';

  return badges.value.filter((item) => {
    const matchesSearch = !search.value || item.name.toLowerCase().includes(search.value.toLowerCase());
    const matchesCategory = selectedFilter.value === "All" || !selectedFilter.value || item.type === selectedFilter.value;
    return matchesSearch && matchesCategory;
  });
});

const getAllBadges = () => {
  badgeServices.getAllBadges()
    .then((res) => {
      badges.value = res.data;
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

const getAllTasks = async () => {
  tasks.value = (await taskServices.getAllTasks()).data;
}

const getAllExperienceTypes = async () => {
  experienceTypes.value = (await experienceTypeServices.getAllExperienceTypes()).data;
}

// Popup Search Functionality
const filteredTasks = computed(() => {
  const _taskSearch = taskSearch.value.toLowerCase()
  if (!_taskSearch) return tasks.value
  return tasks.value.filter(item => {
    const text = item.name.toLowerCase()
    return text.indexOf(_taskSearch) > -1
  })
})

const taskSelections = computed(() => {
  const taskSelections = []
  for (const taskSelection of newTasks.value.tasksToAdd) {
    taskSelections.push(taskSelection)
  }
  return taskSelections
})

watch(newTasks.value.tasksToAdd, () => {
  taskSearch.value = ''
})

const filteredexperienceTypes = computed(() => {
  const _experienceTypeSearch = experienceTypeSearch.value.toLowerCase()
  if (!_experienceTypeSearch) return experienceTypes.value
  return experienceTypes.value.filter(item => {
    const text = item.name.toLowerCase()
    return text.indexOf(_experienceTypeSearch) > -1
  })
})

const experienceTypeSelections = computed(() => {
  const experienceTypeSelections = []
  for (const experienceTypeSelection of newExperienceTypes.value.experienceTypesToAdd) {
    experienceTypeSelections.push(experienceTypeSelection)
  }
  return experienceTypeSelections
})

watch(newExperienceTypes.value.experienceTypesToAdd, () => {
  experienceTypeSearch.value = ''
})

// Add Functionality
const addBadgePopup = async () => {
  errorMessage.value = "";
  hasError.value = false;
  showBadgeDetails.value = true;
  badgeAdd.value = true;
  badgeEdit.value = false;
  badgeToEdit.value = null;

  badgeName.value = null;
  badgeDescription.value = null;
  badgeType.value = null;
  badgePoints.value = null;
  badgeSemester.value = null;
  badgeImage.value = null;
  badgeImageType.value = null;

  taskMenu.value = false;
  taskSearch.value = '';
  taskSearchField.value = null;
  newTasks.value.tasksToAdd = [];

  experienceTypeMenu.value = false;
  experienceTypeSearch.value = '';
  taskSearchField.value = null;
  newExperienceTypes.value.experienceTypesToAdd = [];
};

const addBadge = async () => {
  hasError.value = false;
  if (badgeImage.value == null) {
    errorMessage.value += "Add an Image before creating badge\n";
    hasError.value = true;
  }
  if (badgeName.value == null) {
    errorMessage.value += "Add a name before creating badge\n";
    hasError.value = true;
  }
  if (badgeDescription.value == null) {
    errorMessage.value += "Add a description before creating badge\n";
    hasError.value = true;
  }
  if (badgeType.value == null) {
    errorMessage.value += "Assign a type before creating badge\n";
    hasError.value = true;
  }
  if (badgePoints.value == null) {
    errorMessage.value += "Add points before creating badge\n";
    hasError.value = true;
  }
  console.log(newTasks.value.tasksToAdd.length);
  console.log(newTasks.value.tasksToAdd);
  if ((badgeType.value == "Task Completion" || badgeType.value == "Task Experience Completion") && newTasks.value.tasksToAdd.length == 0) {
    errorMessage.value += "Add a task before creating badge\n"
    hasError.value = true;
  }
  if ((badgeType.value == "Experience Completion" || badgeType.value == "Task Experience Completion") && newExperienceTypes.value.experienceTypesToAdd.length == 0) {
    errorMessage.value += "Add a experience before creating badge\n"
    hasError.value = true;
  }
  if (badgeType.value == "Flightplan Completion" && badgeSemester.value == null) {
    errorMessage.value += "Add a semester before creating badge\n"
    hasError.value = true;
  }
  if (hasError.value) return;

  if (badgeType.value === 'Task Completion') badgeType.value = 'task_completion';
  else if (badgeType.value === 'Experience Completion') badgeType.value = 'experience_completion';
  else if (badgeType.value === 'Task Experience Completion') badgeType.value = 'task_experience_completion';
  else if (badgeType.value === 'Flightplan Completion') badgeType.value = 'flightplan_completion';

  const newBadge = {
    name: badgeName.value,
    description: badgeDescription.value,
    type: badgeType.value,
    points: badgePoints.value,
    image: badgeImage.value.split(',')[1], // Removes header before passing it to the backend
    image_type: badgeImageType.value
  }

  if (badgeType.value === "flightplan_completion") {
    newBadge.semester_from_grad = badgeSemester.value;
  }

  badgeToEdit.value = (await badgeServices.createBadge(newBadge)).data;

  switch (badgeType.value) {
    case ('task_completion'):
      await addTasks();
      break;
    case ('experience_completion'):
      await addExperienceTypes();
      break;
    case ('task_experience_completion'):
      await addTasks();
      await addExperienceTypes();
      break;
  }

  //Snackbar success
  snackbarMessage.value = "Badge added successfully!";
  showSnackbar.value = true;
  
  getAllBadges();

  showBadgeDetails.value = false;
};

const addTasks = async () => {
  for (const task of newTasks.value.tasksToAdd) {
    const taskBadge = {
      taskId: task.id,
      badgeId: badgeToEdit.value.id
    }
    await taskBadgeServices.createTaskBadge(taskBadge.taskId, taskBadge.badgeId, taskBadge)
  }
}

const addExperienceTypes = async () => {
  console.log(newExperienceTypes.value.experienceTypesToAdd);
  for (const experienceType of newExperienceTypes.value.experienceTypesToAdd) {
    const experienceTypeBadge = {
      experienceTypeId: experienceType.id,
      badgeId: badgeToEdit.value.id
    }
    await badgeExperienceTypeServices.createBadgeExperienceType(experienceTypeBadge.experienceTypeId, experienceTypeBadge.badgeId, experienceTypeBadge)
  }
}

// Edit Functionality
const editBadgePopup = async (item) => {
  errorMessage.value = "";
  hasError.value = false;
  badgeToEdit.value = item;
  showBadgeDetails.value = true;
  badgeEdit.value = true;
  badgeAdd.value = false;

  badgeName.value = badgeToEdit.value.name;
  badgeDescription.value = badgeToEdit.value.description;
  badgePoints.value = badgeToEdit.value.points;
  if (badgeToEdit.value.type === 'task_completion') badgeType.value = 'Task Completion';
  else if (badgeToEdit.value.type === 'experience_completion') badgeType.value = 'Experience Completion';
  else if (badgeToEdit.value.type === 'task_experience_completion') badgeType.value = 'Task Experience Completion';
  else if (badgeToEdit.value.type === 'flightplan_completion') badgeType.value = 'Flightplan Completion';
  badgeImage.value = badgeToEdit.value.image;
  badgeImageType.value = badgeToEdit.value.image_type;
  badgeSemester.value = badgeToEdit.value.semester_from_grad;

  taskMenu.value = false;
  taskSearch.value = '';
  taskSearchField.value = null;
  oldBadgeTasks.value = (await taskBadgeServices.getAllTaskBadgesForBadge(badgeToEdit.value.id)).data;
  const oldTasks = tasks.value.filter(task => oldBadgeTasks.value.some(badgeTask => task.id === badgeTask.taskId));
  newTasks.value.tasksToAdd = oldTasks;

  experienceTypeMenu.value = false;
  experienceTypeSearch.value = '';
  taskSearchField.value = null;
  oldBadgeExperienceTypes.value = (await badgeExperienceTypeServices.getAllBadgeExperienceTypesForBadge(badgeToEdit.value.id)).data;
  const oldExperienceTypes = experienceTypes.value.filter(experienceType => oldBadgeExperienceTypes.value.some(badgeExperience => experienceType.id === badgeExperience.experienceTypeId));
  newExperienceTypes.value.experienceTypesToAdd = oldExperienceTypes;
};

const editBadge = async () => {
  hasError.value = false;
  if (badgeImage.value == null) {
    errorMessage.value += "Add an Image before creating badge\n";
    hasError.value = true;
  }
  if (badgeName.value == null) {
    errorMessage.value += "Add a name before creating badge\n";
    hasError.value = true;
  }
  if (badgeDescription.value == null) {
    errorMessage.value += "Add a description before creating badge\n";
    hasError.value = true;
  }
  if (badgeType.value == null) {
    errorMessage.value += "Assign a type before creating badge\n";
    hasError.value = true;
  }
  if (badgePoints.value == null) {
    errorMessage.value += "Add points before creating badge\n";
    hasError.value = true;
  }
  if ((badgeType.value == "Task Completion" || badgeType.value == "Task Experience Completion") && newTasks.value.tasksToAdd.length == 0) {
    errorMessage.value += "Add a task before creating badge\n"
    hasError.value = true;
  }
  if ((badgeType.value == "Experience Completion" || badgeType.value == "Task Experience Completion") && newExperienceTypes.value.experienceTypesToAdd.length == 0) {
    errorMessage.value += "Add a experience before creating badge\n"
    hasError.value = true;
  }
  if (badgeType.value == "Flightplan Completion" && badgeSemester.value == null) {
    errorMessage.value += "Add a semester before creating badge\n"
    hasError.value = true;
  }
  if (hasError.value) return;

  if (badgeType.value === 'Task Completion') badgeType.value = 'task_completion';
  else if (badgeType.value === 'Experience Completion') badgeType.value = 'experience_completion';
  else if (badgeType.value === 'Task Experience Completion') badgeType.value = 'task_experience_completion';
  else if (badgeType.value === 'Flightplan Completion') badgeType.value = 'flightplan_completion';

  const editBadge = {
    name: badgeName.value,
    description: badgeDescription.value,
    type: badgeType.value,
    points: badgePoints.value,
    image: badgeImage.value.split(',')[1], // Removes header before passing it to the backend
    image_type: badgeImageType.value
  }

  if (badgeType.value === "flightplan_completion") {
    editBadge.semester_from_grad = badgeSemester.value;
  }

  await badgeServices.updateBadge(badgeToEdit.value.id, editBadge);

  switch (badgeType.value) {
    case ('task_completion'):
      await updateTasks();
      break;
    case ('experience_completion'):
      await updateExperienceTypes();
      break;
    case ('task_experience_completion'):
      await updateTasks();
      await updateExperienceTypes();
      break;
  }

  //Snackbar success
  snackbarMessage.value = "Badge updated successfully!";
  showSnackbar.value = true;

  getAllBadges();

  showBadgeDetails.value = false;
};

const updateTasks = async () => {
  for (const task of newTasks.value.tasksToAdd) {
    if (!oldBadgeTasks.value.some(oldTask => oldTask.taskId === task.id)) {
      const taskBadge = {
        taskId: task.id,
        badgeId: badgeToEdit.value.id
      }
      await taskBadgeServices.createTaskBadge(taskBadge.taskId, taskBadge.badgeId, taskBadge);
    }
  }

  for (const task of oldBadgeTasks.value) {
    if (!newTasks.value.tasksToAdd.some(newTask => newTask.id === task.taskId)) {
      await taskBadgeServices.deleteSystemTaskBadge(task.id);
    }
  }
}

const updateExperienceTypes = async () => {
  for (const experienceType of newExperienceTypes.value.experienceTypesToAdd) {
    if (!oldBadgeExperienceTypes.value.some(oldExperienceType => oldExperienceType.experienceTypeId === experienceType.id)) {
      const experienceTypeBadge = {
        experienceTypeId: experienceType.id,
        badgeId: badgeToEdit.value.id
      }
      await badgeExperienceTypeServices.createBadgeExperienceType(experienceTypeBadge.experienceTypeId, experienceTypeBadge.badgeId, experienceTypeBadge);
    }
  }

  for (const experienceType of oldBadgeExperienceTypes.value) {
    if (!newExperienceTypes.value.experienceTypesToAdd.some(newExperienceType => newExperienceType.id === experienceType.experienceTypeId)) {
      await badgeExperienceTypeServices.deleteBadgeExperienceType(experienceType.id);
    }
  }
}

// Delete Functions
const deleteBadgeConfirmation = (item) => {
  showBadgeDetails.value = false;
  badgeToDelete.value = item;
  showDeleteBadge.value = true
};

const deleteBadge = () => {
  badgeServices.deleteBadge(badgeToDelete.value.id)
    .then(() => {
      showDeleteBadge.value = false;
      badges.value = badges.value.filter((allItems) => allItems.id !== badgeToDelete.value.id);

      //Snackbar success
      snackbarMessage.value = "Badge deleted successfully!";
      showSnackbar.value = true;
    })
    .catch((e) => {
      message.value = e.response.data.message;
      deleteError.value = true;
    });
};

// Image Handling
const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.click();
};

const fileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Converts the file to Base64
    reader.onload = () => {
      const base64String = reader.result;
      badgeImage.value = base64String; // Preview
      badgeImageType.value = file.type; // Saves the file type whenever the image changes
    };
  }
};
</script>

<style scope>
.card-holder {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  /* Responsive grid */
  gap: 16px;
  justify-content: start;
  padding: 16px;
  border-radius: 10px;
  background: #FFF;
  box-shadow: 0px 4px 8px 0px rgba(32, 32, 32, 0.25);
  margin-bottom: 5px;
  margin-left: 10px;
  margin-right: 10px;
  max-height: calc(5 * (105px + 20px));
  /* 5 rows * (card height + gap) */
  overflow-y: auto;
}

/* Scroll Bar */
.card-holder::-webkit-scrollbar {
  width: 8px;
  /* Thin scrollbar */
}

.card-holder::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  /* Visible only when scrolling */
  border-radius: 4px;
}

.card-holder::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
  /* Darker when hovered */
}

.card-holder::-webkit-scrollbar-track {
  background: transparent;
  /* Hide track */
}

.image-container {
  width: 90px;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(32, 32, 32, 0.15);
  flex-shrink: 0;
  /* Prevent shrinking */
}

/* Add and Edit */
.edit-popup {
  max-width: 550px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 16px;
}

.popup-header {
  display: flex;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  width: 100%;
  gap: 16px;
}

.popup-actions {
  padding: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>