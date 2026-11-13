import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const seedDemo = process.env.SEED_DEMO === "1";
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Always ensure a first admin exists so you can log in on a fresh install.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@adcommtv.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrator",
      role: "ADMIN",
      passwordHash: await hash(adminPassword),
    },
  });
  console.log(`Admin ready: ${admin.email}`);

  if (!seedDemo) {
    console.log("SEED_DEMO != 1 — skipping demo data.");
    return;
  }

  // Demo team
  const agent = await prisma.user.upsert({
    where: { email: "dev@adcommtv.com" },
    update: {},
    create: {
      email: "dev@adcommtv.com",
      name: "Dev Agent",
      role: "AGENT",
      passwordHash: await hash("dev123"),
    },
  });
  const requester = await prisma.user.upsert({
    where: { email: "user@adcommtv.com" },
    update: {},
    create: {
      email: "user@adcommtv.com",
      name: "Sales User",
      role: "REQUESTER",
      passwordHash: await hash("user123"),
    },
  });

  const proj = await prisma.project.upsert({
    where: { key: "SFDC" },
    update: {},
    create: {
      key: "SFDC",
      name: "Salesforce Core",
      description: "Ongoing admin & development on the main Salesforce org.",
      status: "ACTIVE",
      leadId: agent.id,
    },
  });

  const existing = await prisma.ticket.count();
  if (existing === 0) {
    await prisma.ticket.create({
      data: {
        subject: "Add validation rule on Opportunity close date",
        description:
          "Prevent reps from setting a Close Date in the past on Stage = Closed Won.",
        type: "DEVELOPMENT",
        status: "IN_PROGRESS",
        priority: "HIGH",
        sfComponent: "VALIDATION_RULE",
        sfEnvironment: "Full sandbox",
        deployStatus: "IN_SANDBOX",
        projectId: proj.id,
        requesterId: requester.id,
        assigneeId: agent.id,
        activities: {
          create: [
            { actorId: requester.id, message: "created this item" },
            { actorId: agent.id, message: "assigned to Dev Agent" },
          ],
        },
      },
    });
    await prisma.ticket.create({
      data: {
        subject: "New cadence for inbound hospitality leads",
        description: "Build a 5-touch Sales Engagement cadence for new MDU inbound.",
        type: "REQUEST",
        status: "OPEN",
        priority: "MEDIUM",
        sfComponent: "CONFIG",
        sfEnvironment: "Production",
        projectId: proj.id,
        requesterId: requester.id,
      },
    });
    await prisma.ticket.create({
      data: {
        subject: "Flow error when Account has no billing country",
        description: "Record-triggered flow fails on insert; needs a null check.",
        type: "BUG",
        status: "BACKLOG",
        priority: "URGENT",
        sfComponent: "FLOW",
        sfEnvironment: "Production",
        projectId: proj.id,
        requesterId: requester.id,
      },
    });
    console.log("Seeded demo project + sample work items.");
  }

  console.log("\nDemo logins:");
  console.log("  admin@adcommtv.com / admin123   (Admin)");
  console.log("  dev@adcommtv.com   / dev123     (Agent)");
  console.log("  user@adcommtv.com  / user123    (Requester)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
