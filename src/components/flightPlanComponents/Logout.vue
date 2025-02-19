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
import { ref, onMounted } from "vue";
import Utils from '@/config/utils.js';

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
    toggleLogout();
};

</script>

<style scoped>
.modal {
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

.modal-header {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    color: #000;
    text-align: center;
    /* font-family: Poppins; */
    font-size: 60px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.cancel-button {
    margin-top: 40px;
    margin-right: 100px;
    width: 120px;
    height: 50px;
    flex-shrink: 0;
    border-radius: 10px;
    background: rgba(32, 32, 32, 0.25);
    color: #FFF;
    text-align: center;
    /* font-family: Poppins; */
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.logout-button {
    margin-top: 40px;
    width: 120px;
    height: 50px;
    flex-shrink: 0;
    border-radius: 10px;
    background: #F04E3E;
    color: #FFF;
    text-align: center;
    /* font-family: Poppins; */
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

</style>