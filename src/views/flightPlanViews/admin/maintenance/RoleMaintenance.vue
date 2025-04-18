<template>
  <v-card flat>
    <div class="title-row">
      <h1 class="table-title">Site Roles</h1>
      <div class="search-filter-button-group">
        <v-text-field v-model="search" label="Search" variant="solo-filled" hide-details single-line density="compact"
          class="search-bar">
          <template v-slot:prepend-inner>
            <Icon icon="material-symbols:search-rounded" width="24" height="24" />
          </template>
        </v-text-field>
        <AddRole :permissions="permissions" @add-role="handleAddRole" />
      </div>
    </div>

    <v-data-table :headers="headers" :items="roles" :search="search">
      <template v-slot:[`item.actions`]="{ item }">
        <EditRole :permissions="permissions" :role="item" @save-role="handleEditRole" />
        <v-btn variant="plain" size="small" @click="deleteRole(item)" :disabled="item.role_type !== 'custom'">
          <Icon icon="material-symbols:delete-outline" width="24" height="24" />
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import "@/assets/generic-stylesheet.css";
import { ref, onMounted } from 'vue';
import UserRoleServices from "@/services/resumeBuilderServices/userRoleServices";
import RoleServices from "@/services/resumeBuilderServices/roleServices";
import RolePermissionServices from '@/services/flightPlanServices/rolePermissionServices';
import PermissionServices from '@/services/flightPlanServices/permissionServices';
import AddRole from '@/components/flightPlanComponents/adminPages/AddRole.vue';
import EditRole from '@/components/flightPlanComponents/adminPages/EditRole.vue';
import { Icon } from "@iconify/vue";

const search = ref('');
const roles = ref([]);
const permissions = ref([]);

const headers = ref([
  { align: 'start', key: 'name', title: 'Role' },
  { key: 'role_type', title: 'Type of Role' },
  { key: 'numberOfPermissions', title: 'Permission Count' },
  { key: 'numberOfUsers', title: 'User Count' },
  { key: 'actions', title: '', sortable: false }
]);

onMounted(async () => {
  await refresh();
});

const refresh = async () => {
  await getAllPermissions();
  await getAllRoles();
}

const getAllRoles = async () => {
  roles.value = [];
  const allRoles = (await RoleServices.getAllRoles()).data;
  for (const role of allRoles) {
    const rolePermissions = (await RolePermissionServices.getRoleRolePermission(role.id)).data;
    const userRoles = (await UserRoleServices.getAllRoleUserRoles(role.id)).data;
    roles.value.push({
      ...role,
      permissions: rolePermissions.map((rolePermission) => permissions.value.find((permission) => permission.id === rolePermission.permissionId)),
      numberOfPermissions: rolePermissions.length,
      numberOfUsers: userRoles.length,
    })
  }
}

const getAllPermissions = async () => {
  permissions.value = (await PermissionServices.getAllPermissions()).data;
}

const handleAddRole = async ({ roleData: role, permissionsData: permissions }) => {
  role = (await RoleServices.createRole(role)).data;
  for (const permission of permissions) {
    const data = {
      roleId: role.id,
      permissionId: permission.id,
    }
    RolePermissionServices.createRolePermission(data);
  }
  await refresh();
}

const handleEditRole = async ({ roleData: role, permissionsData: permissions }) => {
  await RoleServices.updateRole(role.id, role);
  const oldPermissions = roles.value.find((r) => r.id === role.id).permissions;
  for (const permission of oldPermissions) {
    if (permissions.includes(permission)) continue;
    await RolePermissionServices.deleteRolePermissionByIds(role.id, permission.id)
  }
  for (const permission of permissions) {
    if (oldPermissions.includes(permission)) continue;
    const data = {
      roleId: role.id,
      permissionId: permission.id,
    }
    RolePermissionServices.createRolePermission(data);
  }
  await refresh();
}

const deleteRole = async (role) => {
  if (role.role_type === 'custom') {
    await RoleServices.deleteRole(role.id);
    refresh();
  }
  else {
    alert("You cannot delete this role as it is a system role.");
  }
}
</script>