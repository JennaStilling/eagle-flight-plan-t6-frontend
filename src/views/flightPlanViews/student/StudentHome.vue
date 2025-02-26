<template>
  <div class="modified-width">
    <!-- <p>Student home page</p>
    <p> Current role: {{ homeStore.getCurrentRole }}</p>
    <p> Current home page: {{ homeStore.getHomePage }}</p> -->
    <div class="semester-navigation">
      <button @click="getPreviousSemester">
        <img src="@/assets/navigation/left-arrow2.png" alt="Previous Semester" />
      </button>
      <h1>{{ currentSemester }}</h1>
      <button @click="getNextSemester">
        <img src="@/assets/navigation/left-arrow2.png" alt="Next Semester" class="right-arrow" />
      </button>
    </div>
    <div class="data-table-container">
      <table class="data-table">
        <tbody>
          <!-- Data rows  -->
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useHomePageStore } from '@/store/homePageStore';
import { onMounted, ref } from 'vue';
import semesterServices from '@/services/flightPlanServices/semesterServices';

const homeStore = useHomePageStore();
const currentSemester = ref('Loading...');
const semesters = ref([]);
const currentIndex = ref(0);

onMounted(async () => {
  try {
    const response = await semesterServices.getAllSemesters();
    if (response.data && response.data.length > 0) {
      semesters.value = response.data;
      const now = new Date();
      const futureSemesterIndex = semesters.value.findIndex(semester => new Date(semester.end_date) > now);
      if (futureSemesterIndex !== -1) {
        currentIndex.value = futureSemesterIndex;
        currentSemester.value = semesters.value[currentIndex.value].name;
      } else {
        currentSemester.value = 'No future semester data available';
      }
    } else {
      currentSemester.value = 'No semester data available';
    }
  } catch (error) {
    currentSemester.value = 'Error fetching semester data';
    console.error(error);
  }
});

const getPreviousSemester = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    currentSemester.value = semesters.value[currentIndex.value].name;
  }
};

const getNextSemester = () => {
  if (currentIndex.value < semesters.value.length - 1) {
    currentIndex.value++;
    currentSemester.value = semesters.value[currentIndex.value].name;
  }
};
</script>

<style scoped>
.modified-width {
  height: 100vh;
  margin: 0 auto;
  padding-top: 15px;
}

.semester-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #811429;
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 10px;
  position: relative;
  width: 50%;
  margin-top: 2%;
  margin-left: 2%;
}

.semester-navigation button {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  margin-top: 1%;
  margin-left: 2%;
  margin-right: 2%;
}

.semester-navigation img {
  width: 2.6rem;
  height: 2.6rem;
}

.semester-navigation .right-arrow {
  transform: scaleX(-1);
}

.semester-navigation h1 {
  margin: 0;
  color: white;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.7rem;
}

.data-table-container {
  width: 50%;
  margin-left: 2%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.data-table th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>