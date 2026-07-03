import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.string().trim().min(1, "Please enter your email").email("Enter a valid email address"),
  company: z.string().trim().optional(),
  message: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
