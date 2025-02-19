<template>
  <div class="container">
    <div class="sidebar">
      <div class="list scrollable">
        <!-- CERTIFICATION LIST ON LEFT SIDE -->
        <div class="list-title title-color" @click="toggleDropdown">
          Certification List {{ showDropdown ? '▲' : '▼' }}
        </div>
        <br>
        <div v-if="showDropdown" class="dropdown">
          <ul>
            <li v-for="(item, index) in certifications" :key="index" class="dropdown-item">
              <!-- Display each certification's name -->
              <span class="certification-name name">{{ item.name }}</span>
              <div class="icon-buttons">
                <!-- Edit icon for entry -->
                <img src="@/assets/list-elements/edit-list-item.png" alt="Edit" class="icon"
                  @click.stop="editEntry(item)" />
                <!-- Delete icon for entry -->
                <img src="@/assets/list-elements/delete-list-item.png" alt="Delete" class="icon"
                  @click.stop="showDeleteConfirmation(item)" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main form for entering certification details -->
    <div class="main-content">
      <div class="form">
        <!-- Certification name input field -->
        <div class="text-field-with-title">
          <label for="name" class="field-label">CERTIFICATION NAME <span class="mandatory">*</span></label>
          <input type="text" id="name" v-model="formData.name" class="text-field" placeholder="Enter certification name"
            required />
        </div>

        <!-- Company input field -->
        <div class="text-field-with-title">
          <label for="company" class="field-label">COMPANY <span class="mandatory">*</span></label>
          <input type="text" id="company" v-model="formData.company" class="text-field" placeholder="Enter company"
            required />
        </div>

        <!-- Date acquired input field -->
        <div class="text-field-with-title">
          <label for="date_acquired" class="field-label">DATE ACQUIRED <span class="mandatory">*</span></label>
          <input type="date" id="date_acquired" v-model="formData.date_acquired" class="text-field" required />
        </div>
      </div>

      <div class="form-buttons">
        <!-- Delete changes button -->
        <div v-if="editEntryVal && currentCertification" class="delete-button"
          @click="showDeleteConfirmation(formData)">
          <div class="delete-button-child"></div>
          <b class="delete-changes">DELETE</b>
        </div>
        <div v-else>
        </div>

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
        <p v-if="!deleteError">
          Are you sure you want to delete <br />
          {{ certificationToDelete.name }}?
        </p>
        <p v-if="deleteError">
          Error deleting<br />
          {{ certificationToDelete.name }}.
        </p>
      </div>

      <br />
      <div class="modal-body">
        <button v-if="!deleteError" @click="displayDelete = false" class="modal-button">
          CANCEL
        </button>
        <button v-if="!deleteError" class="error modal-button" @click="deleteCertification()">
          DELETE
        </button>
        <button v-if="deleteError" @click="() => { deleteError = false; displayDelete = false; }" class="modal-button">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import certificationServices from "@/services/resumeBuilderServices/certificationServices.js";
import Utils from "@/config/utils.js";

const router = useRouter();
const route = useRoute();

const user = Utils.getStore("user");
const studentId = ref();
const certifications = ref(null);

const errors = ref({});
const editEntryVal = ref(false);

onMounted(() => {
  Utils.getUser(user).then(value => {
    studentId.value = value.studentId;
    getCertification();
  });
});

const showDropdown = ref(true);
const formData = ref({
  name: '',
  company: '',
  date_acquired: '',
});

function clearFormData() {
  formData.value = {
    name: '',
    company: '',
    date_acquired: '',
  };
}

const currentCertification = ref(null);
const displayDelete = ref(false);
const deleteError = ref(false);
const certificationToDelete = ref(null);
const message = ref('');

const buttonLabel = computed(() => {
  return route.path.includes('/resumeBuilder/certifications/edit/') ? 'SAVE CHANGES' : 'ADD TO LIST';
});


function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function editEntry(item) {
  router.push({ path: `/resumeBuilder/certifications/edit/` });
  editEntryVal.value = true;
  currentCertification.value = item.id;
  formData.value.name = item.name;
  formData.value.company = item.company;
  formData.value.date_acquired = item.date_acquired;
}

function showDeleteConfirmation(item) {
  console.log("Id" + item.id)
  if (item != undefined && item.id != undefined) {
    certificationToDelete.value = item;
    console.log(certificationToDelete.value)
  } else if (currentCertification.value) {
    certificationToDelete.value = certifications.value.find(cert => cert.id === currentCertification.value) || null;
    console.log("ran this")
    console.log(certificationToDelete.value)
  }

  if (certificationToDelete.value) {
    displayDelete.value = true;
  }
}

function deleteCertification() {
  certificationServices.deleteCertification(studentId.value, certificationToDelete.value.id)
    .then(() => {
      displayDelete.value = false;
      deleteError.value = false;
      clearFormData();
      getCertification();
    })
    .catch((error) => {
      console.log(error);
      deleteError.value = true;
    });
}

function saveChanges() {
  if (route.path.includes('/resumeBuilder/certifications/edit/')) {
    certificationServices.updateCertification(studentId.value, currentCertification.value, formData.value)
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
    router.push('/resumeBuilder/certifications');
  }
  else {
    certificationServices.createCertification(studentId.value, formData.value)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        if (error.response != null && error.response.status == "406") {
          message.value = "Error: " + error.code + ":" + error.message;
          console.log(error);
        }
        else {
          console.log(error);
        }
      });
  }
}

// Navigation methods
function goBack() {
  router.push('/resumeBuilder/experience');
}

function goNext() {
  router.push('/resumeBuilder/skills');
}

const getCertification = () => {
  certificationServices.getAllCertifications(studentId.value)
    .then((res) => {
      certifications.value = res.data;
      editEntryVal.value = false;
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