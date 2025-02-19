<template>
  <div class="user-menu">
    <div :class="['sidebar', { collapsed: menuOpen }]">
      <img :src="menuOpen ? menuIcon : closeIcon" alt="menu" class="toggle-btn" @click="toggleMenu"
        @keydown.enter="toggleNotification" role="button" tabindex="0" aria-haspopup="true"
        :aria-expanded="homeMenuOpen" style="width: 39px; height: 39px;" />

      <div v-if="!menuOpen" class="menu">
        <br>
        <ul>
          <li @click="toggleRoleDropdown"> Persons <img :src="dropDownArrow"
              :class="['arrow-down', { 'arrow-up': roleDropdown }]" />
            <div v-if="roleDropdown" class="dropdown-menu" @click.stop>
          <li>Students</li>
          <li>Student Workers</li>
          <li>Professors</li>
          <li>Admins</li>
      </div>
      </li>
      <li @click="handleRoute('resumeBuilder')">Resume Builder</li>
      <li @click="handleRoute('studentHome')">Student Home Page</li>
      <li @click="handleRoute('studentWorkerHome')">Student Worker Home Page</li>
      <li @click="handleRoute('professorHome')">Professor Home Page</li>
      <li @click="handleRoute('adminHome')">Admin Home Page</li>
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

const user = ref(null);
const initials = ref("");
const name = ref("");
const menuOpen = ref(true);
const router = useRouter();
const studentId = ref("");
const adminId = ref("");
const reviewerId = ref("");

const roleDropdown = ref(false);
const homeMenuOpen = ref(false);

const route = useRoute();
const currentRouteName = computed(() => route.name);

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
  getUserRoles(); // WIll likely change the function to use the new system
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

const toggleRoleDropdown = () => {
  roleDropdown.value = !roleDropdown.value;
}

const handleRoute = (loc) => {
  toggleMenu();
  switch (loc) {
    case 'resumeBuilder':
      router.push({ name: "homeRB" });
      break;
    case 'adminHome':
      router.push({ name: "adminHomeFP" });
      break;
    case 'studentHome':
      router.push({ name: "studentHomeFP" });
      break;
    case 'studentWorkerHome':
      router.push({ name: "studentWorkerHomeFP" });
      break;
    case 'professorHome':
      router.push({ name: "professorHomeFP" });
      break;
  }

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
</style>