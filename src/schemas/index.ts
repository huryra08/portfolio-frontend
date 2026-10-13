import { z } from "zod";

/* ---------- API response schemas ---------- */

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["VISITOR", "ADMIN"]),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  level: z.number().nullable(),
  iconUrl: z.string().nullable(),
  order: z.number(),
  _count: z.object({ projects: z.number() }).optional(),
});

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  liveUrl: z.string().nullable(),
  repoUrl: z.string().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  order: z.number(),
  images: z.array(z.object({ id: z.string(), url: z.string(), caption: z.string().nullable(), order: z.number() })),
  skills: z.array(z.object({ skill: skillSchema })),
});

export const profileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  headline: z.string(),
  bio: z.string(),
  avatarUrl: z.string().nullable(),
  resumeUrl: z.string().nullable(),
  location: z.string().nullable(),
  contactEmail: z.string().nullable(),
  socialLinks: z.array(z.object({ id: z.string(), platform: z.string(), url: z.string(), order: z.number() })),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  order: z.number(),
});

export const messageSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string().nullable(),
  body: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Message = z.infer<typeof messageSchema>;

/* ---------- form schemas ---------- */

const requiredText = (message: string) => z.string().trim().min(1, message);
const optionalUrl = z
  .string()
  .trim()
  .url("Enter a full link, starting with https://")
  .or(z.literal(""));
const wholeNumber = z.number({ invalid_type_error: "Enter a number" }).int("Use a whole number");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const contactSchema = z.object({
  name: requiredText("Tell me your name").max(100, "Keep your name under 100 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().max(150, "Keep the subject under 150 characters"),
  body: z.string().trim().min(10, "Write at least 10 characters").max(2000, "Keep it under 2000 characters"),
});

export const projectFormSchema = z.object({
  title: requiredText("Add a title"),
  slug: z
    .string()
    .trim()
    .min(1, "Add a slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  summary: requiredText("Add a short summary"),
  description: requiredText("Describe the project"),
  thumbnail: optionalUrl,
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  screenshots: z.string(), // one image link per line
  featured: z.boolean(),
  published: z.boolean(),
  order: wholeNumber,
  skillIds: z.array(z.string()),
});

export const skillFormSchema = z.object({
  name: requiredText("Add a skill name"),
  category: requiredText("Add a category, like Frontend"),
  level: wholeNumber.min(1, "Pick a level from 1 to 5").max(5, "Pick a level from 1 to 5"),
  order: wholeNumber,
});

export const experienceFormSchema = z
  .object({
    company: requiredText("Add the company"),
    position: requiredText("Add your position"),
    location: z.string().trim(),
    description: z.string().trim(),
    startDate: z.string().min(1, "Add a start date"),
    endDate: z.string(),
    current: z.boolean(),
    order: wholeNumber,
  })
  .superRefine((value, ctx) => {
    if (!value.current && !value.endDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "Add an end date, or tick \"I work here now\"" });
    }
    if (!value.current && value.endDate && value.startDate && value.endDate < value.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "The end date can't be before the start date" });
    }
  });

export const profileFormSchema = z.object({
  fullName: requiredText("Add your name"),
  headline: requiredText("Add a headline, like Full-Stack Developer"),
  bio: requiredText("Write a short bio"),
  location: z.string().trim(),
  contactEmail: z.string().trim().email("Enter a valid email address").or(z.literal("")),
  avatarUrl: optionalUrl,
  resumeUrl: optionalUrl,
  socialLinks: z.array(
    z.object({
      platform: requiredText("Add a name, like GitHub"),
      url: z.string().trim().url("Enter a full link, starting with https://"),
    }),
  ),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type ContactValues = z.infer<typeof contactSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type SkillFormValues = z.infer<typeof skillFormSchema>;
export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
