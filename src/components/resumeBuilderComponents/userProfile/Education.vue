<template>
  <div class="container">
    <div class="sidebar">
      <div class="list scrollable">
        <!-- EDUCATION LIST ON LEFT SIDE -->
        <div class="list-title title-color" @click="toggleDropdown">
          Educations List
        </div>
        <br />
        <div v-if="showDropdown" class="dropdown">
          <ul>
            <li v-for="(item, index) in educations" :key="index" class="dropdown-item">
              <!-- Display each institution's name -->
              <span class="university-name name">{{ item.institution }}</span>
              <div class="icon-buttons">
                <img src="@/assets/list-elements/edit-list-item.png" alt="Edit" class="icon"
                  @click.stop="editEntry(item)" />
                <img src="@/assets/list-elements/delete-list-item.png" alt="Delete" class="icon"
                  @click.stop="showDeleteConfirmation(item)" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main form for entering education details -->
    <div class="main-content">
      <div class="form">
        <!-- Degree input field -->
        <div class="text-field-with-title">
          <label for="degree" class="field-label">DEGREE <span class="mandatory">*</span></label>
          <input type="text" id="degree" v-model="formData.degree" class="text-field" placeholder="Enter your degree"
            required />
        </div>
        <!-- Institution input field -->
        <div class="text-field-with-title">
          <label for="institution" class="field-label">INSTITUTION <span class="mandatory">*</span></label>
          <input type="text" id="institution" v-model="formData.institution" class="text-field"
            placeholder="Enter the institution name" required />
        </div>
        <!-- GPA input field -->
        <div class="text-field-with-title">
          <label for="gpa" class="field-label">GPA <span class="mandatory">*</span></label>
          <input type="number" id="gpa" v-model="formData.gpa" class="text-field" placeholder="Enter your GPA"
            step="0.01" required />
        </div>
        <!-- Graduation date input field -->
        <div class="text-field-with-title">
          <label for="graduation" class="field-label">GRADUATION DATE <span class="mandatory">*</span></label>
          <input type="date" id="graduation" v-model="formData.graduation_date" class="text-field" required />
        </div>
        <div class="form-buttons">
          <!-- Delete changes button -->
          <div v-if="editEntryVal && currentEducation" class="delete-button" @click="showDeleteConfirmation(formData)">
            <div class="delete-button-child"></div>
            <b class="delete-changes">DELETE</b>
          </div>

          <div v-else>
          </div>
          <!-- Save changes button -->
          <div class="save-button" @click="saveChanges">
            <div class="save-button-child"></div>
            <b class="save-changes">{{ buttonLabel }}</b>
          </div>
          <br><br><br>
          <!-- Navigation buttons -->
          <div class="navigation-buttons">
            <button class="nav-button" @click="goBack">BACK</button>
            <button class="nav-button" @click="goNext">NEXT</button>
          </div>
        </div>
      </div>

    </div>

    <!-- Hidden Delete Confirmation Pop-up -->
    <div v-if="displayDelete" class="modal">
      <div class="modal-content">
        <span @click="displayDelete = false" class="close">&times;</span>
        <div class="modal-header">
          <p style="font-weight: bold;">This action is permanent.</p>
          <hr />
          <p v-if="!deleteError && educationToDelete">
            Are you sure you want to delete <br />
            {{ educationToDelete.institution }}?
          </p>
          <p v-if="deleteError">
            Error deleting<br />
            {{ educationToDelete.institution }}.
          </p>
        </div>

        <br />
        <div class="modal-body">
          <button v-if="!deleteError" @click="displayDelete = false" class="modal-button">
            CANCEL
          </button>
          <button v-if="!deleteError" class="error modal-button" @click="deleteEducation()">
            DELETE
          </button>
          <button v-if="deleteError" @click="() => { deleteError = false; displayDelete = false; }"
            class="modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import educationServices from "@/services/resumeBuilderServices/educationServices.js";
import Utils from "@/config/utils.js";

const router = useRouter();
const route = useRoute();

const user = Utils.getStore("user");
const studentId = ref();
const educations = ref(null);
const editEntryVal = ref(false);

const errors = ref({});

onMounted(() => {
  Utils.getUser(user).then(value => {
    studentId.value = value.studentId;
    getEducation();
  });
  console.log(editEntryVal.value)
});

const showDropdown = ref(true);
const formData = ref({
  degree: '',
  institution: '',
  gpa: '',
  graduation_date: ''
});

const currentEducation = ref(null);
const displayDelete = ref(false);
const deleteError = ref(false);
const educationToDelete = ref(null);
const message = ref('');

const buttonLabel = computed(() => {
  return route.path.includes('/resumeBuilder/education/edit/') ? 'SAVE CHANGES' : 'ADD TO LIST';
});


function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function editEntry(item) {
  router.push({ path: `/resumeBuilder/education/edit/` });
  editEntryVal.value = true;
  currentEducation.value = item.id;
  formData.value.degree = item.degree;
  formData.value.institution = item.institution;
  formData.value.gpa = item.gpa;
  formData.value.graduation_date = item.graduation_date;
}

function showDeleteConfirmation(item) {
  console.log(item.value)
  if (item) {
    educationToDelete.value = item;
  } else if (currentEducation.value) {
    educationToDelete.value = educations.value.find(edu => edu.id === currentEducation.value) || null;
  }

  if (educationToDelete.value) {
    displayDelete.value = true;
  }
}



function deleteEducation() {
  educationServices.deleteEducation(studentId.value, educationToDelete.value.id)
    .then(() => {
      displayDelete.value = false;
      deleteError.value = false;
      getEducation();
    })
    .catch((error) => {
      console.log(error);
      deleteError.value = true;
    });
}

function saveChanges() {
  if (route.path.includes('/resumeBuilder/education/edit/')) {
    educationServices.updateEducation(studentId.value, currentEducation.value, formData.value)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        if (error.response != null && error.response.status == "406") {
          for (let obj in errors.value) {
            errors.value[obj] = '*'
          }
          for (let obj of error.response.data) {
            if (obj.attributeName === undefined) {
              obj.attributeName = "idNumber";
            }
            errors.value[obj.attributeName] = obj.message;
          }
        } else {
          console.log(error);
          console.log(error);
        }
      });
      editEntryVal.value = false;
    router.push('/resumeBuilder/education');
  } else {
    educationServices.createEducation(studentId.value, formData.value)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        if (error.response && error.response.status === 406) {
          message.value = "Error: " + error.code + ":" + error.message;
          console.log(error);
        } else {
          console.log(error);
        }
      });
  }
}

// Navigation methods
function goBack() {
  router.push('/resumeBuilder/contact-info');
}

function goNext() {
  router.push('/resumeBuilder/courses');
}

const getEducation = () => {
  educationServices.getAllEducations(studentId.value)
    .then((res) => {
      educations.value = res.data;
      if (!currentEducation.value) {
        editEntryVal.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
</script>

<style>
@import '@/assets/dark-mode.css';

.title-color {
  color: black;
}
</style>

<style scoped>
:deep(.text-field::placeholder) {
  color: gray;
}
</style>