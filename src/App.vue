<template>
  <div id="app" :class="{ 'flight-plan': currentModule === 'flightPlan' }">
    <HeaderResumeBuilder v-if="currentTab.value !== 'login' && currentModule === 'resumeBuilder'" :currentTab="currentTab" />
    <HeaderFlightPlan v-if="(currentTab.value !== 'login' || currentTab.value !== 'homeFP') && currentModule === 'flightPlan'" />
    <SideBar v-if="(currentTab.value !== 'login' || currentTab.value !== 'homeFP') && currentModule === 'flightPlan'" :currentTab="currentTab" />
    <NavBar v-if="showNavBar" :currentTab="currentTab" />
    <router-view></router-view>
  </div>
</template>

<script>
import HeaderResumeBuilder from './components/resumeBuilderComponents/Header.vue';
import HeaderFlightPlan from './components/flightPlanComponents/Header.vue';
import SideBar from './components/flightPlanComponents/SideBar.vue';
import NavBar from './components/resumeBuilderComponents/NavBar.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  components: {
    HeaderResumeBuilder,
    HeaderFlightPlan,
    SideBar,
    NavBar,
  },
  setup() {
    const route = useRoute();

    // Define a mapping of specific base paths to tab names
    const routeToTabName = {
      '/resumeBuilder/contact-info': 'Contact Info',
      '/resumeBuilder/education': 'Education',
      '/resumeBuilder/courses': 'Courses',
      '/resumeBuilder/experience': 'Experience',
      '/resumeBuilder/certifications': 'Certifications',
      '/resumeBuilder/skills': 'Skills',
      '/resumeBuilder/project': 'Project'
    };
    
    // Check if the current route is the root home page
    const isHomePage = computed(() => route.path === '/');

    // Determine the current tab based on route path
    const currentTab = computed(() => {
      const basePath = Object.keys(routeToTabName).find(path => route.path.startsWith(path));
      return routeToTabName[basePath] || ''; 
    });

    // Determine if the NavBar should be shown
    const showNavBar = computed(() => {
      return currentTab.value !== '';
    });

    const showHeader = computed(() => {
      return currentTab.value === 'login'});

    const currentModule = computed(() => {
      const segments = route.path.split('/');
      return segments[1] || '';
    });

    return {
      isHomePage,
      currentTab,
      showNavBar,
      currentModule
    };
  },
};
</script>

<style>
#app {
  font-family: 'Poppins', sans-serif;
  flex-direction: column;
  height: min-content;
  background-color: #D4E6F3;
  overflow: hidden;
}

.flight-plan {
  margin-left: 60px;
}
</style>