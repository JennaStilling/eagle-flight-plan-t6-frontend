import { defineStore } from "pinia";
import { useRouter } from "vue-router";

export const UserRoles = {
  ADMIN: "admin",
  PROFESSOR: "professor",
  STUDENT: "student",
  STUDENT_WORKER: "studentWorker",
  NONE: null,
};

export const HomePages = {
  ADMIN: "adminHome",
  PROFESSOR: "professorHome",
  STUDENT: "studentHome",
  STUDENT_WORKER: "studentWorkerHome",
  NONE: null,
};

export const useHomePageStore = defineStore("homePage", {
  state: () => {
    return {
      currentHome: HomePages.NONE,
      currentRole: UserRoles.NONE,
    };
  },
  actions: {
    switchView(role, page, router) {
      this.switchHomePage(page);
      this.switchCurrentRole(role);
      this.routeToView(router);
    },
    switchHomePage(page) {
      this.currentHome = page;
    },
    switchCurrentRole(role) {
      this.currentRole = role;
    },
    routeToView(router) {
      switch (this.currentHome) {
        case HomePages.ADMIN:
          router.push({ name: "adminHomeFP" });
          break;
        case HomePages.STUDENT:
          router.push({ name: "studentHomeFP" });
          break;
        case HomePages.STUDENT_WORKER:
          router.push({ name: "studentWorkerHomeFP" });
          break;
        case HomePages.PROFESSOR:
          router.push({ name: "professorHomeFP" });
          break;
      }
    },
  },
  getters: {
    getHomePage: (state) => state.currentHome,
    getCurrentRole: (state) => state.currentRole,
  },
  persist: true,
});
