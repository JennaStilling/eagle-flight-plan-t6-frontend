import UserRoleServices from "@/services/resumeBuilderServices/userRoleServices";
import UserRolePermissionServices from "@/services/flightPlanServices/userRolePermissionServices"
import PermissionServices from "@/services/flightPlanServices/permissionServices";

export async function getPermissions(user) {
    const userRoles = (await UserRoleServices.getAllUserRoles(user.id)).data;
    const userPermissions = [];
    for (const userRole of userRoles) {
        const userRolePermission = ((await UserRolePermissionServices.getAllPermissionsForUser(userRole.id)).data)
        for (const permission of userRolePermission) {
            userPermissions.push((await PermissionServices.getPermission(permission.permissionId)).data);
        }
    }
    return userPermissions;
}

export async function hasStudentViewPermissions(user) {
    const userPermissions = await getPermissions(user);
    return userPermissions.some(permission => permission.type === 'student_view');
}

export async function hasAdminViewPermissions(user) {
    const userPermissions = await getPermissions(user);
    return userPermissions.some(permission => permission.type === 'admin_view');
}