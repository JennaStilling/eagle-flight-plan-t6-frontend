<script setup>
import Utils from "@/config/utils.js";
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const currentUser = ref(null);
const user = ref(null);
const router = useRouter();

onMounted(() => {
    user.value = Utils.getStore("user");
    HandleRoute();
});

const HandleRoute = () => {
    if (user.value != null)
    {
    UserServices.getUser(user.value.userId)
        .then((res) => {
            currentUser.value = res.data;
            // console.log("ID: " + currentUser.value.id);
            // console.log("Student ID: " + currentUser.value.studentId);
            // console.log("Admin ID: " + currentUser.value.adminId);
            // console.log("Reviewer ID: " + currentUser.value.reviewerId);
            let studentId = currentUser.value.studentId;
            let adminId = currentUser.value.adminId;
            let reviewerId = currentUser.value.reviewerId;

            // Note: This is deciding the homepage of the user using the old role syste. This will need to be updated once the new system is in place
            if (studentId != null && adminId == null && reviewerId == null)
                router.push({ name: "studentHomeFP" });
            else if ((adminId != null && studentId == null && reviewerId == null)
                || (studentId != null && reviewerId != null && adminId != null)
                || (studentId != null && adminId != null && reviewerId == null)
                || (reviewerId != null && adminId != null && studentId == null))
                router.push({ name: "adminHomeFP" });
            else 
                console.log("User has not been assigned a role");
        })
        .catch((error) => {
            console.log("error", error);
        });
    }
    else
    {
        router.push({ name: "login" });
    }
    };
</script>

<template>
    <div class="home-page">
        <h1>Welcome to Flight Plan!</h1>
        <p>This page should not be visible</p>
    </div>
</template>

<style scoped>
@import "@/assets/dark-mode.css";

.home-page {
    color: white;
    padding: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
}

.start-button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    border-radius: 7px;
    background-color: #118acb;
    width: 320px;
    height: 73px;
    color: #fff;
    font-size: 24px;
    text-shadow: 0px 4px 6px rgba(0, 0, 0, 0.35);
    cursor: pointer;
}
</style>
