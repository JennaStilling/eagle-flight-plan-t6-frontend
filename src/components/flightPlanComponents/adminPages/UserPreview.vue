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
                            <div>
                                <v-chip v-for="role in specificUserRoles" :key="role.id" class="ma=1" color="primary"
                                    rounded="lg">
                                    {{ formatRole(role.role_type) }}
                                </v-chip>
                                <v-select v-model="roleData.addRole" :items="roleData.roles" label="Role" required
                                    variant="solo"></v-select>
                            </div>
                            <div>
                                <v-select v-model="userData.prefix" :items="userData.prefixes" label="Prefix" required
                                    variant="solo"></v-select>
                                <v-text-field v-model="userData.firstName" :counter="10" label="First Name" required
                                    variant="solo"></v-text-field>
                                <v-text-field v-model="userData.lastName" :counter="10" label="Last Name" required
                                    variant="solo"></v-text-field>
                                <v-text-field v-model="userData.email" :counter="10" label="Email" required
                                    variant="solo"></v-text-field>
                                <v-text-field v-model="userData.phoneNumeber" :counter="10" label="Phone Number"
                                    required variant="solo"></v-text-field>
                            </div>
                            <div v-if="hasRole('student')">
                                <v-text-field v-model="userData.studentId" :counter="10" label="StudentID" required
                                    variant="solo"></v-text-field>
                                <v-text-field v-model="userData.class" :counter="10" label="Class" required
                                    variant="solo"></v-text-field>
                                <v-select v-model="userData.select" :items="userData.items" label="Graduation Date"
                                    required variant="solo"></v-select>
                                <v-text-field v-model="userData.points" label="Points Earned" required
                                    variant="solo"></v-text-field>
                            </div>
                            <div class="d-flex flex-row">
                                <v-btn class="button" variant="elevated" color="#5EC4B6" @click="saveUser">
                                    Save
                                </v-btn>
                                <v-btn class="button" variant="elevated" color="#D9D9D9" @click="cancelEdit">
                                    Cancel
                                </v-btn>
                                <v-btn class="button" variant="elevated" color="#F04E3E" @click="deleteUser">
                                    Delete
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

const emit = defineEmits(['save-user', 'delete-user', 'cancel-edit']);

const roleData = ({
    addRole: props.user.prefix,
    roles: props.roles.map((role) => role.role_type),
    rolesToAdd: null
})

const userData = ({
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

const saveUser = () => {
    emit('save-user', { user: userData, roles: roleData });
};

const deleteUser = () => {
    emit('delete-user', props.user.id);
};

const cancelEdit = () => {
    overlay.value = false;
};

const formatRole = (role) => {
    return role.replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const getSpecificUserRoles = () => {
    specificUserRoles.value = props.userRoles.map(
        (userRole) => props.roles.find((role) => role.id === userRole.roleId));
};

const hasRole = (role) => {
    return specificUserRoles.value.some((userRole) => userRole.role_type === role);
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