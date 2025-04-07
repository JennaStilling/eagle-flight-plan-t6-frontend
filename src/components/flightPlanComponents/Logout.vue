<template>
    <div class="modal">
        <div class="modal-content">
            <span @click="toggleLogout()" class="close">&times;</span>

            <div class="modal-header">
                <p style="font-weight: bold; font-size: 30px;">Do you want to LOG OUT?</p>

                <div> 
                    <button type="button" @click="cancel" class="cancel-button">
                        CANCEL
                    </button>
                    <button type="button" @click="logout" class="logout-button">
                        LOG OUT
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref, onMounted } from "vue";
import Utils from '@/config/utils.js';
import { UserRoles, HomePages, useHomePageStore } from '@/store/homePageStore';
const homeStore = useHomePageStore();

const emit = defineEmits(["toggleLogout", "signOut"]);

const user = ref(null);

onMounted(() => {
    user.value = Utils.getStore("user");
});

const toggleLogout = () => {
    emit("toggleLogout");
}

const cancel = () => {
    toggleLogout();
}

const logout = () => {
    emit("signOut");
    homeStore.switchView(UserRoles.NONE, HomePages.NONE);
    toggleLogout();
};

</script>

<style scoped>
.modal { /* Same as in AdminHome.vue*/
    width: 100%;
    height: 100%;
    flex-shrink: 0;
}

.modal-content {
    width: 900px;
    height: 250px;
    max-width: 55%;
    flex-shrink: 0;
    border-radius: 10px;
    background: #FFF;
}

.modal-header { /*done*/
    height: 100%;
    flex-shrink: 0;
    color: #000;
    text-align: center;
    font-size: 60px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
</style>