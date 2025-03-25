<template>
  <v-card flat>
    <div class="title-row">

      <!-- Leaderboard title and search bar -->
      <h1 class="table-title">
        <img :src="LeaderboardIcon" alt="Leaderboard Icon" class="leaderboard-icon" />
        Leaderboard
      </h1>
      <v-text-field v-model="search" label="Search Students" variant="solo-filled" hide-details single-line
        density="compact" class="search-bar" clearable>
        <template v-slot:prepend-inner>
          <Icon icon="material-symbols:search-rounded" width="24" height="24" />
        </template>
      </v-text-field>
      <v-btn @click="toggleView" class="toggle-btn">
        {{ showNeighbors ? 'Show Top Students' : 'Check Ranking' }}
      </v-btn>
    </div>
    <!------------------------------------------>

    <!-- Data table (Rank, Full Name, Points)-->
    <v-data-table ref="dataTable" :headers="headers" :items="displayedStudents" :items-per-page="itemsPerPage"
      class="elevation-1" :loading="loading" v-model:page="page" v-model:search="search">
      <template v-slot:[`item.rank`]="{ item }">
        <span :class="{ 'highlight': isCurrentUser(item) }" class="rank">{{ item.rank }}</span>
      </template>
      <template v-slot:[`item.name`]="{ item }">
        <span :class="{ 'highlight': isCurrentUser(item) }">
          <img v-if="isCurrentUser(item)" :src="TrophyIcon" alt="Trophy Icon" class="user-trophy-icon" />
          {{ item.name }}
        </span>
      </template>
      <template v-slot:[`item.points`]="{ item }">
        <span :class="{ 'highlight': isCurrentUser(item) }">{{ item.points }}</span>
      </template>
    </v-data-table>
    <!------------------------------------------>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from "@iconify/vue";
import StudentServices from '@/services/resumeBuilderServices/studentServices.js';
import UserServices from '@/services/resumeBuilderServices/userServices.js';
import Utils from '@/config/utils';
import TrophyIcon from '@/assets/trophyIcon.png';
import LeaderboardIcon from '@/assets/leaderboardIcon.png';

const students = ref([]);
const loading = ref(false);
const showNeighbors = ref(false);
const currentUser = ref(null);
const studentId = ref(null);
const itemsPerPage = ref(10); // CHANGE THIS FOR TESTING BRANCH
const currentUserIndex = ref(-1);
const dataTable = ref(null);
const page = ref(1);
const search = ref('');

// Computed property to display students based on current viewing setting
const displayedStudents = computed(() => {
  return students.value;
});

const headers = [
  { align: 'start', key: 'rank', title: 'Rank', width: '50px' },
  { key: 'name', title: 'Full Name' },
  { key: 'points', title: 'Points' }
];

onMounted(() => {
  fetchStudents();
});

const fetchStudents = async () => {
  loading.value = true;
  try {
    // Fetch current user data
    currentUser.value = Utils.getStore("user");
    const currentUserRes = await UserServices.getAllStudentUsers(currentUser.value.userId);
    studentId.value = currentUserRes.data[0].id;

    const userRes = await UserServices.getAllUsers();
    const users = userRes.data || [];

    // Filter out users without a studentId
    const studentUsers = users.filter(user => user.studentId);

    const studentPromises = studentUsers.map(user => StudentServices.getStudent(user.studentId));
    const studentResponses = await Promise.all(studentPromises);
    const studentData = studentResponses.map((response) => {
      const student = response.data;
      const user = studentUsers.find(u => u.studentId === student.id);
      return {
        name: user ? `${user.fName} ${user.lName}` : "Unknown OC Student",
        points: student.total_points,
        studentId: student.id
      };
    });

    // Sort students by points (descending)
    studentData.sort((a, b) => b.points - a.points);

    // Update rank after sorting with tie handling
    let currentRank = 1;
    let previousPoints = null;

    students.value = studentData.map((student, index) => {
      if (previousPoints !== null && previousPoints !== student.points) {
        // If points are different from previous student, update rank to current position
        currentRank = index + 1;
      }

      // Store current points for next iteration
      previousPoints = student.points;

      return {
        ...student,
        rank: currentRank
      };
    });

    // Find the current user's index in the sorted array
    currentUserIndex.value = students.value.findIndex(student =>
      student.studentId === studentId.value
    );

  } catch (err) {
    console.error("Error fetching students:", err);
  } finally {
    loading.value = false;
  }
};

const toggleView = () => {
  showNeighbors.value = !showNeighbors.value;

  if (showNeighbors.value && currentUserIndex.value !== -1) {
    // Calculate which page the current user is on
    const targetPage = Math.ceil((currentUserIndex.value + 1) / itemsPerPage.value);

    // Set the page directly
    page.value = targetPage;

    // Add a small delay to ensure the DOM updates
    setTimeout(() => {
      // Find the user's element and scroll to it if needed
      const userElement = document.querySelector('.highlight');
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  } else {
    // Return to the first page when showing top students
    page.value = 1;
  }
};

const isCurrentUser = (item) => {
  return item.studentId === studentId.value;
};
</script>

<style scoped>
/* Leaderboard title & search bar section ---------------------------*/
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  flex-wrap: nowrap;
  user-select: none;
}

.table-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  user-select: none;
}

.leaderboard-icon {
  width: 29px;
  height: 29px;
  margin-right: 1px;
  vertical-align: middle;
}

.search-bar {
  width: 250px;
  min-width: 180px;
  flex-shrink: 1;
  padding-left: 2px;
}

.toggle-btn {
  margin-left: 8px;
  background-color: #5EC4B6;
  color: white;
  font-weight: 550;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.3, transform 0.5s;
}

.toggle-btn:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

/* Data table section ----------------------------------------------------*/
.v-data-table {
  margin: 0 16px 16px 16px;
  user-select: none;
  width: 98%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.rank {
  display: inline-block;
  width: 30px;
  text-align: center;
}

/* Effects for current user's data in table -------------------------------*/
.user-trophy-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
}

.highlight {
  font-weight: bold;
  color: #811429;
  text-shadow: 0 0 5px rgba(228, 228, 228, 0.5);
  transition: transform 0.2s;
}
</style>