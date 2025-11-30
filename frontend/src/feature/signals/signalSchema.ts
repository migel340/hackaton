import { z } from "zod";

export const signalTypes = ["investor", "freelancer", "idea"] as const;
export type SignalType = (typeof signalTypes)[number];

export const categories = [
  "fintech",
  "healthtech",
  "edtech",
  "ecommerce",
  "saas",
  "ai_ml",
  "blockchain",
  "gaming",
  "social",
  "marketplace",
  "iot",
  "cybersecurity",
] as const;

export type Category = (typeof categories)[number];

export const skills = [
  "react",
  "typescript",
  "python",
  "nodejs",
  "java",
  "go",
  "rust",
  "aws",
  "docker",
  "kubernetes",
  "ui_ux",
  "mobile",
  "data_science",
  "devops",
  "backend",
  "frontend",
  "fullstack",
  "marketing",
  "sales",
  "product_management",
] as const;

export type Skill = (typeof skills)[number];

// Inwestor schema
const investorSchema = z.object({
  type: z.literal("investor"),
  title: z.string().min(3, "Tytuł musi mieć minimum 3 znaki"),
  description: z.string().min(10, "Opis musi mieć minimum 10 znaków"),
  budget_min: z.number().min(0, "Minimalna kwota musi być większa od 0"),
  budget_max: z.number().min(0, "Maksymalna kwota musi być większa od 0"),
  categories: z.array(z.enum(categories)).min(1, "Wybierz przynajmniej jedną kategorię"),
}).refine((data) => data.budget_max >= data.budget_min, {
  message: "Maksymalna kwota musi być większa lub równa minimalnej",
  path: ["budget_max"],
});

// Freelancer schema
const freelancerSchema = z.object({
  type: z.literal("freelancer"),
  title: z.string().min(3, "Tytuł musi mieć minimum 3 znaki"),
  description: z.string().min(10, "Opis umiejętności musi mieć minimum 10 znaków"),
  skills: z.array(z.enum(skills)).min(1, "Wybierz przynajmniej jedną umiejętność"),
  categories: z.array(z.enum(categories)).min(1, "Wybierz przynajmniej jedną kategorię"),
  hourly_rate: z.number().min(0, "Stawka godzinowa musi być większa od 0").optional(),
});

// Idea schema
const ideaSchema = z.object({
  type: z.literal("idea"),
  title: z.string().min(3, "Tytuł musi mieć minimum 3 znaki"),
  description: z.string().min(20, "Opis startupu musi mieć minimum 20 znaków"),
  funding_min: z.number().min(0, "Minimalna kwota musi być większa od 0"),
  funding_max: z.number().min(0, "Maksymalna kwota musi być większa od 0"),
  categories: z.array(z.enum(categories)).min(1, "Wybierz przynajmniej jedną kategorię"),
  needed_skills: z.array(z.enum(skills)).min(1, "Wybierz przynajmniej jedną wymaganą umiejętność"),
}).refine((data) => data.funding_max >= data.funding_min, {
  message: "Maksymalna kwota musi być większa lub równa minimalnej",
  path: ["funding_max"],
});

// Discriminated union
export const signalSchema = z.discriminatedUnion("type", [
  investorSchema,
  freelancerSchema,
  ideaSchema,
]);

export type SignalFormData = z.infer<typeof signalSchema>;
export type InvestorFormData = z.infer<typeof investorSchema>;
export type FreelancerFormData = z.infer<typeof freelancerSchema>;
export type IdeaFormData = z.infer<typeof ideaSchema>;

// Labels for UI
export const categoryLabels: Record<(typeof categories)[number], string> = {
  fintech: "FinTech",
  healthtech: "HealthTech",
  edtech: "EdTech",
  ecommerce: "E-commerce",
  saas: "SaaS",
  ai_ml: "AI / ML",
  blockchain: "Blockchain",
  gaming: "Gaming",
  social: "Social Media",
  marketplace: "Marketplace",
  iot: "IoT",
  cybersecurity: "Cybersecurity",
};

export const skillLabels: Record<(typeof skills)[number], string> = {
  react: "React",
  typescript: "TypeScript",
  python: "Python",
  nodejs: "Node.js",
  java: "Java",
  go: "Go",
  rust: "Rust",
  aws: "AWS",
  docker: "Docker",
  kubernetes: "Kubernetes",
  ui_ux: "UI/UX Design",
  mobile: "Mobile Development",
  data_science: "Data Science",
  devops: "DevOps",
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Fullstack",
  marketing: "Marketing",
  sales: "Sales",
  product_management: "Product Management",
};

export const signalTypeLabels: Record<SignalType, string> = {
  investor: "Inwestor",
  freelancer: "Freelancer",
  idea: "Pomysł / Startup",
};
