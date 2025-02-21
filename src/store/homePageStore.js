import {defineStore} from "pinia";

export const useHomePageStore = defineStore("homePage", {
    state: () => {
        return { 
            currentHome: "student",
            currentRole: "student",
        };
    },
    actions: {
        switchView(role, page) {
            this.switchHomePage(page);
            this.switchCurrentRole(role);
        },
        switchHomePage(page) {
            this.currentHome = page;
        },
        switchCurrentRole(role) {
            this.currentRole = role;
        }
    },
    getters: {
        getHomePage: (state) => state.currentHome,
        getCurrentRole: (state) => state.currentRole,
    },
    persist: true,
});