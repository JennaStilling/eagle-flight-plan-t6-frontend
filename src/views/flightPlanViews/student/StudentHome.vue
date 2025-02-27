<template>
  <div class="container">
    <div class="left-side">
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
            <br><br><br><br><br><br><br><br>
            <br><br><br><br><br><br><br><br>
            <br><br>
          </tbody>
        </table>
      </div>
    </div>
    <div class="right-side">
      <div class = "shop-card">
        <img src="@/assets/navigation/shoppingCart.png" alt="Shopping Cart" class="shopping-cart-icon" />
        <div class="shop-info">
          <h1>Shop</h1>
            <p>You have <strong style="color: #811429; font-weight: 700;">37</strong> points</p>
        </div>
      </div>
      <div class="events-navigation">
        <h1>Upcoming Events</h1>
      </div>
      <div class="data-table-container">
        <table class="data-table">
          <tbody>
            <br><br><br><br><br><br><br><br><br><br>
          </tbody>
        </table>
      </div>
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
.container {
  display: flex;
  height: 100vh;
  background-color: #bed6e7;
}

.left-side, .right-side {
  width: 50%;
  padding: 17px;
}

.left-side {
  margin-left: 2%;
}

.semester-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #811429;
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 9px;
  position: relative;
  width: 95%;
  margin-top: 2%;
}

.shop-card {
  display: flex;
  align-items: center;
  background-color: white;
  color: black;
  border-radius: 16px;
  padding: 27px;
  position: relative;
  width: 95%;
  height: 20%;
  margin-top: 2%;
  margin-bottom: 4%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, background-color 0.3s ease, border 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.shop-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border: 4px solid #811429;
}

.shop-card .shopping-cart-icon {
  width: 67px;
  height: 67px;
  margin-right: 20px;
}

.shop-card .shop-info {
  display: flex;
  flex-direction: column;
}

.shop-info p{
  font-size: 1.5rem;  
}

.events-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #811429;
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 18px;
  position: relative;
  width: 95%;
  margin-top: 2%;
}

.semester-navigation button, .events-navigation button {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  margin-left: 6%;
  margin-right: 6%;
  margin-top:1%;
}

.semester-navigation img, .events-navigation img {
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

.events-navigation h1 {
  margin: 4;
  color: white;
  font-size: 1.7rem;
}

.data-table-container {
  width: 95%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

.data-table {
  width: 95%;
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

.progress-section {
  margin-top: 10px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #C5DCEC;
  border-radius: 5px;
}

.progress {
  height: 10px;
  background: #8CB9D6;
  border-radius: 5px;
}
</style>