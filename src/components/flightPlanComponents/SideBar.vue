<template>
  <div class="user-menu">
    <div :class="['sidebar', { collapsed: menuOpen }]">
      <img :src="menuOpen ? menuIcon : closeIcon" alt="menu" class="toggle-btn" @click="toggleMenu"
        @keydown.enter="toggleNotification" role="button" tabindex="0" aria-haspopup="true"
        :aria-expanded="homeMenuOpen" style="width: 39px; height: 39px;" />

      <div v-if="!menuOpen" class="menu">
        <br>
        <ul>
          <!-- Role Switcher (Supports student, admin, & *professor)-->
          <div v-if="hasMultipleRoles" class="role-switcher">
            <div class="role-tabs">
              <button v-if="adminAccess" :class="['role-tab', { active: isAdminViewActive }]"
                @click="switchToRole(UserRoles.ADMIN)">
                <Icon icon="mdi:shield-account" class="role-icon" />
                <span>Admin</span>
              </button>
              <button v-if="studentAccess" :class="['role-tab', { active: isStudentViewActive }]"
                @click="switchToRole(UserRoles.STUDENT)">
                <Icon icon="mdi:school" class="role-icon" />
                <span>Student</span>
              </button>
              <!-- Professor role -->
              <!-- <button v-if="professorAccess" :class="['role-tab', { active: isProfessorViewActive }]" 
                @click="switchToRole(UserRoles.PROFESSOR)">
                <Icon icon="mdi:teach" class="role-icon" />
                <span>Professor</span>
              </button> -->
            </div>
          </div>
          <!-- Admin Pages ---------------------------------------------------------------------------------->
          <template v-if="isAdminViewActive">
            <li @click="toggleApprovalRequestsDropdown">Approval Requests
              <Icon :icon="approvalRequestsDropdown ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
                class="dropdown-arrow" />
              <div v-if="approvalRequestsDropdown" class="dropdown-menu" @click.stop>
            <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'approveEvent' }" @click="closeSidebar">View
                Event Approvals</router-link></li>
            <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'approveTask' }" @click="closeSidebar">View
                Task Approvals</router-link></li>
            <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'approveExperience' }"
                @click="closeSidebar">View Experience Approvals</router-link></li>
            <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'approveCustomEvent' }"
                @click="closeSidebar">View Custom Event Approvals</router-link></li>
            <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'approveCustomTask' }"
                @click="closeSidebar">View Custom Task Approvals</router-link></li>
            <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'approveCustomExperience' }"
                @click="closeSidebar">View Custom Experience Approvals</router-link></li>
      </div>
      </li>

      <li @click="toggleMaintenanceDropdown">Maintenance
        <Icon :icon="maintenanceDropdown ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
          class="dropdown-arrow" />
        <div v-if="maintenanceDropdown" class="dropdown-menu" @click.stop>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'badge' }" @click="closeSidebar">Badges</router-link>
      </li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'cliftonStrength' }" @click="closeSidebar">Clifton
          Strengths</router-link></li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'event' }" @click="closeSidebar">Events</router-link>
      </li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'experience' }"
          @click="closeSidebar">Experiences</router-link></li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'flightPlan' }" @click="closeSidebar">Flight
          Plans</router-link></li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'lifeAfterTheNest' }" @click="closeSidebar">Life
          After the Nest</router-link></li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'major' }" @click="closeSidebar">Majors
        </router-link></li>
      <li v-if="hasShopPermission"><router-link :to="{ name: 'award' }" @click="closeSidebar">Shop
          Items</router-link></li>
      <li v-if="hasFlightPlanPermission"><router-link :to="{ name: 'task' }" @click="closeSidebar">Tasks</router-link>
      </li>

      <li v-if="hasUserPermission"><router-link :to="{ name: 'userMaintenance' }"
          @click="closeSidebar">Users</router-link>
      </li>
    </div>
    </li>
    <!-- Other Admin Pages -->
    <template v-if="isAdminViewActive">
      <li><router-link :to="{ name: 'adminHomeFP' }" @click="closeSidebar">Home</router-link></li>
      <li><router-link :to="{ name: 'homeRB' }" @click="closeSidebar">Resume Builder</router-link></li>
    </template>
</template>

<!-- Student Pages -------------------------------------------------------------------------------------------------->
<template v-else-if="isStudentViewActive">
  <li><router-link :to="{ name: 'studentHomeFP' }" @click="closeSidebar">Home</router-link></li>
  <li><router-link :to="{ name: 'studentFlightPlan' }" @click="closeSidebar"> <span>Student Flight
        Plan</span></router-link></li>
  <li><router-link :to="{ name: 'profile' }" @click="closeSidebar">Profile</router-link></li>
  <li><router-link :to="{ name: 'student-badges' }" @click="closeSidebar">Badges</router-link></li>
  <li><router-link :to="{ name: 'student-events' }"
      @click="closeSidebar; localStorage.setItem('viewPersonalCalendar', false);">Events</router-link></li>
  <li><router-link :to="{ name: 'shop' }" @click="closeSidebar">Shop</router-link></li>
  <li><router-link :to="{ name: 'leaderboard' }" @click="closeSidebar">Leaderboard</router-link></li>
  <li><router-link :to="{ name: 'student-transactions' }" @click="closeSidebar">Spending History</router-link></li>
  <li><router-link :to="{ name: 'student-lifeAfterTheNest' }" @click="closeSidebar">Life After the Nest</router-link>
  </li>
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

import { useHomePageStore, HomePages, UserRoles } from '@/store/homePageStore';

const router = useRouter();
const user = ref(null);
const initials = ref("");
const name = ref("");
const menuOpen = ref(true);

const adminAccess = ref(false);
const studentAccess = ref(false);
const professorAccess = ref(false);

const roleDropdown = ref(false);
const homeMenuOpen = ref(false);
const maintenanceDropdown = ref(false);
const approvalRequestsDropdown = ref(false);

const homeStore = useHomePageStore();
const isAdminViewActive = computed(() => homeStore.getHomePage === HomePages.ADMIN);
const isStudentViewActive = computed(() => homeStore.getHomePage === HomePages.STUDENT);
const isProfessorViewActive = computed(() => homeStore.getHomePage === HomePages.PROFESSOR);

const hasMultipleRoles = computed(() => {
  let roleCount = 0;
  if (adminAccess.value) roleCount++;
  if (studentAccess.value) roleCount++;
  if (professorAccess.value) roleCount++;
  return roleCount > 1;
});

const route = useRoute();
const currentRouteName = computed(() => route.name);

const currentUser = ref(null);
const userRoles = ref(null);
const userRolePermissions = ref(null);
const userPermissions = [];

const hasUserPermission = ref(false);
const hasFlightPlanPermission = ref(false);
const hasShopPermission = ref(false);

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
  getAllUserRoles();
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

const getAllUserRoles = () => {
  userRolePermissionServices.getAllPermissionsForUser(user.value.userId).then((res) => {
    res.data.forEach(role => {
      if (role.permissionId == 7)
        adminAccess.value = true; //admin
      if (role.permissionId == 8)
        studentAccess.value = true; //student
      // if (role.permissionId == 9)
      // professorAccess.value = true; //professor
    });
    //console.log("Admin access:", adminAccess.value);
    //console.log("Student access:", studentAccess.value);
    //console.log("Multiple roles:", hasMultipleRoles.value);
  }).catch((error) => {
    console.log("error", error);
  });
}

const switchToRole = (role) => {
  switch (role) {
    case UserRoles.ADMIN:
      homeStore.switchView(UserRoles.ADMIN, HomePages.ADMIN, router);
      break;
    case UserRoles.STUDENT:
      homeStore.switchView(UserRoles.STUDENT, HomePages.STUDENT, router);
      break;
    case UserRoles.PROFESSOR:
      homeStore.switchView(UserRoles.PROFESSOR, HomePages.PROFESSOR, router);
      break;
  }
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const toggleRoleDropdown = () => {
  roleDropdown.value = !roleDropdown.value;
}

const toggleMaintenanceDropdown = () => {
  maintenanceDropdown.value = !maintenanceDropdown.value;
}

const toggleApprovalRequestsDropdown = () => {
  approvalRequestsDropdown.value = !approvalRequestsDropdown.value;
}

const closeSidebar = () => {
  menuOpen.value = true;
};

</script>

<style scoped>
.user-icon {
  width: 50px;
  height: auto;
  margin-right: 10px;
  cursor: pointer;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 290px;
  background-color: #3a474c;
  color: white;
  padding: 18px;
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 2000;
  box-shadow: 2px 0px 10px rgba(0, 0, 0, 0.3);

  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* Webkit browsers (Chrome, Safari, Edge) */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Firefox */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 60px;
}

.toggle-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3));
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.sidebar.collapsed .menu {
  display: none;
}

ul {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

li {
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 18px;
  transition: background-color 0.2s ease;
  position: relative;
}

li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

a {
  color: #e6e6e6;
  text-decoration: none;
  display: block;
  padding: 4px 0;
  transition: color 0.2s ease;
  text-decoration: none;
}

a:hover {
  color: white;
  text-decoration: none;
}

.dropdown-menu {
  position: relative;
  width: 100%;
  left: 0;
  background-color: #FFFFFF;
  color: #202020;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  padding: 9px 0;
  border-radius: 8px;
  margin-top: 8px;
  z-index: 1000;
  transform: none;
  text-decoration: none;
  border: none;
}

.dropdown-menu li {
  padding: 8px 15px 8px 15px;
  font-size: 16px;
  color: #333;
  margin: 0;
  border-radius: 0;
  border: none;
  border-left: 0px solid transparent;
  transition: all 0.2s ease;
  text-decoration: none;
}

.dropdown-menu li:hover {
  border: none;
  border-left: 4px solid #811429;
  padding-left: 20px;
  font-weight: 500;
  text-decoration: none;
}

.dropdown-menu a {
  color: #333;
  padding: 2px 0;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;
}

.dropdown-menu a:hover {
  color: #811429;
  text-decoration: none;
  border: none;
}

.dropdown-menu li a,
.dropdown-menu li a:link,
.dropdown-menu li a:visited {
  color: #333;
  text-decoration: none;
  border: none;
}

.dropdown-menu li a:hover {
  color: #811429;
  background-color: #ffffff;
  text-decoration: none;
  border: none;
}

.dropdown-menu li a.router-link-active {
  color: #811429;
  font-weight: 600;
}

.dropdown-arrow {
  float: right;
  margin-top: 3px;
  transition: transform 0.3s ease;
}

li a.router-link-active {
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

li[class*="toggle"] {
  cursor: pointer;
  text-decoration: none;
}

/*-----------------------------------------------------*/
.role-switcher {
  margin-top: 20px;
  margin-bottom: 25px;
  padding: 11px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) inset;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.role-switcher-title {
  color: #e6e6e6;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.role-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.role-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.08);
  color: #e6e6e6;
  border: none;
  padding: 7px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.role-tab.active {
  background-color: #811429;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  color: white;
  font-weight: 500;
}

.role-tab:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.15);
}

.role-icon {
  margin-right: 6px;
  font-size: 16px;
}
</style>