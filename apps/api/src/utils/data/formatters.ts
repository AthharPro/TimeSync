export const formatRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'emp': 'employee',
    'supervisor': 'supervisor',
    'supervisorAdmin': 'supervisor admin',
    'admin': 'admin',
    'superAdmin': 'super admin',
  };
  return roleMap[role] || role;
};
