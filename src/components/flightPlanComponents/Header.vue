<template>
  <logout v-if="isLogout" @toggleLogout="toggleLogout" @signOut="signOut" />
  <header class="header" v-if="currentRouteName !== 'login'">
    <div class="logo-title">
      <router-link :to="{ name: 'homeFP' }"> <!-- Change the router link later -->
        <img src="/src/assets/OCLogo.png" alt="OC Logo" class="logo" />
      </router-link>
      <div class="title">Eagle Flight Plan</div>
    </div>

    <div class="user-menu">
      <!-- Notification -->
      <img src="/src/assets/notificationsIcon.svg" alt="Notification" class="user-icon" @click="toggleNotification"
        @keydown.enter="toggleNotification" role="button" tabindex="0" aria-haspopup="true"
        :aria-expanded="homeMenuOpen" style="width: 39px; height: 39px;" />
      <div v-if="notificationMenuOpen" class="dropdown-menu" @click.stop>
        <ul> <!-- !!!!! TEMP data -->
          <li>Temp Notification</li>
          <li>Temp Notification</li>
          <li>Temp Notification</li>
        </ul>
      </div>


      <!-- Profile Menu -->
      <img src="/src/assets/userIcon.png" alt="User" class="user-icon" @click="toggleProfileMenu"
        @keydown.enter="toggleProfileMenu" role="button" tabindex="0" aria-haspopup="true"
        :aria-expanded="profileMenuOpen" />
      <div v-if="profileMenuOpen" class="dropdown-menu" @click.stop>
        <div style="font-size: 20px;"> {{ user.fName }} {{ user.lName }} </div>
        <ul>
          <li @click="updateProfile">Edit Profile</li>
          <li @click="settings">Settings</li>
          <li @click="toggleRoleSwitchMenu" style="position: relative; display: flex; align-items: center;">
            <span style="position: absolute; left: 50%; transform: translateX(-50%);">Switch Role View</span>
            <Icon class="arrow-icon" :icon="roleSwitchMenuOpen ? dropDownUpIcon : dropDownIcon" :alt="'arrow'" />
          </li>
          <li v-if="roleSwitchMenuOpen" @click="updateHomePage(UserRoles.ADMIN)" class="role-menu">Admin</li>
          <li v-if="roleSwitchMenuOpen" @click="updateHomePage(UserRoles.PROFESSOR)" class="role-menu">Professor</li>
          <li v-if="roleSwitchMenuOpen" @click="updateHomePage(UserRoles.STUDENT)" class="role-menu">Student</li>
          <li v-if="roleSwitchMenuOpen" @click="updateHomePage(UserRoles.STUDENT_WORKER)" class="role-menu">Student Worker</li>
          <li @click="toggleLogout">Sign Out</li>

        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import Utils from "@/config/utils";
import AuthServices from "@/services/resumeBuilderServices/authServices";
import { useRouter, useRoute } from "vue-router";
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import logout from '@/components/flightPlanComponents/Logout.vue';
import { Icon } from "@iconify/vue";
import { useHomePageStore, UserRoles, HomePages } from '@/store/homePageStore';

const dropDownUpIcon = "material-symbols:arrow-drop-up-rounded";
const dropDownIcon = "material-symbols:arrow-drop-down-rounded";

const user = ref(null);
const initials = ref("");
const name = ref("");
const menuOpen = ref(false);
const router = useRouter();
const studentId = ref("");
const adminId = ref("");
const reviewerId = ref("");

const homeMenuOpen = ref(false);
const profileMenuOpen = ref(false);
const notificationMenuOpen = ref(false);
const roleSwitchMenuOpen = ref(false);
const isLogout = ref(false);

const route = useRoute();
const currentRouteName = computed(() => route.name);
const homeStore = useHomePageStore();

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest(".user-menu")) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }
  getUserRoles();
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const getUserRoles = async () => {
  try {
    user.value = Utils.getStore("user");
    const res = await UserServices.getUser(user.value.userId);
    user.value = res.data;
    studentId.value = user.value.studentId;
    adminId.value = user.value.adminId;
    reviewerId.value = user.value.reviewerId;
  } catch (error) {
    console.error("Error fetching roles", error);
  }
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const updateProfile = () => {
  router.push({ name: 'profile' });
  profileMenuOpen.value = false;
};

const settings = () => {
  router.push({ name: 'settings' });
  profileMenuOpen.value = false;
}

const updateHomePage = (loc) => {
  console.log(`Selected ${loc} role`);
  toggleRoleSwitchMenu();
  toggleProfileMenu();
  switch (loc) {
    case UserRoles.ADMIN:
      homeStore.switchView(UserRoles.ADMIN, HomePages.ADMIN, router);
      break;
    case UserRoles.STUDENT:
      homeStore.switchView(UserRoles.STUDENT, HomePages.STUDENT, router);
      break;
    case UserRoles.STUDENT_WORKER:
      homeStore.switchView(UserRoles.STUDENT_WORKER, HomePages.STUDENT_WORKER, router);
      break;
    case UserRoles.PROFESSOR:
      homeStore.switchView(UserRoles.PROFESSOR, HomePages.PROFESSOR, router);
      break;
  }
};

const signOut = async () => {
  user.value = Utils.getStore("user");
  AuthServices.logoutUser(user.value)
    .then((response) => {
      console.log(response);
      Utils.removeItem("user");
      router.push({ name: "login" });
    })
    .catch((error) => {
      console.log("error", error);
    });
  profileMenuOpen.value = false;
};

// CREATE A GET NOTIFICATION FUNCTION HERE AND ADD THEM TO AN ARRAY TO PASS LATER

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
  homeMenuOpen.value = false; // Close home menu when profile menu opens
  notificationMenuOpen.value = false; // Close notification menu when profile menu opens
  isLogout.value = false;
  roleSwitchMenuOpen.value = false;
};

const toggleNotification = () => {
  notificationMenuOpen.value = !notificationMenuOpen.value;
  profileMenuOpen.value = false; // Close profile menu when home menu opens
  homeMenuOpen.value = false; // Close home menu when profile menu opens
  roleSwitchMenuOpen.value = false;
  isLogout.value = false;
}

const toggleRoleSwitchMenu = () => {
  roleSwitchMenuOpen.value = !roleSwitchMenuOpen.value;
  notificationMenuOpen.value = false; // Close notification menu when role menu opens
  homeMenuOpen.value = false; // Close home menu when role menu opens

}

const toggleLogout = () => {
  isLogout.value = !isLogout.value;
  profileMenuOpen.value = false;
}
</script>

<style scoped>
.header {
  background-color: #811429;
  color: #FFF;
  padding-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.234);
  z-index: 1000;
  /* Ensure header is above other elements */
}

.logo-title {
  display: flex;
  align-items: center;
  text-indent: 10px;
  font-size: 17px;
  overflow: hidden;
}

.logo {
  width: 50px;
  height: auto;
  cursor: pointer;
}

.user-menu,
.home-menu {
  position: relative;
}

.home-menu span {
  margin-left: 5px;
}

.user-icon {
  width: 50px;
  height: auto;
  margin-right: 10px;
  cursor: pointer;
}

.dropdown-menu {
  text-align: center;
  position: absolute;
  right: 0;
  background-color: #FFFFFF;
  z-index: 2000;
  /* Higher z-index to ensure dropdown is above everything */
  color: #811429;
  box-shadow: 0 8px 16px rgba(182, 8, 8, 0.2);
  width: 317px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #FFF;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 10px;
  cursor: pointer;
}

.dropdown-menu li:hover {
  border: 1px solid #811429;
}

.role-menu {
  background-color: rgba(32, 32, 32, .1) !important;
  background: rgba(32, 32, 32, .1) !important;
}

.arrow-icon {
  margin-left: auto;
  width: 25px;
  height: 20px;
}
</style>
