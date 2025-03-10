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
        <br />
        <div class="list-title title-color" @click="toggleDropdownCourses">
          Courses List
        </div>
        <div class="list scrollable">
          <div v-if="showDropdownCourses" class="dropdown">
            <ul>
              <li v-for="(course, index) in courses" :key="index" class="dropdown-item">
                <span class="course-name name">{{ course.name }}</span>
                <div class="icon-buttons">
                  <img src="@/assets/list-elements/edit-list-item.png" alt="Edit" class="icon"
                    @click.stop="editCourse(course)" />
                  <img src="@/assets/list-elements/delete-list-item.png" alt="Delete" class="icon"
                    @click.stop="showDeleteCourseConfirmation(course)" />
                </div>
              </li>
              <div v-if="courses.length > 0">
                <button @click="addCourse" class="add-button">+</button>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Main form for entering education details -->
    <div class="main-content">
      <div class="form">
        <!-- Education label -->
        <div class="text-field-with-title">
          <label class="field-label">
            {{ route.path.includes('/courses/select') && currentEducation? 'SELECTED EDUCATION' : 'EDIT EDUCATION TO ADD COURSES' }} <br>
          </label>
          <p class = "title-text" v-if = "route.path.includes('/courses/select') && currentEducation">{{ currentEducation.institution }}</p>
        </div>

        <!-- IF EDUCATION IS SELECTED SHOW THIS -->
        <div v-if="formData.institution">
          <div class="text-field-boring" readonly>
            {{ formData.degree && formData.institution ? `${formData.degree}, ${formData.institution}` : '' }}
            <br><br>
          </div>
          <div class="text-field-with-title">
            <label class="field-label">NAME</label>
            <input v-model="formData.name" class="text-field" type="text" placeholder="Enter course name" />
          </div>
          <div class="text-field-with-title">
            <label class="field-label">GRADE LETTER</label>
            <input v-model="formData.grade" class="text-field" type="text"
              placeholder="Enter grade (A, B, C, D, F, P*)" />
          </div>

          <div class="form-buttons">
           <!-- Delete changes button -->
          <div v-if="editEntryVal && currentCourse" class="delete-button" @click="showDeleteConfirmation(formData)">
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

        <!-- ELSE IF EDUCATION IS NOT SELECTED SHOW THIS -->
        <div v-else>
          <br><br><br><br><br><br>
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
            {{ courseToDelete ? courseToDelete.name : educationToDelete.institution }}?
          </p>
          <p v-if="deleteError">
            Error deleting<br />
            {{ courseToDelete ? courseToDelete.name : educationToDelete.institution }}.
          </p>
        </div>

        <br />
        <div class="modal-body">
          <button v-if="!deleteError" @click="displayDelete = false" class="modal-button">
            CANCEL
          </button>
          <button v-if="!deleteError" class="error modal-button"
            @click="courseToDelete ? deleteCourse() : deleteEducation()">
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
import courseServices from "@/services/resumeBuilderServices/courseServices.js";
import Utils from "@/config/utils.js";

const router = useRouter();
const route = useRoute();

const user = Utils.getStore("user");
const studentId = ref();
const educations = ref(null);
const courses = ref([]);

const errors = ref({});
const editEntryVal = ref(false);

onMounted(() => {
  Utils.getUser(user).then(value => {
    studentId.value = value.studentId;
    getEducation();
    if (route.path.includes('/resumeBuilder/courses/select/')) {
      getCourses();
    }
  });
});

const showDropdown = ref(true);
const showDropdownCourses = ref(true);
const formData = ref({
  degree: '',
  institution: '',
  gpa: '',
  graduation_date: '',
  name: '',
  grade: ''
});

function clearFormData() {
  formData.value = {
    name: '',
    grade: '',
  };
}

const currentEducation = ref(null);
const currentCourse = ref(null);
const displayDelete = ref(false);
const deleteError = ref(false);
const educationToDelete = ref(null);
const message = ref('');

const buttonLabel = computed(() => {
  return route.path.includes('/resumeBuilder/courses/select/edit') ? 'SAVE CHANGES' : 'ADD TO LIST';
});

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function toggleDropdownCourses() {
  showDropdownCourses.value = !showDropdownCourses.value;
}

function editEntry(item) {
  router.push({ path: `/resumeBuilder/courses/select/` });
  currentEducation.value = item.id;
  formData.value.degree = item.degree;
  formData.value.institution = item.institution;
  formData.value.gpa = item.gpa;
  formData.value.graduation_date = item.graduation_date;
  getCourses();
}

function editCourse(course) {
  router.push({ path: '/resumeBuilder/courses/select/edit', query: { id: course.id } });
  editEntryVal.value = true;
  currentCourse.value = course.id;
  formData.value.name = course.name;
  formData.value.grade = course.grade;
}

function addCourse() {
  router.push('/resumeBuilder/courses/select');
  formData.value.name = '';
  formData.value.grade = '';
}

const courseToDelete = ref(null);

function showDeleteCourseConfirmation(course) {
  courseToDelete.value = course;
  displayDelete.value = true;
}


function showDeleteConfirmation(item) {
  console.log(item.id)
  if (item != undefined && item.id != undefined) {
    courseToDelete.value = item;
    console.log(courseToDelete.value)
  } else if (currentCourse.value) {
    courseToDelete.value = courses.value.find(course => course.id === currentCourse.value) || null;
    console.log("ran this")
  }

  if (courseToDelete.value) {
    displayDelete.value = true;
  }
}

function deleteCourse() {
  if (courseToDelete.value) {
    courseServices.deleteCourse(studentId.value, currentEducation.value, courseToDelete.value.id)
      .then(() => {
        displayDelete.value = false;
        deleteError.value = false;
        clearFormData();
        getCourses(); // Refresh the courses list
      })
      .catch((error) => {
        console.log(error);
        deleteError.value = true;
      });
  }
}

function deleteEducation() {
  educationServices.deleteEducation(studentId.value, educationToDelete.value.id)
    .then(() => {
      displayDelete.value = false;
      deleteError.value = false;
      clearFormData();
      getEducation();
    })
    .catch((error) => {
      console.log(error);
      deleteError.value = true;
    });
}

function saveChanges() {
  if (route.path.includes('/resumeBuilder/courses/select/edit')) {
    // Update existing course
    const courseId = route.query.id;
    courseServices.updateCourse(studentId.value, currentEducation.value, courseId, formData.value)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    // Create new course
    courseServices.createCourse(studentId.value, currentEducation.value, formData.value)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

function getCourses() {
  if (currentEducation.value) {
    courseServices.getAllCourses(studentId.value, currentEducation.value)
      .then((res) => {
        courses.value = res.data;
        editEntryVal.value = false;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

// Navigation methods
function goBack() {
  router.push('/resumeBuilder/education');
}

function goNext() {
  router.push('/resumeBuilder/experience');
}

const getEducation = () => {
  educationServices.getAllEducations(studentId.value)
    .then((res) => {
      educations.value = res.data;
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

.title-text {
  color: black;
}

.text-field-with-title .title-text {
  color: black !important;
}
</style>