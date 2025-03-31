<template>
  <div class="user-menu">
    <div :class="['sidebar', { collapsed: menuOpen }]">
      <img :src="menuOpen ? menuIcon : closeIcon" alt="menu" class="toggle-btn" @click="toggleMenu"
        @keydown.enter="toggleNotification" role="button" tabindex="0" aria-haspopup="true"
        :aria-expanded="homeMenuOpen" style="width: 39px; height: 39px;" />

      <div v-if="!menuOpen" class="menu">
        <br>
        <ul>
          <!-- Admin Pages ---------------------------------------------------------------------------------->
          <template v-if="isAdminViewActive">
            <li @click="toggleRoleDropdown">Persons
              <Icon :icon="roleDropdown ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
                class="dropdown-arrow" />
              <div v-if="roleDropdown" class="dropdown-menu" @click.stop>
                <li>Students</li>
                <li>Student Workers</li>
                <li>Professors</li>
                <li>Admins</li>
              </div>
            </li>
            <li @click="toggleMaintenanceDropdown">Maintenance
              <Icon :icon="maintenanceDropdown ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
                class="dropdown-arrow" />
                <div v-if="maintenanceDropdown" class="dropdown-menu" @click.stop>
                <li v-if="hasUserPermission"><router-link :to="{ name: 'userMaintenance' }" @click="closeSidebar">Users</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'event' }" @click="closeSidebar">Events</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'task' }" @click="closeSidebar">Tasks</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'experience' }" @click="closeSidebar">Experiences</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'flightPlan' }" @click="closeSidebar">Flight Plans</router-link></li>
                <li v-if="hasShopPermission"><router-link :to="{ name: 'award' }" @click="closeSidebar">Shop Items</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'badge' }" @click="closeSidebar">Badges</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'cliftonStrength' }" @click="closeSidebar">Clifton Strengths</router-link></li>
                <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'lifeAfterTheNest' }" @click="closeSidebar">Life After the Nest</router-link></li>
                <li v-if="hasShopPermission"><router-link :to="{ name: 'transactionLog' }" @click="closeSidebar">Transaction History</router-link></li>
              </div>
            </li>
            <!-- Other Admin Pages -->
            <template v-if="isAdminViewActive">
              <li><router-link :to="{ name: 'adminHomeFP' }" @click="closeSidebar">Home</router-link></li>
              <li><router-link :to="{ name: 'adminHome' }" @click="closeSidebar">Resume Builder</router-link></li>
            </template>
          </template>

          <!-- Student Pages -------------------------------------------------------------------------------------------------->
          <template v-else-if="isStudentViewActive">
            <li><router-link :to="{ name: 'studentHomeFP' }" @click="closeSidebar">Home</router-link></li>
            <li><router-link :to="{ name: 'profile' }" @click="closeSidebar">Profile</router-link></li>
            <li><router-link :to="{ name: 'student-events' }" @click="closeSidebar">Events</router-link></li>
            <li><router-link :to="{ name: 'shop' }" @click="closeSidebar">Shop</router-link></li>
            <li><router-link :to="{ name: 'leaderboard' }" @click="closeSidebar">Leaderboard</router-link></li>
            <li><router-link :to="{ name: 'student-transactions' }" @click="closeSidebar">Spending History</router-link></li>
            <li><router-link :to="{ name: 'student-lifeAfterTheNest' }" @click="closeSidebar">Life After the Nest</router-link></li>
            <li><router-link :to="{ name: 'studentHome' }" @click="closeSidebar">Resume Builder</router-link></li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import menuIcon from '@/assets/menuIcon.svg';
import closeIcon from '@/assets/closeIcon.svg';
import dropDownArrow from '@/assets/arrowDropdown.svg';
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Utils from "@/config/utils";
import { useRouter, useRoute } from "vue-router";
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import userRoleServices from '@/services/resumeBuilderServices/userRoleServices';
import userRolePermissionServices from '@/services/flightPlanServices/userRolePermissionServices';
import { Icon } from '@iconify/vue';
import permissionServices from '@/services/flightPlanServices/permissionServices';

const user = ref(null);
const initials = ref("");
const name = ref("");
const menuOpen = ref(true);

const roleDropdown = ref(false);
const homeMenuOpen = ref(false);
const maintenanceDropdown = ref(false);

import { useHomePageStore, HomePages } from '@/store/homePageStore';
const homeStore = useHomePageStore();
const isAdminViewActive = computed(() => homeStore.getHomePage === HomePages.ADMIN);
const isStudentViewActive = computed(() => homeStore.getHomePage === HomePages.STUDENT);

const route = useRoute();
const currentRouteName = computed(() => route.name);

const currentUser = ref(null);
const userRoles = ref(null);
const userRolePermissions = ref(null);
const userPermissions = [];

const hasUserPermission = ref(false);
const hasFlightPlanPermission = ref(false);
const hasShopPermission = ref(false);

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest(".user-menu")) {
    menuOpen.value = true;
  }
};

onMounted(() => {
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }
  getCurrentUser();
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const getCurrentUser = () => {
  UserServices.getUser(user.value.userId)
    .then((res) => {
      currentUser.value = res.data;
      getUserRoles();
    })
    .catch((error) => {
      console.log("error", error);
    });
}

const getUserRoles = () => {
  userRoleServices.getAllUserRoles(currentUser.value.id)
    .then((res) => {
      userRoles.value = res.data;
      getUserRolePermission();
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
};

const getUserRolePermission = () => {
  userRoles.value.forEach(userRole => {
    userRolePermissionServices.getAllPermissionsForUser(userRole.id)
      .then((res) => {
        userRolePermissions.value = res.data;
        getAllPermissions()
      })
      .catch((error) => {
        console.log("Error: " + error);
      })
  });
}

const getAllPermissions = () => {
  userRolePermissions.value.forEach(permission => {
    permissionServices.getPermission(permission.permissionId)
      .then((res) => {
        userPermissions.push(res.data.type);
        checkPermissions();
      })
      .catch((error) => {
        console.log("Error" + error);
      });
  });
}

const checkPermissions = () => {
  (userPermissions.includes('user_maintenance')) ? hasUserPermission.value = true : hasUserPermission.value = false;
  (userPermissions.includes('flightplan_maintenance')) ? hasFlightPlanPermission.value = true : hasFlightPlanPermission.value = false;
  (userPermissions.includes('shop_maintenance')) ? hasShopPermission.value = true : hasShopPermission.value = false;
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const toggleRoleDropdown = () => {
  roleDropdown.value = !roleDropdown.value;
}

const toggleMaintenanceDropdown = () => {
  maintenanceDropdown.value = !maintenanceDropdown.value;
}

const closeSidebar = () => {
  menuOpen.value = true;
};

</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 290px;
  background-color: #5D6D73;
  color: white;
  padding: 20px;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 2000;
  box-shadow: 0px 4px 4px 0px rgba(32, 32, 32, 0.50);
}

.sidebar.collapsed {
  width: 60px;
}

/* Toggle sidebar */
.toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #5D6D73;
  color: white;
  border: none;
  cursor: pointer;
}

.sidebar.collapsed .menu {
  display: none;
}

ul {
  list-style: none;
  padding: 0;
  cursor: pointer;
}

li {
  margin: 15px 0;
  font-size: 24px;
}

a {
  color: white;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.dropdown-menu a {
  color: black !important; 
  text-decoration: none; 
}

.dropdown-menu a:hover {
  color: #333; 
  text-decoration: underline; 
}

.user-menu,
.home-menu {
  position: relative;
}

.dropdown-menu {
  left: 0;
  transform: translateX(-20px);
  width: 290px;
  color: #202020;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  padding: 1px;
}

.dropdown-menu li {
  padding-left: 40px;
  font-size: 16px;
  color: black;
}

.arrow-down {
  margin-left: 90px;
}

.arrow-up {
  transform: rotate(180deg);
}
</style>