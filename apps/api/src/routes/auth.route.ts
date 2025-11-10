import { Router } from "express";
import { loginHandler,refreshHandler,changePasswordHandler,logoutHandler,sendPasswordResetHandler,resetPasswordHandler,verifyEmailHandler,verifyPasswordResetTokenHandler,verifyPasswordResetLinkHandler,getCurrentUser} from "../controllers/auth.controller";
import authenticate from "../middleware/authenticate";
import { UserRole } from "@tms/shared";

const authRoutes=Router();

authRoutes.post("/login",loginHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/me", authenticate([UserRole.SuperAdmin,UserRole.Admin,UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]),getCurrentUser);
authRoutes.post("/change-password", authenticate([UserRole.SuperAdmin,UserRole.Admin,UserRole.Emp,UserRole.Supervisor,UserRole.SupervisorAdmin]),changePasswordHandler);
authRoutes.post('/password/forgot',sendPasswordResetHandler);
authRoutes.post('/password/reset',resetPasswordHandler);
authRoutes.get('/password/reset', verifyPasswordResetLinkHandler);
authRoutes.get("/email/verify/:code", verifyEmailHandler);
authRoutes.post("/password/reset/verify-token", verifyPasswordResetTokenHandler);





export default authRoutes;