import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(200, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Enter a valid email address")
    .max(320, "Email is too long"),
  company: z.string().trim().max(200, "Company name is too long").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(5000, "Message is too long (5000 characters max)"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
