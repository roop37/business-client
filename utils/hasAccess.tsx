type Permission = {
  status: boolean;
  type: string;
};

export const hasAccess = (
  permissions: Permission[],
  requiredPermission: string | null
): boolean => {
  if (requiredPermission === null) {
    return true;
  }

  const permissionAliases: Record<string, string[]> = {
    UpdateHost: ["UpdateHost", "UpdateOrganization", "UpdateBusiness"],
    PayoutManagement: ["PayoutManagement", "PaymentManagement"],
    TeamManagement: ["TeamManagement", "UserManagement"],
  };
  const acceptedTypes = new Set(
    permissionAliases[requiredPermission] ?? [requiredPermission]
  );

  if (permissions.length > 0) {
    const permission = permissions.find(
      (perm) => acceptedTypes.has(perm.type)
    );
    return permission ? permission.status : false;
  }
  return false;
};
