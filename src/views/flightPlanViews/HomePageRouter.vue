<script setup>
import Utils from "@/config/utils.js";
import UserServices from "@/services/resumeBuilderServices/userServices.js";
import userRoleServices from "@/services/resumeBuilderServices/userRoleServices";
import roleServices from "@/services/resumeBuilderServices/roleServices";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import InitialLogin from '@/components/flightPlanComponents/InitialLogin.vue'

const currentUser = ref(null);
const allRoles = ref(null);
const roleArray = [];
const user = ref(null);
const router = useRouter();

onMounted(() => {
    user.value = Utils.getStore("user");
    //HandleRoute();
});

const HandleRoute = () => {
    if (user.value != null)
        {
            UserServices.getUser(user.value.userId)
                .then((res) => {
                    currentUser.value = res.data;
                    getUserRole();
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


const getUserRole = () => {
    userRoleServices.getAllUserRoles(currentUser.value.id)
        .then((res) => {
            allRoles.value = res.data;
            checkRoles();
        })
        .catch((error) => {
            console.log("error", error);
        })
}

const checkRoles = () => {
    allRoles.value.forEach(userRole => {
        roleServices.getRole(userRole.id)
            .then((res) => {
                roleArray.push(res.data.role_type);
                routeToHomePage();
            })
            .catch((error) => {
                console.log("error", error);
            })
    });
}

const routeToHomePage = () => {
    if (roleArray.includes('admin')) {
        router.push({ name: "adminHomeFP" });
    }
    else if (roleArray.includes('professor')) {
        router.push({ name: "professorHomeFP" });
    }
    else if (roleArray.includes('student') || roleArray.includes('student_worker')) {
        router.push({ name: "studentHomeFP" });
    }
}

</script>

<template>
    <div class="home-page">
        <InitialLogin></InitialLogin>
    </div>
</template>

<style scoped>
@import "@/assets/dark-mode.css";

.home-page {
    color: black;
    padding: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    padding-top: 15%;
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
