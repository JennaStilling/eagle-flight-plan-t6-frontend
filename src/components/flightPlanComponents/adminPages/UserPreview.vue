<template>
    <div class="user-preview" @click="handleClick" @mouseover="handleMouseover" @mouseleave="handleMouseleave">
        <h3>{{ user.prefix }} {{ user.fName }} {{ user.lName }}</h3>
        <v-chip v-for="role in specificUserRoles" :key="role.id" class="ma=1" color="primary" rounded="lg">
            {{ formatRole(role.role_type) }}
        </v-chip>

        <v-btn color="#5EC4B6" class="me-2" @click.stop="quickAction1" rounded="lg">
            Quick Action 1
        </v-btn>
        <v-btn color="#5EC4B6" class="me-2" @click.stop="action2" rounded="lg">
            Action 2
        </v-btn>
        <v-btn color="#5EC4B6" class="me-2" @click.stop="action3" rounded="lg">
            3
        </v-btn>


        <v-overlay v-model="overlay" class="align-center justify-center">
            <v-card class="edit-user">
                <div class="scroll">
                <h3>{{ user.prefix }} {{ user.fName }} {{ user.lName }}</h3>


                <v-sheet class="mx-auto" width="300">

                    <v-form ref="form">
                        <v-select v-model="data.prefix" :items="data.prefixes" label="Prefix" required variant="solo"></v-select>
                        <v-text-field v-model="data.firstName" :counter="10" label="First Name" required variant="solo"></v-text-field>
                        <v-text-field v-model="data.lastName" :counter="10" label="Last Name" required variant="solo"></v-text-field>
                        <v-text-field v-model="data.email" :counter="10" label="Email" required variant="solo"></v-text-field>
                        <v-text-field v-model="data.phoneNumeber" :counter="10" label="Phone Number" required variant="solo"></v-text-field>
                        <v-text-field v-model="data.studentId" :counter="10" label="StudentID" required variant="solo"></v-text-field>
                        <v-text-field v-model="data.class" :counter="10" label="Class" required variant="solo"></v-text-field>
                        <v-select v-model="data.select" :items="data.items" label="Graduation Date" required variant="solo"></v-select>
                        <v-text-field v-model="data.points" label="Points Earned" required variant="solo"></v-text-field>
                        <v-checkbox v-model="data.checkbox" label="Do you agree?" required variant="solo"></v-checkbox>

                        <div class="d-flex flex-column">
                            <v-btn class="mt-4" color="success" block @click="">
                                Validate
                            </v-btn>

                            <v-btn class="mt-4" color="error" block @click="">
                                Reset Form
                            </v-btn>

                            <v-btn class="mt-4" color="warning" block @click="">
                                Reset Validation
                            </v-btn>
                        </div>
                    </v-form>
                </v-sheet>
            </div>
            </v-card>
        </v-overlay>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const props = defineProps({
    user: Object,
    userRoles: Object,
    roles: Object,
});

const data = ({
    prefix: props.user.prefix,
    prefixes: ['Mr. ', 'Mrs. ', 'Ms. ', 'Dr. '],
    firstName: props.user.fName,
    lastName: props.user.lName,
    email: props.user.email,
    phoneNumeber: props.user.phone_number,
    nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be 10 characters or less',
    ],
    studentId: props.user.studentId,
    select: null,
    items: [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4',
    ],
    checkbox: false,
})


console.log(props.user);

const specificUserRoles = ref([]);


onMounted(() => {
    getSpecificUserRoles();
});

const overlay = ref(false);



const handleMouseover = () => {
    //console.log("MOUSE ON");
};

const handleMouseleave = () => {
    //console.log("MOUSE OFF");
};

const handleClick = () => {
    overlay.value = !overlay.value;
    console.log("CLICKED");
};

const quickAction1 = () => {
    console.log("Quick Action 1");
};

const action2 = () => {
    console.log("Action 2");
};

const action3 = () => {
    console.log("Action 3");
};

const formatRole = (role) => {
    return role.replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const getSpecificUserRoles = () => {
    specificUserRoles.value = props.userRoles.map(
        (userRole) => props.roles.find((role) => role.id === userRole.roleId));
};
</script>

<style scoped>
.user-preview {

    background-color: rgba(249, 247, 247, 1);

    width: 100%;
    /* Set width to resemble a piece of paper */
    height: 220px;
    /* Set height */
    padding: 10px;
    /* Padding inside the box */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    /* Subtle shadow */
    margin-bottom: 10px;
    /* Space below the shortcut area */
    border-radius: 20px;
    cursor: pointer;
}

.edit-user {

    background-color: rgb(255, 255, 255);

    width: 70vw;
    /* Set width to resemble a piece of paper */
    height: 70vh;
    /* Set height */
    padding: 10px;
    /* Padding inside the box */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    /* Subtle shadow */
    margin-bottom: 10px;
    /* Space below the shortcut area */
    border-radius: 20px;
    cursor: pointer;
}
.scroll {
    overflow-y: auto;
    max-height: 100%;
}
</style>