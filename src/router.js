import { createRouter, createWebHistory } from "vue-router";
import ContactInfo from "@/components/resumeBuilderComponents/userProfile/ContactInfo.vue";
import Education from "@/components/resumeBuilderComponents/userProfile/Education.vue";
import Courses from "@/components/resumeBuilderComponents/userProfile/Courses.vue";
import Experience from "@/components/resumeBuilderComponents/userProfile/Experience.vue";
import Certifications from "@/components/resumeBuilderComponents/userProfile/Certifications.vue";
import Skills from "@/components/resumeBuilderComponents/userProfile/Skills.vue";
import Project from "@/components/resumeBuilderComponents/userProfile/Project.vue";

import ViewResume from "@/views/resumeBuilderViews/student/ViewResume.vue";
import AddResume from "@/views/resumeBuilderViews/student/AddResume.vue";
import Login from "@/components/Login.vue";
import StudentHome from "@/views/resumeBuilderViews/student/StudentHome.vue";
import HelpfulResources from "@/views/resumeBuilderViews/student/HelpfulResources.vue";
import AdminHomePage from "@/views/resumeBuilderViews/admin/AdminHome.vue";

import ReviewerHomePage from "@/views/resumeBuilderViews/reviewer/ReviewerHome.vue";
import ReviewInbox from "@/components/resumeBuilderComponents/reviewerPages/ReviewInbox.vue";
import ReviewResume from "@/components/resumeBuilderComponents/reviewerPages/ReviewResume.vue";
//import path from 'path';

// Resume builder page router
import HomePageRouterRB from "@/views/resumeBuilderViews/HomePageRouter.vue";
//import path from 'path';

// Flight Plan page router
import HomepageRouterFP from "@/views/flightPlanViews/HomePageRouter.vue";

// Flight Plan components and the like
import AdminHomePageFP from "@/views/flightPlanViews/admin/AdminHome.vue";
import StudentHomePageFP from "@/views/flightPlanViews/student/StudentHome.vue";
import StudentWorkerHomePageFP from "@/views/flightPlanViews/studentWorker/StudentWorkerHome.vue";
import ProfessorHomePageFP from "@/views/flightPlanViews/professor/ProfessorHome.vue";
import settings from "@/views/flightPlanViews/Settings.vue";
import profile from "@/views/flightPlanViews/Profile.vue";
// Maintenance & Admin Pages
import AwardMaintenance from "./views/flightPlanViews/admin/maintenance/AwardMaintenance.vue";
import BadgeMaintenance from "./views/flightPlanViews/admin/maintenance/BadgeMaintenance.vue";
import CliftonStrength from "./views/flightPlanViews/admin/maintenance/CliftonStrengthMaintenance.vue";
import EventMaintenance from "./views/flightPlanViews/admin/maintenance/EventMaintenance.vue";
import ExperienceMaintenance from "./views/flightPlanViews/admin/maintenance/ExperienceMaintenance.vue";
import FlightPlanMaintenance from "./views/flightPlanViews/admin/maintenance/FlightPlanMaintenance.vue";
import LifeAfterTheNestFP from "./views/flightPlanViews/admin/LifeAfterTheNest.vue";
import TaskMaintenance from "./views/flightPlanViews/admin/maintenance/TaskMaintenance.vue";
import TransactionLogs from "./views/flightPlanViews/admin/TransactionLogs.vue";
import UserMaintenance from "./views/flightPlanViews/admin/maintenance/userMaintenance.vue";
import MajorMaintenance from "./views/flightPlanViews/admin/maintenance/MajorMaintenance.vue";

// Approval Pages
import EventApprovals from "./views/flightPlanViews/admin/approvals/EventApprovals.vue";
import CustomEventApprovals from "./views/flightPlanViews/admin/approvals/CustomEventApprovals.vue";
import TaskApprovals from "./views/flightPlanViews/admin/approvals/TaskApprovals.vue";
import CustomTaskApprovals from "./views/flightPlanViews/admin/approvals/CustomTaskApprovals.vue";
import ExperienceApprovals from "./views/flightPlanViews/admin/approvals/ExperienceApprovals.vue";
import CustomExperienceApprovals from "./views/flightPlanViews/admin/approvals/CustomExperienceApprovals.vue";
// Student Pages
import StudentFlightPlan from "./views/flightPlanViews/student/StudentFlightPlan.vue";
import Leaderboard from "./views/flightPlanViews/student/Leaderboard.vue";
import Shop from "./views/flightPlanViews/student/Shop.vue";
import Events from "./views/flightPlanViews/student/StudentEvents.vue";
import Transactions from "./views/flightPlanViews/student/StudentTransactions.vue";
import StudentLifeAfterTheNest from "./views/flightPlanViews/student/StudentLifeAfterTheNest.vue";
import Badges from "./views/flightPlanViews/student/StudentBadges.vue";

import Utils from "@/config/utils.js";
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import UserRoleServices from "./services/resumeBuilderServices/userRoleServices";
import UserRolePermissionServices from "./services/flightPlanServices/userRolePermissionServices";
import { computed, ref } from "vue";

const user = computed(() => Utils.getStore("user"));

// Define routes
const routes = [
  // Flight Plan
  { path: "/", name: "homeFP", component: HomepageRouterFP },

  // Resume Builder Router
  { path: "/resumeBuilder", name: "homeRB", component: HomePageRouterRB },

  // Profile paths:
  {
    path: "/resumeBuilder/contact-info",
    name: "contactInfo",
    component: ContactInfo,
  },
  { path: "/resumeBuilder/education", name: "education", component: Education },
  {
    path: "/resumeBuilder/education/edit",
    name: "educationEdit",
    component: Education,
  },
  { path: "/resumeBuilder/courses", name: "courses", component: Courses },
  {
    path: "/resumeBuilder/courses/select/",
    name: "coursesSelect",
    component: Courses,
  },
  {
    path: "/resumeBuilder/courses/select/edit",
    name: "coursesEdit",
    component: Courses,
  },
  {
    path: "/resumeBuilder/experience",
    name: "experience",
    component: Experience,
  },
  {
    path: "/resumeBuilder/experience/edit",
    name: "experienceEdit",
    component: Experience,
  },
  {
    path: "/resumeBuilder/certifications",
    name: "certifications",
    component: Certifications,
  },
  {
    path: "/resumeBuilder/certifications/edit",
    name: "certificationsEdit",
    component: Certifications,
  },
  { path: "/resumeBuilder/skills", name: "skills", component: Skills },
  { path: "/resumeBuilder/skills/edit", name: "skillsEdit", component: Skills },
  { path: "/resumeBuilder/project", name: "project", component: Project },
  {
    path: "/resumeBuilder/project/edit",
    name: "projectEdit",
    component: Project,
  },

  //Login/out:
  { path: "/login", name: "login", component: Login },

  {
    path: "/resumeBuilder/studentHome",
    name: "studentHome",
    component: StudentHome,
  },
  {
    path: "/resumeBuilder/resume/:id",
    name: "resume",
    component: ViewResume,
    props: true,
  },
  { path: "/resumeBuilder/add", name: "addResume", component: AddResume },

  {
    path: "/resumeBuilder/review-inbox",
    name: "review-inbox",
    component: ReviewInbox,
  },
  {
    path: "/resumeBuilder/review-resume/:id",
    name: "reviewResume",
    component: ReviewResume,
    props: true,
  },
  {
    path: "/resumeBuilder/studentHome",
    name: "studentHome",
    component: StudentHome,
  },
  {
    path: "/resumeBuilder/helpfulResources",
    name: "helpfulResources",
    component: HelpfulResources,
  },

  //dummy / temp routes for nav bar testing
  {
    path: "/resumeBuilder/reviewerHome",
    name: "reviewerHome",
    component: ReviewerHomePage,
  },
  {
    path: "/resumeBuilder/adminHome",
    name: "adminHome",
    component: AdminHomePage,
  },

  // Flight Plan Jazz
  {
    path: "/flightPlan/adminHome",
    name: "adminHomeFP",
    component: AdminHomePageFP,
  },
  {
    path: "/flightPlan/studentHome",
    name: "studentHomeFP",
    component: StudentHomePageFP,
  },
  {
    path: "/flightPlan/studentWorkerHome",
    name: "studentWorkerHomeFP",
    component: StudentWorkerHomePageFP,
  },
  {
    path: "/flightPlan/professorHome",
    name: "professorHomeFP",
    component: ProfessorHomePageFP,
  },

  { path: "/flightPlan/settings", name: "settings", component: settings },
  { path: "/flightPlan/profile", name: "profile", component: profile },

  // Maintenance & Admin Pages
  {
    path: "/flightPlan/award/Maintenance",
    name: "award",
    component: AwardMaintenance,
  },
  {
    path: "/flightPlan/badge/Maintenance",
    name: "badge",
    component: BadgeMaintenance,
  },
  {
    path: "/flightPlan/event/Maintenance",
    name: "event",
    component: EventMaintenance,
  },
  {
    path: "/flightPlan/experience/Maintenance",
    name: "experience",
    component: ExperienceMaintenance,
  },
  {
    path: "/flightPlan/flightPlan/Maintenance",
    name: "flightPlan",
    component: FlightPlanMaintenance,
  },
  {
    path: "/flightPlan/major/Maintenance",
    name: "major",
    component: MajorMaintenance,
  },
  {
    path: "/flightPlan/lifeAfterTheNest",
    name: "lifeAfterTheNest",
    component: LifeAfterTheNestFP,
  },
  {
    path: "/flightPlan/task/Maintenance",
    name: "task",
    component: TaskMaintenance,
  },
  {
    path: "/flightPlan/transaction/logs",
    name: "transactionLog",
    component: TransactionLogs,
  },
  {
    path: "/flightPlan/user/Maintenance",
    name: "userMaintenance",
    component: UserMaintenance,
  },
  {
    path: "/flightPlan/cliftonStrength/Maintenance",
    name: "cliftonStrength",
    component: CliftonStrength,
  },
  {
    path: "/flightPlan/event/approve",
    name: "approveEvent",
    component: EventApprovals,
  },
  {
    path: "/flightPlan/event/approve-custom",
    name: "approveCustomEvent",
    component: CustomEventApprovals,
  },
  {
    path: "/flightPlan/task/approve",
    name: "approveTask",
    component: TaskApprovals,
  },
  {
    path: "/flightPlan/task/approve-custom",
    name: "approveCustomTask",
    component: CustomTaskApprovals,
  },
  {
    path: "/flightPlan/experience/approve",
    name: "approveExperience",
    component: ExperienceApprovals,
  },
  {
    path: "/flightPlan/experience/approve-custom",
    name: "approveCustomExperience",
    component: CustomExperienceApprovals,
  },

  //Student Pages
  {
    path: "/flightPlan/flightPlan/studentFlightPlan",
    name: "studentFlightPlan",
    component: StudentFlightPlan,
  },
  { path: "/flightPlan/shop", name: "shop", component: Shop },
  // { path: '/flightPlan/events', name: 'events', component: Events },
  {
    path: "/flightPlan/leaderboard",
    name: "leaderboard",
    component: Leaderboard,
  },
  {
    path: "/flightPlan/student-events",
    name: "student-events",
    component: Events,
  },
  {
    path: "/flightPlan/student-transactions",
    name: "student-transactions",
    component: Transactions,
  },
  {
    path: "/flightPlan/student-lifeAfterTheNest",
    name: "student-lifeAfterTheNest",
    component: StudentLifeAfterTheNest,
  },
  {
    path: "/flightPlan/student-badges",
    name: "student-badges",
    component: Badges,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const unrestrictedPages = [
  "login",
  //"eventSignUp",
];

const anyRolePages = ["homeFP", "homeRB", "profile", "settings"];

// 1
const userMaintenancePages = [
  "userMaintenance",
  "major",
  "cliftonStrength",
  "badge",
  "adminHomeFP",
];

//2
const flightPlanMaintenancePages = [
  "task",
  "experience",
  "event",
  "flightPlan",
  "badge",
  "adminHomeFP",
];

// 3
const flightPlanApprovalPages = [
  "approveEvent",
  "approveCustomEvent",
  "approveTask",
  "approveCustomTask",
  "approveExperience",
  "approveCustomExperience",
  "adminHomeFP",
];

// 4
const shopMaintenancePages = ["award", "adminHomeFP"];

// 5
const shopApprovalPages = ["transactionLog", "adminHomeFP"];

// 6
const resumeReviewerPages = [
  "reviewerHome",
  "reviewResume",
  "reivew-inbox",
  "adminHomeFP",
];

// 7
const adminViewPages = [
  "adminHomeFP",
  "reviewerHome",
  "reviewResume",
  "reivew-inbox",
  "award",
  "badge",
  "event",
  "experience",
  "flightPlan",
  "major",
  "lifeAfterTheNest",
  "task",
  "transactionLog",
  "userMaintenance",
  "cliftonStrength",
  "approveEvent",
  "approveCustomEvent",
  "approveTask",
  "approveCustomTask",
  "approveExperience",
  "approveCustomExperience",
];

// 8
const studentViewPages = [
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
  "shop",
  "events",
  "helpfulResources",
  "leaderboard",
  "studentHomeFP",
  "studentFlightPlan",
  "shop",
  "student-events",
  "student-transactions",
  "student-lifeAfterTheNest",
  "student-badges",
];

// 9
const professorViewPages = [
  "professorHomeFP",
  "task",
  "experience",
  "event",
  "flightPlan",
  "badge",
  "approveEvent",
  "approveCustomEvent",
  "approveTask",
  "approveCustomTask",
  "approveExperience",
  "approveCustomExperience",
  "reviewerHome",
  "reviewResume",
  "reivew-inbox",
  "adminHomeFP",
];

router.beforeEach(async (to, from) => {
  const isAuthenticated = !!user.value;
  const permissions = ref([]);
  const userPages = ref([]);

  userPages.value = userPages.value.concat(unrestrictedPages);

  console.log("User:", user.value);

  const currentUser = ref({});

  if (to.name === "login") {
    return true; // Explicitly allow navigation
  }

  // not logged in
  if (!isAuthenticated && to.name !== "login") {
    // TODO: store current page in localStorage (AC #55)
    // TODO: also add condition where it's not the event sign in page (AC #93)
    return { name: "login" };
  }

  if (isAuthenticated) {
    try {
      permissions.value = [];
      const userResponse = await UserServices.getUser(user.value.userId);
      currentUser.value = userResponse.data;
      
      const permissionsResponse = await UserRolePermissionServices.getAllPermissionsForUser(currentUser.value.id);
      permissionsResponse.data.forEach((userPermission) =>
        permissions.value.push(userPermission.permissionId)
      );
      // console.log(permissions.value);

      //rest of auth
      userPages.value = userPages.value.concat(anyRolePages);

      if (permissions.value.includes(1))
        userPages.value = userPages.value.concat(userMaintenancePages);
      if (permissions.value.includes(2))
        userPages.value = userPages.value.concat(flightPlanMaintenancePages);
      if (permissions.value.includes(3))
        userPages.value = userPages.value.concat(flightPlanApprovalPages);
      if (permissions.value.includes(4))
        userPages.value = userPages.value.concat(shopMaintenancePages);
      if (permissions.value.includes(5))
        userPages.value = userPages.value.concat(shopApprovalPages);
      if (permissions.value.includes(6))
        userPages.value = userPages.value.concat(resumeReviewerPages);
      if (permissions.value.includes(7))
        userPages.value = userPages.value.concat(adminViewPages);
      if (permissions.value.includes(8))
        userPages.value = userPages.value.concat(studentViewPages);
      if (permissions.value.includes(9))
        userPages.value = userPages.value.concat(professorViewPages);

      // console.log(userPages.value);

      // routing
      if (!userPages.value.includes(to.name)) {
        console.log("Access denied to page:", to.name);
        return { name: "homeFP" };
      }

      if (to.name === "login") {
        return { name: "homeFP" };
      }

      return true;
    
    } catch (err) {
      console.log("Error:", err);
      return { name: "login" };
    }
  }

  return true;
});

export default router;
