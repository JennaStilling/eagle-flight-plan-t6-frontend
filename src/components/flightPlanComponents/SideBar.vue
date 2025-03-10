<template>
  <div class="user-menu">
    <div :class="['sidebar', { collapsed: menuOpen }]">
      <img :src="menuOpen ? menuIcon : closeIcon" alt="menu" class="toggle-btn" @click="toggleMenu"
        @keydown.enter="toggleNotification" role="button" tabindex="0" aria-haspopup="true"
        :aria-expanded="homeMenuOpen" style="width: 39px; height: 39px;" />

      <div v-if="!menuOpen" class="menu">
        <br>
        <ul>
          <li v-if="hasUserPermission" @click="toggleRoleDropdown"> Persons <Icon :icon="roleDropdown ? 'material-symbols:expand-less' : 'material-symbols:expand-more'" class="dropdown-arrow" />
            <div v-if="roleDropdown" class="dropdown-menu" @click.stop>
          <li>Students</li>
          <li>Student Workers</li>
          <li>Professors</li>
          <li>Admins</li>
      </div>
      </li>

      <!-- Admin Maintenance -->
      <li @click="toggleMaintenanceDropdown"> Maintenance <Icon :icon="maintenanceDropdown ? 'material-symbols:expand-less' : 'material-symbols:expand-more'" class="dropdown-arrow" />

      <div v-if="maintenanceDropdown" class="dropdown-menu" @click.stop>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'event' }"><span
              class='black-text'>Events</span></router-link></li>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'task' }"><span
              class='black-text'>Tasks</span></router-link></li>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'experience' }"><span
              class='black-text'>Experiences</span></router-link></li>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'flightPlan' }"><span
              class='black-text'>Flight Plans</span></router-link></li>
        <li v-if="hasShopPermission" @click="toggleMenu"><router-link :to="{ name: 'award' }"><span
              class='black-text'>Shop Items</span></router-link></li>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'badge' }"><span
              class='black-text'>Badges</span></router-link></li>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'cliftonStrength' }"><span
              class='black-text'>Clifton Strengths</span></router-link></li>
        <li v-if="hasFlightPlanPermission" @click="toggleMenu"><router-link :to="{ name: 'lifeAfterTheNest' }"><span
              class='black-text'>Life After the Nest</span></router-link></li>
        <li v-if="hasShopPermission" @click="toggleMenu"><router-link :to="{ name: 'transactionLog' }"><span
              class='black-text'>Transaction History</span></router-link></li>
      </div>
      </li>

      <!-- Resume Builder -->
      <li><router-link :to="{ name: 'homeRB' }">Resume Builder</router-link></li>

      <!-- Student Pages -->


      <!-- Professor Pages -->


      <!-- Student Worker Pages -->

      </ul>
    </div>
  </div>
  </div>
</template>

<script setup>
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

import { useHomePageStore } from '@/store/homePageStore';
const homeStore = useHomePageStore();

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
  width: 250px;
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
  /* font-family: 'Poppins'; */
}

a {
  color: white;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.user-menu,
.home-menu {
  position: relative;
}

.dropdown-menu {
  /* position: absolute; */
  left: 0;
  transform: translateX(-20px);
  width: 250px;
  background-color: #FFFFFF;
  color: #202020;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  padding: 1px;
}

.dropdown-menu li {
  padding-left: 40px;
  font-size: 16px;
}

.arrow-down {
  margin-left: 90px;
}

.arrow-up {
  transform: rotate(180deg);
}

.black-text {
  color: #202020;
}
</style>