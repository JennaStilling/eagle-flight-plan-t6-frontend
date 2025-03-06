<template>
  <div class="container">
    <div class="left-side">
       <!-- Semesters -->
      <div class="semester-navigation">
        <button @click="getPreviousSemester">
          <img :src="BackArrow"  alt="Previous Semester" />
        </button>
        <h1>{{ currentSemester }}</h1>
        <button @click="getNextSemester">
          <img :src="ForwardArrow" alt="Next Semester" />
        </button>
      </div>
       <!-- Tasks -->
      <div class="task-data-table-container">
        <table class="task-data-table">
          <tbody>

          </tbody>
        </table>
      </div>
    </div>
    <div class="right-side">
       <!-- Shop Card -->
      <div class="shop-card" @click="goToShop">
        <img src="@/assets/navigation/shoppingCart.png" alt="Shopping Cart" class="shopping-cart-icon" />
        <div class="shop-info">
          <h1>Shop</h1>
          <p>You have <strong style="color: #811429; font-weight: 700;">37</strong> points</p>
        </div>
      </div>
       <!-- Events under Shop -->
      <div class="events-navigation">
        <h1>Upcoming Events</h1>
      </div>
      <div class="event-data-table-container"> 
        <table class="event-data-table">
          <tbody>
            <template v-for="event in limitedEvents" :key="event.id">
              <tr @click="openModal(event)" class="clickable-row">
                <td class="date">
                  <div class="month">{{ new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toLocaleUpperCase() }}</div>
                  <div class="day">{{ new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' }) }}</div>
                </td>
                <td style="user-select: none;">
                    {{ new Date(event.start_date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).replace('AM', 'am').replace('PM', 'pm') }} - {{ new Date(event.end_date_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).replace('AM', 'am').replace('PM', 'pm') }}
                  <br>
                    <span style="font-size: 30px; font-weight: 100; user-select: none;">{{ event.name }}</span>
                </td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3"><hr class="event-line"></td>
              </tr>
            </template>
          </tbody>   
        </table>
        <p class="view-more" @click.self="viewMoreEvents">View More 🡺</p>
      </div>
    </div>
  </div>
 <!-- Event Modal -->
  <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span @click="closeModal" class="close" style="font-size: 2rem;">&times;</span>
      <h2>{{ selectedEvent.name }}</h2>
      <div style="font-size: 20px;">{{ selectedEvent.description }}</div>
      <div style="margin-top: 15px;">Earn <span style="font-weight:bold;">{{ selectedEvent.point_value }}</span> points</div>
      <div style="margin-top: 15px;">{{ selectedEvent.location }}</div>
      <div style="margin-bottom: 15px;">
        {{ new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) }}
      </div>
      <div style="margin-bottom: 15px;"> 
        {{ new Date(selectedEvent.start_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }} - 
        {{ new Date(selectedEvent.end_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }}
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue Files
import { useHomePageStore } from '@/store/homePageStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Utils from "@/config/utils";
// Image Files
import BackArrow from '@/assets/ArrowBackwardIcon.svg';
import ForwardArrow from '@/assets/ArrowForwardIcon.svg';
// Service Files
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import studentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import studentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import taskServices from "@/services/flightPlanServices/taskServices";
import studentServices from "@/services/resumeBuilderServices/studentServices";
import eventServices from "@/services/flightPlanServices/eventServices";
import semesterServices from '@/services/flightPlanServices/semesterServices';
import flightPlanTaskServices from '@/services/flightPlanServices/flightPlanTaskServices';
import flightPlanServices from '@/services/flightPlanServices/flightPlanServices';

// CONSTS
const homeStore = useHomePageStore();
const router = useRouter();
// user consts
const user = ref(null);
const studentId = ref([]);
// semester & event consts
const currentDate = ref([]);
const semesters = ref([]);
const currentSemester = ref('Loading...');
const currentIndex = ref(0);
const events = ref([]);
const limitedEvents = ref([]);
const modalVisible = ref(false);
const selectedEvent = ref({});

onMounted(async () => {
  try {
    user.value = Utils.getStore("user");
    const userRes = await UserServices.getAllStudentUsers(user.value.userId);
    studentId.value = userRes.data[0].id;
    currentDate.value = new Date().toJSON().slice(0, 24);
    console.log("Student ID is: " + studentId.value);
  } catch (error) {
    console.error('Error fetching student ID: ', error);
  }

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

  try {
    const eventResponse = await eventServices.getAllSystemEvents();
    if (eventResponse.data) {
      events.value = eventResponse.data.filter(event => new Date(event.date) >= new Date(currentDate.value));
      events.value.sort((a, b) => new Date(a.date) - new Date(b.date));
      limitedEvents.value = events.value.slice(0, 3);
      console.log("events");
      console.log(events.value);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
});

// METHODS

// modals --------------------
const openModal = (event) => {
  selectedEvent.value = event;
  modalVisible.value = true;
};
const closeModal = () => {
  modalVisible.value = false;
};

// exit homepage with router ---
const goToShop = () => {
  router.push({ name: 'shop' });
};
const viewMoreEvents = () => {
  router.push({ name: 'events' });
};

// semester navigation ----------------------------------------------
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
/* MAIN LAYOUT ----------------------*/
.container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
}
.left-side, .right-side {
  width: 50%;
  padding: 17px;
}
.left-side {
  margin-left: 2%;
}

/* SEMESTER NAVIGATION --------------*/
.semester-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  color: #FAFAFA;
  border-radius: 20px 20px 0 0;
  padding: 9px;
  position: relative;
  width: 95%;
  margin-top: 2%;
}
.semester-navigation button {
  background-color: #D9D9D9;
  border: none;
  cursor: pointer;
  margin-left: 6%;
  margin-right: 6%;
  margin-top: 1%;
  user-select: none;
}
.semester-navigation img {
  width: 2.6rem;
  height: 2.6rem;
}
.semester-navigation h1 {
  margin: 0;
  color: black;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.7rem;
  user-select: none;
}

/* SHOP CARD ---------------------------*/
.shop-card {
  display: flex;
  align-items: center;
  background-color: #FAFAFA;
  color: black;
  border-radius: 16px;
  padding: 27px;
  width: 95%;
  height: 20%;
  margin: 2% 0 4%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, background-color 0.3s ease, border 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}
.shop-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border: 4px solid #811429;
}
/* - Icons and Info */
.shop-card .shopping-cart-icon {
  width: 67px;
  height: 67px;
  margin-right: 20px;
}
.shop-card .shop-info {
  display: flex;
  flex-direction: column;
}
.shop-info p {
  font-size: 1.5rem;
}

/* Data Tables ----------------------------------*/
.event-data-table-container, .task-data-table-container {
  width: 95%;
  background-color: #FAFAFA;
  border: 1px solid #FAFAFA;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}
.task-data-table-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}
.event-data-table, .task-data-table {
  width: 100%;
  border-collapse: collapse;
  color: black;
}
.event-data-table td {
  padding: 3px;
  font-size: 16px;
}
.task-data-table tbody {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* EVENT INFO --------------------------*/

/*- Events Navigation */
.events-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: white;
  color: black;
  border-radius: 20px 20px 0 0;
  padding: 18px;
  position: relative;
  width: 95%;
  margin-top: 4%;
}
.events-navigation h1 {
  margin: 0;
  color: black;
  font-size: 1.7rem;
  user-select: none;
}
/* - Date and Time */
.date {
  display: flex;
  flex-direction: column;
  margin-top: 2%;
  font-size: 24px;
}
.month {
  font-size: 16px; 
  text-align: center;
}
.day {
  font-size: 30px;
  text-align: center;
  font-weight: 650;
}
.time {
  text-align: left;
  user-select: none;
}
.event-name {
  font-size: 24px;
  text-align: left;
  user-select: none;
}
/* - Divider */
.event-line {
  border: none;
  border-top: 1.1px solid black;
  width: 95%;
  padding: 10;
  margin: 0 auto;
}
.clickable-row:hover {
  cursor: pointer;
  backdrop-filter: brightness(97%);
}
.view-more {
  font-size: 23px;
  color: black;
  font-weight: 700;
  text-align: right;
  padding-right: 2%;
  margin: 2% 0;
  cursor: pointer;
  user-select: none;
}

/* - Events Modal---------------------------*/
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  min-width: 400px;
  min-height: 100px; 
  border-radius: 10px;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: auto;
}
</style>