<template>
    <div>
        <v-card flat>
            <!-- Title, includes search, add, and mass deletion function -->
            <div class="title-row">
                <h1 class="table-title">Badges</h1>
                <div class="search-filter-button-group">
                    <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line
                        density="compact" class="search-bar">
                        <template v-slot:prepend-inner>
                            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
                        </template>
                    </v-text-field>

                    <!-- Filter By category -->
                    <v-select v-model="selectedFilterDisplay" :items="filterOptions" label="Filter By Type"
                        variant="solo-filled" density="compact" hide-details class="filter-menu">
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
                    <button @click="editBadgePopup(item)">Edit</button>
                    <button @click="deleteBadgeConfirmation(item)">Delete</button>
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
                    <v-btn v-if="!deleteError" color="#708E9A" @click="showDeleteBadge = false">CANCEL</v-btn>
                    <v-btn v-if="!deleteError" color="#F04E3E" class="error" @click="deleteBadge(badge)">DELETE</v-btn>
                    <v-btn v-if="deleteError" @click="
                        deleteError = false;
                        showDeleteBadge = false;
                    ">CLOSE</v-btn>
                </div>
            </div>
        </div>
    </div>

    <!-- Badge Add/Edit Modal -->
    <div v-if="showBadgeDetails" class="modal">
      <v-card class="edit-popup">
          <v-card-title class="popup-header">
              <!-- Badge Image -->
              <div class="add-edit-image-container" @click="triggerFileInput">
                  <input
                  type="file"
                  ref="fileInput"
                  style="display: none"
                  @change="fileUpload($event)"
                  />
                  <div v-if="badgeImage" class="image-preview">
                      <img :src="badgeImage" alt="Uploaded Image" />
                  </div>
                  <div v-else class="placeholder-text">Insert Image</div>
              </div>

              <!-- Badge Name -->
              <v-text-field
                  v-model="badgeName"
                  class="name-input"
                  density="comfortable"
              >
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

          <!-- Type -->
          <v-row class="form-row">
            <v-col cols="5" class="label-column">
              <label>{{ labels.type }}</label>
            </v-col>

            <v-col cols="7">
                <v-select v-model="badgeType" :items="badgeOptions" variant="solo-filled" density="compact" hide-details class="filter-menu"></v-select>
            </v-col>
          </v-row>

          <!-- Points -->
          <v-row class="form-row">
            <v-col cols="5" class="label-column">
              <label>{{ labels.points }}</label>
            </v-col>

            <v-col cols="7">
              <v-text-field v-model="badgePoints" variant="outlined" density="compact"
                hide-details></v-text-field>
            </v-col>
          </v-row>

        </v-container>

        <v-divider></v-divider>

        <v-card-actions class="popup-actions">
          <v-spacer></v-spacer>
          <v-btn v-if="badgeEdit" color="red" variant="outlined" @click="deleteBadgeConfirmation(badgeToEdit)">Delete</v-btn>
          <v-btn color="grey" variant="outlined" @click="showBadgeDetails = false">Cancel</v-btn>
          <v-btn color="green" variant="flat" @click="badgeEdit ? editBadge() : addBadge()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import badgeServices from "@/services/flightPlanServices/badgeServices";

// Search and filter related variables
const search = ref("");
const selectedFilterDisplay = ref(null);
const selectedFilter = ref(null);

const badges = ref([]);
const showBadgeDetails = ref(false);
const badgeAdd = ref(false);
const badgeEdit = ref(false);

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

// Badge Image Variables
const badgeImage = ref(null);
const badgeImageType = ref(null);

// Labels for Add/Edit Modal
const labels = {
  description: "Description",
  type: "Type",
  points: "Points"
};

const badgeOptions = ['Task Completion', 'Experience Completion', 'Flightplan Completion'];

onMounted(() => {
    getAllBadges();
});

// Gets the 
const filterOptions = ref(['All', 'Task Completion', 'Experience Completion', 'Flightplan Completion']);

// Search function
const filteredItems = computed(() => {
  if (selectedFilterDisplay.value === 'Task Completion') selectedFilter.value = 'task_completion';
  else if (selectedFilterDisplay.value === 'Experience Completion') selectedFilter.value = 'experience_completion';
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
      console.log(badges.value);
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

// Add Functionality
const addBadgePopup = () => {
  showBadgeDetails.value = true;
  badgeAdd.value = true;
  badgeEdit.value = false;
  badgeToEdit.value = null;

  badgeName.value = null;
  badgeDescription.value = null;
  badgeType.value = null;
  badgePoints.value = null;
  badgeImage.value = null;
  badgeImageType.value = null;
};

const addBadge = () => {
    if (badgeType.value === 'Task Completion') badgeType.value = 'task_completion';
    else if (badgeType.value === 'Experience Completion') badgeType.value = 'experience_completion';
    else if (badgeType.value === 'Flightplan Completion') badgeType.value = 'flightplan_completion';

    const newBadge = {
        name: badgeName.value,
        description: badgeDescription.value,
        type: badgeType.value,
        points: badgePoints.value,
        image: badgeImage.value.split(',')[1], // Removes header before passing it to the backend
        image_type: badgeImageType.value
    }

    badgeServices.createBadge(newBadge)
        .then((res) => {
            showBadgeDetails.value = false;
            console.log("Badge added successfully: " + res.data);
            getAllBadges();
        })
        .catch((error) => {
            console.log("Error: " + error);
        })
};

// Edit Functionality
const editBadgePopup = (item) => {
  badgeToEdit.value = item;
  showBadgeDetails.value = true;
  badgeEdit.value = true;
  badgeAdd.value = false;

  badgeName.value = badgeToEdit.value.name;
  badgeDescription.value = badgeToEdit.value.description;
  badgePoints.value = badgeToEdit.value.points;
  if (badgeToEdit.value.type === 'task_completion') badgeType.value = 'Task Completion';
  if (badgeToEdit.value.type === 'experience_completion') badgeType.value = 'Experience Completion';
  if (badgeToEdit.value.type === 'flightplan_completion') badgeType.value = 'Flightplan Completion';
  badgeImage.value = badgeToEdit.value.image;
  badgeImageType.value = badgeToEdit.value.image_type;
  console.log(badgeImage.value);
  console.log(badgeImageType.value);
};

const editBadge = () => {
    if (badgeType.value === 'Task Completion') badgeType.value = 'task_completion';
    else if (badgeType.value === 'Experience Completion') badgeType.value = 'experience_completion';
    else if (badgeType.value === 'Flightplan Completion') badgeType.value = 'flightplan_completion';

    const editBadge = {
        name: badgeName.value,
        description: badgeDescription.value,
        type: badgeType.value,
        points: badgePoints.value,
        image: badgeImage.value.split(',')[1], // Removes header before passing it to the backend
        image_type: badgeImageType.value
    }

    badgeServices.updateBadge(badgeToEdit.value.id, editBadge)
        .then((res) => {
            console.log("Badge Updated Successfully: " + res.data);
            showBadgeDetails.value = false;
            getAllBadges();
        })
        .catch((error) => {
            console.log("Error: " + error);
        })
};

// Delete Functions
const deleteBadgeConfirmation = (item) => {
    showBadgeDetails.value = false;
    badgeToDelete.value = item;
    showDeleteBadge.value = true
    console.log('Delete Badge:', itemToDelete.value.name);
};

const deleteBadge = () => {
    badgeServices.deleteBadge(badgeToDelete.value.id)
        .then(() => {
            showDeleteBadge.value = false;
            badges.value = badges.value.filter((allItems) => allItems.id !== badgeToDelete.value.id);
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

.card-holder {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr)); /* Responsive grid */
  gap: 16px;
  justify-content: start;
  padding: 16px;
  border-radius: 10px;
  background: #FFF;
  box-shadow: 0px 4px 8px 0px rgba(32, 32, 32, 0.25);
  margin-bottom: 5px;
  margin-left: 10px;
  margin-right: 10px;
  max-height: calc(5 * (105px + 20px)); /* 5 rows * (card height + gap) */
  overflow-y: auto;
}

/* Scroll Bar */
.card-holder::-webkit-scrollbar {
  width: 8px; /* Thin scrollbar */
}

.card-holder::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3); /* Visible only when scrolling */
  border-radius: 4px;
}

.card-holder::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5); /* Darker when hovered */
}

.card-holder::-webkit-scrollbar-track {
  background: transparent; /* Hide track */
}

.badge-card {
  display: flex;
  align-items: center; /* Align items in a row */
  width: 100%; 
  max-width: 275px; 
  height: 105px;
  background: #F9F7F7;
  border-radius: 10px;
  box-shadow: 0px 4px 4px 0px rgba(32, 32, 32, 0.20);
  padding: 12px;
  gap: 12px; /* Space between image and text */
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
  flex-shrink: 0; /* Prevent shrinking */
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(10px, 5vw, 16px); /* Auto scales between 12px and 18px */
}

.button-container {
  display: flex;
  gap: 4px;
}

.button-container button {
  font-size: 12px;
  width: 55px;
  height: 26px;
  flex-shrink: 0;
  flex: 1;
  padding: 3px 6px;
  border: none;
  border-radius: 10px;
  background: #5EC4B6;
  cursor: pointer;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: white;
}

.button-container button:last-child {
  width: 85px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #F04E3E;
}

/* Add and Edit */
.edit-popup {
  max-width: 550px;
  /* Increased width */
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

.popup-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

.popup-actions {
  padding: 12px;
  display: flex;
  justify-content: flex-end;
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

.add-edit-image-container {
  position: relative; 
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  background: rgba(32, 32, 32, 0.15);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-preview img {
  position: absolute;
  top: 50%;  
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.placeholder-text {
    position: absolute;
    color: #666;
    font-size: 14px;
    text-align: center;
    pointer-events: none;
}

.name-input {
  /* flex-grow: 1; */
  height: 100px; /* Match the new image height */
  /* display: flex; */
  align-items: center;
  width: 100%;
}

.name-input .v-field__control {
  height: 100%;
  align-items: center;
  /* display: flex; */
  width: 100%;
}
</style>