import { z } from "zod";
import { contactNumberSchema, designationSchema, emailSchema, firstNameSchema, lastNameSchema } from "./main.schema";

export const registerSchema = z.object({
    email: emailSchema,
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    designation: designationSchema,
    contactNumber: contactNumberSchema,
});
