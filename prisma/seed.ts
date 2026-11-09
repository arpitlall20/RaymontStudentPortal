import {
  ApplicationStatus,
  ChargeType,
  MaintenanceCategory,
  MaintenanceStatus,
  PrismaClient,
  ResidentStatus,
  Role,
  RoomType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.building.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.feePlan.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mealPlan.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const mealPlan = await prisma.mealPlan.create({
    data: {
      name: "Fully Catered",
      description: "Breakfast, lunch, and dinner included during term.",
    },
  });

  const feePlan = await prisma.feePlan.create({
    data: {
      name: "2026 Full Year Residential",
      academicYear: "2026",
      termFee: 18500,
      deposit: 1000,
      mealFee: 4500,
      description: "Room, meals, and college program fees for the academic year.",
      active: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@raymont.local",
      name: "College Admin",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const buildings = await Promise.all([
    prisma.building.create({
      data: { name: "West Wing", code: "WEST", floors: 3 },
    }),
    prisma.building.create({
      data: { name: "East Wing", code: "EAST", floors: 3 },
    }),
    prisma.building.create({
      data: { name: "North House", code: "NORTH", floors: 2 },
    }),
  ]);

  const beds: { id: string; roomId: string; label: string }[] = [];
  for (const building of buildings) {
    const roomsPerFloor = building.code === "NORTH" ? 6 : 8;
    for (let floor = 1; floor <= building.floors; floor++) {
      for (let n = 1; n <= roomsPerFloor; n++) {
        const roomType =
          n % 5 === 0 ? RoomType.DOUBLE : n % 7 === 0 ? RoomType.TWIN : RoomType.SINGLE;
        const capacity = roomType === RoomType.SINGLE ? 1 : 2;
        const room = await prisma.room.create({
          data: {
            buildingId: building.id,
            number: `${floor}${String(n).padStart(2, "0")}`,
            floor,
            roomType,
            capacity,
            beds: {
              create: Array.from({ length: capacity }, (_, i) => ({
                label: String.fromCharCode(65 + i),
              })),
            },
          },
          include: { beds: true },
        });
        beds.push(...room.beds);
      }
    }
  }

  const studentSpecs = [
    {
      email: "student@raymont.local",
      name: "Alex Chen",
      studentId: "S1001",
      university: "University of Queensland",
      course: "Bachelor of Engineering",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.7,
    },
    {
      email: "jordan.smith@raymont.local",
      name: "Jordan Smith",
      studentId: "S1002",
      university: "QUT",
      course: "Bachelor of Business",
      status: ResidentStatus.ACTIVE,
      paidRatio: 1,
    },
    {
      email: "sam.nguyen@raymont.local",
      name: "Sam Nguyen",
      studentId: "S1003",
      university: "Griffith University",
      course: "Bachelor of IT",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.4,
    },
    {
      email: "taylor.brooks@raymont.local",
      name: "Taylor Brooks",
      studentId: "S1004",
      university: "University of Queensland",
      course: "Bachelor of Arts",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.85,
    },
    {
      email: "riley.patel@raymont.local",
      name: "Riley Patel",
      studentId: "S1005",
      university: "QUT",
      course: "Bachelor of Science",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.55,
    },
    {
      email: "morgan.lee@raymont.local",
      name: "Morgan Lee",
      studentId: "S1006",
      university: "University of Queensland",
      course: "Bachelor of Law",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.9,
    },
    {
      email: "casey.wong@raymont.local",
      name: "Casey Wong",
      studentId: "S1007",
      university: "Griffith University",
      course: "Bachelor of Education",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.3,
    },
    {
      email: "avery.khan@raymont.local",
      name: "Avery Khan",
      studentId: "S1008",
      university: "University of Queensland",
      course: "Bachelor of Commerce",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.6,
    },
    {
      email: "jamie.foster@raymont.local",
      name: "Jamie Foster",
      studentId: "S1009",
      university: "QUT",
      course: "Bachelor of Design",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.75,
    },
    {
      email: "harper.diaz@raymont.local",
      name: "Harper Diaz",
      studentId: "S1010",
      university: "University of Queensland",
      course: "Bachelor of Biomedical Science",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.5,
    },
    {
      email: "quinn.osborne@raymont.local",
      name: "Quinn Osborne",
      studentId: "S1011",
      university: "Griffith University",
      course: "Bachelor of Psychology",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.2,
    },
    {
      email: "drew.murphy@raymont.local",
      name: "Drew Murphy",
      studentId: "S1012",
      university: "QUT",
      course: "Bachelor of Architecture",
      status: ResidentStatus.ACTIVE,
      paidRatio: 0.95,
    },
    {
      email: "applicant1@raymont.local",
      name: "Nora Ellis",
      studentId: null,
      university: "University of Queensland",
      course: "Bachelor of Arts",
      status: ResidentStatus.APPLICANT,
      paidRatio: 0,
    },
    {
      email: "applicant2@raymont.local",
      name: "Blake Rivera",
      studentId: null,
      university: "QUT",
      course: "Bachelor of Engineering",
      status: ResidentStatus.APPLICANT,
      paidRatio: 0,
    },
    {
      email: "offered@raymont.local",
      name: "Cameron Wells",
      studentId: null,
      university: "Griffith University",
      course: "Bachelor of Nursing",
      status: ResidentStatus.OFFERED,
      paidRatio: 0,
    },
  ];

  const residents = [];
  for (const spec of studentSpecs) {
    const user = await prisma.user.create({
      data: {
        email: spec.email,
        name: spec.name,
        role: Role.STUDENT,
        passwordHash,
        resident: {
          create: {
            studentId: spec.studentId,
            phone: "04" + String(Math.floor(10000000 + Math.random() * 89999999)),
            university: spec.university,
            course: spec.course,
            emergencyName: "Emergency Contact",
            emergencyPhone: "0400000000",
            status: spec.status,
            mealPlanId: mealPlan.id,
            dateOfBirth: new Date("2004-05-15"),
          },
        },
      },
      include: { resident: true },
    });
    residents.push({ user, spec });
  }

  const activeResidents = residents.filter((r) => r.spec.status === ResidentStatus.ACTIVE);
  for (let i = 0; i < activeResidents.length; i++) {
    const { user, spec } = activeResidents[i];
    const bed = beds[i];
    await prisma.allocation.create({
      data: {
        residentId: user.resident!.id,
        bedId: bed.id,
        term: "2026 Full Year",
        checkIn: new Date("2026-02-15"),
        active: true,
      },
    });

    const termTotal = Number(feePlan.termFee) + Number(feePlan.mealFee);
    await prisma.charge.createMany({
      data: [
        {
          residentId: user.resident!.id,
          type: ChargeType.DEPOSIT,
          description: "Enrolment deposit",
          amount: feePlan.deposit,
          dueDate: new Date("2025-12-01"),
          createdById: admin.id,
        },
        {
          residentId: user.resident!.id,
          type: ChargeType.TERM_FEES,
          description: "2026 residential term fees",
          amount: feePlan.termFee,
          dueDate: new Date("2026-02-15"),
          createdById: admin.id,
        },
        {
          residentId: user.resident!.id,
          type: ChargeType.MEAL_PLAN,
          description: "Fully catered meal plan",
          amount: feePlan.mealFee,
          dueDate: new Date("2026-02-15"),
          createdById: admin.id,
        },
      ],
    });

    const payable = Number(feePlan.deposit) + termTotal;
    const paid = Math.round(payable * spec.paidRatio * 100) / 100;
    if (paid > 0) {
      await prisma.payment.create({
        data: {
          residentId: user.resident!.id,
          amount: paid,
          method: paid === payable ? "BANK_TRANSFER" : "PORTAL",
          reference: `PAY-${1000 + i}`,
          note: "Seeded payment",
          createdById: admin.id,
        },
      });
    }
  }

  // Applications
  const applicant1 = residents.find((r) => r.spec.email === "applicant1@raymont.local")!;
  const applicant2 = residents.find((r) => r.spec.email === "applicant2@raymont.local")!;
  const offered = residents.find((r) => r.spec.email === "offered@raymont.local")!;

  await prisma.application.create({
    data: {
      residentId: applicant1.user.resident!.id,
      academicYear: "2026",
      term: "Full Year",
      status: ApplicationStatus.SUBMITTED,
      preferredRoomType: RoomType.SINGLE,
      notes: "Prefer quiet study environment.",
    },
  });

  await prisma.application.create({
    data: {
      residentId: applicant2.user.resident!.id,
      academicYear: "2026",
      term: "Full Year",
      status: ApplicationStatus.INTERVIEW,
      preferredRoomType: RoomType.DOUBLE,
      notes: "Interested in sports programs.",
      interviewAt: new Date("2026-01-20T10:00:00+10:00"),
      staffNotes: "Interview scheduled with Deputy Principal.",
    },
  });

  await prisma.application.create({
    data: {
      residentId: offered.user.resident!.id,
      academicYear: "2026",
      term: "Full Year",
      status: ApplicationStatus.OFFERED,
      preferredRoomType: RoomType.SINGLE,
      offeredAt: new Date("2026-01-05"),
      staffNotes: "Offer issued — awaiting deposit.",
    },
  });

  await prisma.charge.create({
    data: {
      residentId: offered.user.resident!.id,
      type: ChargeType.DEPOSIT,
      description: "Offer acceptance deposit",
      amount: feePlan.deposit,
      dueDate: new Date("2026-01-20"),
      createdById: admin.id,
    },
  });

  // Maintenance
  const alex = activeResidents[0];
  const sam = activeResidents[2];
  await prisma.maintenanceRequest.createMany({
    data: [
      {
        residentId: alex.user.resident!.id,
        category: MaintenanceCategory.PLUMBING,
        title: "Leaking tap in bathroom",
        description: "The basin tap drips continuously overnight.",
        status: MaintenanceStatus.OPEN,
      },
      {
        residentId: sam.user.resident!.id,
        category: MaintenanceCategory.ELECTRICAL,
        title: "Desk lamp power point not working",
        description: "Left-side wall outlet near the desk has no power.",
        status: MaintenanceStatus.IN_PROGRESS,
        staffNotes: "Electrician booked for Thursday.",
      },
      {
        residentId: activeResidents[4].user.resident!.id,
        category: MaintenanceCategory.FURNITURE,
        title: "Wardrobe door sticking",
        description: "Right wardrobe door scrapes the frame.",
        status: MaintenanceStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "Welcome to Semester 1, 2026",
        body: "Orientation week runs 10–14 February. Please collect your room keys from the College office between 9am and 4pm.",
        audience: "ALL",
        published: true,
      },
      {
        title: "Quiet Hours Reminder",
        body: "Quiet hours are 10pm–7am Sunday to Thursday, and 11pm–8am Friday and Saturday. Thank you for being considerate of your neighbours.",
        audience: "STUDENTS",
        published: true,
      },
      {
        title: "Staff briefing: fire drill",
        body: "Fire drill scheduled for next Wednesday at 10:30am. Please review evacuation routes before the drill.",
        audience: "STAFF",
        published: true,
      },
    ],
  });

  console.log("Seed complete");
  console.log("Admin: admin@raymont.local / password123");
  console.log("Student: student@raymont.local / password123");
  console.log(`Beds created: ${beds.length}`);
  console.log(`Active residents allocated: ${activeResidents.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
