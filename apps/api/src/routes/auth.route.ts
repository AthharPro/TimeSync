import { Router } from "express";
import { loginHandler, logoutHandler } from "../controllers/auth.controller";

const authRoutes=Router();

authRoutes.post("/login",loginHandler);
// authRoutes.get("/refresh", refreshHandler); // TODO: Implement refreshHandler
authRoutes.get("/logout", logoutHandler);
// authRoutes.get("/me", authenticate([UserRole.SuperAdmin,UserRole.Admin,UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]),getCurrentUser); // TODO: Implement getCurrentUser
// authRoutes.post("/change-password", authenticate([UserRole.SuperAdmin,UserRole.Admin,UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]),changePasswordHandler); // TODO: Implement changePasswordHandler
// authRoutes.post('/password/forgot',sendPasswordResetHandler); // TODO: Implement sendPasswordResetHandler
// authRoutes.post('/password/reset',resetPasswordHandler); // TODO: Implement resetPasswordHandler
// authRoutes.get('/password/reset', verifyPasswordResetLinkHandler); // TODO: Implement verifyPasswordResetLinkHandler
// authRoutes.get("/email/verify/:code", verifyEmailHandler); // TODO: Implement verifyEmailHandler
// authRoutes.post("/password/reset/verify-token", verifyPasswordResetTokenHandler); // TODO: Implement verifyPasswordResetTokenHandler





export default authRoutes;