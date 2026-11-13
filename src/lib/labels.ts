import type {
  TicketStatus,
  Priority,
  Role,
  WorkType,
  SfComponent,
  DeployStatus,
  ProjectStatus,
} from "@prisma/client";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  BACKLOG: "Backlog",
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  BLOCKED: "Blocked",
  DEPLOYED: "Deployed",
  CLOSED: "Closed",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  AGENT: "Agent",
  REQUESTER: "Requester",
};

export const TYPE_LABEL: Record<WorkType, string> = {
  REQUEST: "Request",
  DEVELOPMENT: "Development",
  BUG: "Bug",
  ENHANCEMENT: "Enhancement",
  TASK: "Task",
};

export const SF_COMPONENT_LABEL: Record<SfComponent, string> = {
  APEX: "Apex",
  FLOW: "Flow",
  LWC: "Lightning Web Component",
  AURA: "Aura",
  VALIDATION_RULE: "Validation Rule",
  PERMISSION: "Profiles / Permission Sets",
  REPORT_DASHBOARD: "Reports & Dashboards",
  INTEGRATION: "Integration",
  DATA: "Data",
  CONFIG: "Config (clicks)",
  OTHER: "Other",
};

export const DEPLOY_LABEL: Record<DeployStatus, string> = {
  NOT_STARTED: "Not started",
  IN_SANDBOX: "In sandbox",
  IN_TESTING: "In testing",
  DEPLOYED_PROD: "Deployed to prod",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  DONE: "Done",
};

export const STATUS_STYLE: Record<TicketStatus, string> = {
  BACKLOG: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  OPEN: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  IN_REVIEW: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  BLOCKED: "bg-red-500/15 text-red-300 ring-red-500/30",
  DEPLOYED: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  CLOSED: "bg-zinc-700/40 text-zinc-400 ring-zinc-600/30",
};

export const PRIORITY_STYLE: Record<Priority, string> = {
  LOW: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
  MEDIUM: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  URGENT: "bg-red-500/15 text-red-300 ring-red-500/30",
};

export const TYPE_STYLE: Record<WorkType, string> = {
  REQUEST: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  DEVELOPMENT: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
  BUG: "bg-red-500/15 text-red-300 ring-red-500/30",
  ENHANCEMENT: "bg-teal-500/15 text-teal-300 ring-teal-500/30",
  TASK: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
};

export const PROJECT_STATUS_STYLE: Record<ProjectStatus, string> = {
  PLANNING: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  ON_HOLD: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  DONE: "bg-zinc-700/40 text-zinc-400 ring-zinc-600/30",
};

export const STATUSES: TicketStatus[] = [
  "BACKLOG",
  "OPEN",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "DEPLOYED",
  "CLOSED",
];
export const OPEN_STATUSES: TicketStatus[] = [
  "BACKLOG",
  "OPEN",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
];
export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const WORK_TYPES: WorkType[] = [
  "REQUEST",
  "DEVELOPMENT",
  "BUG",
  "ENHANCEMENT",
  "TASK",
];
export const SF_COMPONENTS: SfComponent[] = [
  "APEX",
  "FLOW",
  "LWC",
  "AURA",
  "VALIDATION_RULE",
  "PERMISSION",
  "REPORT_DASHBOARD",
  "INTEGRATION",
  "DATA",
  "CONFIG",
  "OTHER",
];
export const DEPLOY_STATUSES: DeployStatus[] = [
  "NOT_STARTED",
  "IN_SANDBOX",
  "IN_TESTING",
  "DEPLOYED_PROD",
];
export const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "DONE",
];
