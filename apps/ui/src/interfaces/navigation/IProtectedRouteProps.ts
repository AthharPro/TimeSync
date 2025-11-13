export interface IProtectedRouteProps {
  isAllowed?: boolean;
  requireAuth?: boolean;
  allowedRoles?: string[];
  children: React.ReactNode;
  redirectPath?: string;
}