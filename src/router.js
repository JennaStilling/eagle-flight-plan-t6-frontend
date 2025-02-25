import { createRouter, createWebHistory } from 'vue-router';
import ContactInfo from '@/components/resumeBuilderComponents/userProfile/ContactInfo.vue';
import Education from '@/components/resumeBuilderComponents/userProfile/Education.vue';
import Courses from '@/components/resumeBuilderComponents/userProfile/Courses.vue';
import Experience from '@/components/resumeBuilderComponents/userProfile/Experience.vue';
import Certifications from '@/components/resumeBuilderComponents/userProfile/Certifications.vue';
import Skills from '@/components/resumeBuilderComponents/userProfile/Skills.vue';
import Project from '@/components/resumeBuilderComponents/userProfile/Project.vue';

import ViewResume from '@/views/resumeBuilderViews/student/ViewResume.vue';
import AddResume from '@/views/resumeBuilderViews/student/AddResume.vue';
import Login from '@/components/Login.vue';
import StudentHome from '@/views/resumeBuilderViews/student/StudentHome.vue'
import AdminHomePage from '@/views/resumeBuilderViews/admin/AdminHome.vue';

import ReviewerHomePage from '@/views/resumeBuilderViews/reviewer/ReviewerHome.vue';
import ReviewInbox from '@/components/resumeBuilderComponents/reviewerPages/ReviewInbox.vue';
import ReviewResume from '@/components/resumeBuilderComponents/reviewerPages/ReviewResume.vue';
//import path from 'path';

// Resume builder page router
import HomePageRouterRB from '@/views/resumeBuilderViews/HomePageRouter.vue';
//import path from 'path';

// Flight Plan page router
import HomepageRouterFP from '@/views/flightPlanViews/HomePageRouter.vue';

// Flight Plan components and the like
import AdminHomePageFP from '@/views/flightPlanViews/admin/AdminHome.vue';
import StudentHomePageFP from '@/views/flightPlanViews/student/StudentHome.vue';
import StudentWorkerHomePageFP from '@/views/flightPlanViews/studentWorker/StudentWorkerHome.vue';
import ProfessorHomePageFP from '@/views/flightPlanViews/professor/ProfessorHome.vue';
import settings from '@/views/flightPlanViews/Settings.vue';
import profile from '@/views/flightPlanViews/Profile.vue';

import Utils from "@/config/utils.js";
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import { computed, ref } from "vue";

const user = computed(() => Utils.getStore("user"));

// Define routes
const routes = [
  { path: '/login', name: "login"},

  // Flight Plan
  { path: '/', name: 'homeFP', component: HomepageRouterFP },

  // Resume Builder Router
  { path: '/resumeBuilder', name: 'homeRB', component: HomePageRouterRB },

  // Profile paths:
  { path: "/resumeBuilder/contact-info", name: "contactInfo", component: ContactInfo },
  { path: "/resumeBuilder/education", name: "education", component: Education },
  { path: "/resumeBuilder/education/edit", name: "educationEdit", component: Education },
  { path: "/resumeBuilder/courses", name: "courses", component: Courses },
  { path: "/resumeBuilder/courses/select/", name: "coursesSelect", component: Courses },
  { path: "/resumeBuilder/courses/select/edit", name: "coursesEdit", component: Courses },
  { path: "/resumeBuilder/experience", name: "experience", component: Experience },
  { path: "/resumeBuilder/experience/edit", name: "experienceEdit", component: Experience },
  { path: "/resumeBuilder/certifications", name: "certifications", component: Certifications },
  { path: "/resumeBuilder/certifications/edit", name: "certificationsEdit", component: Certifications },
  { path: "/resumeBuilder/skills", name: "skills", component: Skills },
  { path: "/resumeBuilder/skills/edit", name: "skillsEdit", component: Skills },
  { path: "/resumeBuilder/project", name: "project", component: Project },
  { path: "/resumeBuilder/project/edit", name: "projectEdit", component: Project },

  //Login/out: 
  { path: '/login', name: 'login', component: Login },
  { path: '/resumeBuilder/studentHome', name: 'studentHome', component: StudentHome },
  { path: '/resumeBuilder/resume/:id', name: 'resume', component: ViewResume, props: true },
  { path: '/resumeBuilder/add', name: 'addResume', component: AddResume },

  { path: '/resumeBuilder/review-inbox', name: 'review-inbox', component: ReviewInbox },
  { path: '/resumeBuilder/review-resume/:id', name: 'reviewResume', component: ReviewResume, props: true },
  { path: '/resumeBuilder/studentHome', name: 'studentHome', component: StudentHome },

  //dummy / temp routes for nav bar testing
  { path: '/resumeBuilder/reviewerHome', name: 'reviewerHome', component: ReviewerHomePage },
  { path: '/resumeBuilder/adminHome', name: 'adminHomeRB', component: AdminHomePage },

  // Flight Plan Jazz
  { path: '/flightPlan/adminHome', name: 'adminHomeFP', component: AdminHomePageFP},
  { path: '/flightPlan/studentHome', name: 'studentHomeFP', component: StudentHomePageFP},
  { path: '/flightPlan/studentWorkerHome', name: 'studentWorkerHomeFP', component: StudentWorkerHomePageFP},
  { path: '/flightPlan/professorHome', name: 'professorHomeFP', component: ProfessorHomePageFP},

  { path: '/flightPlan/settings', name: 'settings', component: settings },
  { path: '/flightPlan/profile', name: 'profile', component: profile },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from) => {
  const isAuthenticated = !!user.value;
  console.log("User:", user.value);

  const currentUser = ref({});

  if (to.name === 'login') {
    return true; // Explicitly allow navigation
  }

  if (isAuthenticated) {
    try {
      const res = await UserServices.getUser(user.value.userId);
      currentUser.value = res.data;
    } catch (error) { // just in case
      console.log("No user found");
      return { name: "login" };
    }
  }

  const isStudent = !!currentUser.value.studentId;
  const isAdmin = !!currentUser.value.adminId;
  const isReviewer = !!currentUser.value.reviewerId;

  const studentPages = [
    "studentHome",
    "resumes",
    "resume",
    "addResume",
    "editResume",
    "contactInfo",
    "education",
    "educationEdit",
    "experience",
    "experienceEdit",
    "certifications",
    "certificationsEdit",
    "skills",
    "skillsEdit",
    "project",
    "projectEdit",
  ];
  
  const adminPages = [
    "adminHomeRB"
  ];

  const reviewerPages = [
    "reviewerHome", 
    "review-inbox", 
    "reviewResume"
  ];

  // not logged in
  if (!isAuthenticated && to.name !== "login") {
    return { name: "login" };
  }

  // Note: This is using the old role system currently in place, once the new one is implemented, this will need to be changed
  // logged in
  if (isAuthenticated) {
    // not a student
    if (!isStudent && studentPages.includes(to.name)) {
      console.log("Access denied to student page:", to.name);
      return { name: "homeFP" };
    }

    // not an admin
    if (!isAdmin && adminPages.includes(to.name)) {
      console.log("Access denied to admin page:", to.name);
      return { name: "homeFP" };
    }

    // not a reviewer
    if (!isReviewer && reviewerPages.includes(to.name)) {
      console.log("Access denied to reviewer page:", to.name);
      return { name: "homeFP" };
    }

    // trying to go to the login page while logged in
    if (to.name === "login") {
      return { name: "homeFP" };
    }
  }
});

export default router;
