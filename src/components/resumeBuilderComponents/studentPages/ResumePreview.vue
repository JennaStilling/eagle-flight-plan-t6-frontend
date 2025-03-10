<template>
  <div class="resume-preview" :class="statusClass" @click="handleClick" @mouseover="handleMouseover"
    @mouseleave="handleMouseleave">
    <div class="resume-icon">

      <img :src="resume.image" :style="{ width: '120px', height: 'auto' }">
    </div>

    <h3>{{ resume.name }}</h3>

    <!-- Hover overlay -->
    <div class="hover-overlay" v-if="showActions">
      <v-btn icon color="primary" @click="handleEdit">
        <Icon icon="material-symbols:edit-outline" width="24" height="24"/>
      </v-btn>
      <v-btn icon color="error" @click="handleDelete">
        <Icon icon="material-symbols:delete-outline" width="24" height="24" />
      </v-btn>
    </div>

    <div v-if="displayDelete" class="modal">
      <div class="modal-content" @click.stop>
        <span @click="displayDelete = false" class="close">&times;</span>
        <div class="modal-header">
          <p style="font-weight: bold;">This action is permanent.</p>
          <hr />
          <p v-if="!deleteError">
            Are you sure you want to delete <br />
            {{ props.resume.name }}?
          </p>
          <p v-if="deleteError">
            Error deleting<br />
            {{ resumeToDelete.name }}.
          </p>
        </div>

        <br />
        <div class="modal-body">
          <v-btn v-if="!deleteError" @click="displayDelete = false" color="#708E9A">Close</v-btn>
          <v-btn v-if="!deleteError" @click="deleteResume()" color="#F04E3E" class="me-2">Delete</v-btn>
          <v-btn v-if="deleteError" @click="() => { event.stopPropagation(); deleteError = false; displayDelete = false; }"
            class="modal-button">
            Close
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Utils from '@/config/utils.js';
import ResumeServices from "@/services/resumeBuilderServices/resumeServices";
import resumeReviewServices from "@/services/resumeBuilderServices/resumeReviewServices";
import { Icon } from "@iconify/vue";

const props = defineProps({
  resume: Object,
  review: Object,
});

const statusClass = computed(() => {
  if (props.review != null) {
    if (props.review.status === "reviewed") {
      return "border-reviewed";
    }
    else {
      return "border-created"
    }
  }
  else {
    return "border-created";
  }
});

const emit = defineEmits(['edit', 'delete']);
const user = Utils.getStore("user");
const studentId = ref();
const showActions = ref(false);
const resumes = ref([]);
const resumeToDelete = ref(null);
const displayDelete = ref(false);
const deleting = ref(false);
const deleteError = ref(false);

onMounted(() => {
  Utils.getUser(user).then(value => {
    studentId.value = value.studentId;
    getResumes();
  });
});

const getResumes = () => {
  ResumeServices.getAllResumes(studentId.value)
    .then((response) => {
      resumes.value = response.data;
    })
    .catch((error) => {
      console.log("Could not retrieve resumes: " + error);
    })
};

const handleMouseover = () => {
  showActions.value = true;
};

const handleMouseleave = () => {
  showActions.value = false;
};

const handleClick = () => {
  console.log(`Clicked on resume ${props.resume.name}`);
  emit('edit', props.resume.id);
};

const handleEdit = () => {
  event.stopPropagation();
  emit('edit', props.resume.id);
};

const handleDelete = async () => {
  event.stopPropagation();
  resumeToDelete.value = props.resume.value;
  displayDelete.value = true;
};

const closeModal = () => {
  displayDelete.value = false;
};

const deleteResume = async () => {
  try {
    await ResumeServices.deleteResume(studentId.value, props.resume.id);
    if (props.resume.resumeReviewId != null) {
      await resumeReviewServices.deleteResumeReview(studentId.value, props.resume.resumeReviewId);
    }
    emit('delete', props.resume.id);
    window.location.reload();
  } catch (error) {
    console.error('Error deleting resume:', error);
    deleteError.value = true;
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.resume-preview {
  width: 222px;
  /* Set width to resemble a piece of paper */
  height: 298px;
  /* Set height */
  border: 2px dashed #1A9BCB;
  /* Dashed border */
  padding: 10px;
  /* Padding inside the box */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  /* Subtle shadow */
  margin-bottom: 10px;
  /* Space below the shortcut area */
  border-radius: 20px;
  cursor: pointer;
}

.border-reviewed {
  border: 2px solid green;
}

.border-created {
  border: 2px dashed #1A9BCB;
}

.resume-preview:hover {
  background-color: #118ACB;
}

.hover-overlay {
  position: relative;
  top: 20px;
  bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 20%;
  z-index: 1000;
}

.hover-overlay button {
  font-size: 18px !important;
}

.resume-icon {
  display: flex;
  justify-content: center;
  /* Space between dropdown and buttons */
  gap: 30px;
  margin-bottom: 10px;
  /* Space below the shortcuts */
  margin-top: 10px;
  position: relative;
  color: white;
}

.pdf-container {
  width: 140px;
  height: 160px;
  border: 1px solid #ccc;
}

.white-rectangle {
  width: 120px;
  background-color: white;
  position: absolute;
  top: 100%;
  height: 150px;
}

.h3 {
  padding-top: 550px;
  position: absolute;
  color: black;
}

h3 {
  text-align: center;
  color: black;
}
</style>

<style scoped>
.icon {
  font-size: inherit;
}
</style>
