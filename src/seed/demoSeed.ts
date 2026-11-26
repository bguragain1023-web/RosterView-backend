// Demo data for the live demo: `yarn seed:demo`
//
// WIPES users, teams, clients, shifts, availability, leave and swaps, then
// creates a fresh demo set. Roles and permissions are kept, so run
// `yarn seed` first. Only runs when DEMO_MODE=true, so it can't wipe a real
// database by accident. All people, phones and addresses are made up.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/dbconfig";
import { getRoleByName } from "../models/role/roleModel";
import { hashedPassword } from "../utlis/bcrypt";
import { addUtcDays, toUtcMidnight } from "../helper/dateOnly";
import { getWeekRange } from "../helper/getWeekRange";
import { calculateTotalHours } from "../helper/calculation";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, isDemoMode } from "../helper/demoAccounts";
import User from "../models/user/userSchema";
import Team from "../models/team/teamSchema";
import Client from "../models/client/clientSchema";
import Shift from "../models/shift/shiftSchema";
import Availability from "../models/user/availabilitySchema";
import LeaveRequest from "../models/user/leaveRequestSchema";
import ShiftSwap from "../models/shift/shiftSwapSchema";

dotenv.config();

const newId = () => new mongoose.Types.ObjectId();
type Id = mongoose.Types.ObjectId;

// ---------- People ----------

interface DemoUser {
  id: Id;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "coordinator" | "teamLeader" | "worker";
  team?: "north" | "south";
}

// `satisfies` checks each entry is a DemoUser but keeps the exact keys, so
// users.sam etc. are known to exist.
const users = {
  admin: { id: newId(), name: "Alex Morgan", email: DEMO_ACCOUNTS.admin, phone: "0400000001", role: "admin" },
  coordinator: { id: newId(), name: "Casey Lee", email: DEMO_ACCOUNTS.coordinator, phone: "0400000002", role: "coordinator" },
  taylor: { id: newId(), name: "Taylor Brooks", email: DEMO_ACCOUNTS.teamLeader, phone: "0400000003", role: "teamLeader", team: "north" },
  jordan: { id: newId(), name: "Jordan Reid", email: "jordan@demo.com", phone: "0400000004", role: "teamLeader", team: "south" },
  sam: { id: newId(), name: "Sam Carter", email: DEMO_ACCOUNTS.worker, phone: "0400000005", role: "worker", team: "north" },
  priya: { id: newId(), name: "Priya Shah", email: "priya@demo.com", phone: "0400000006", role: "worker", team: "north" },
  liam: { id: newId(), name: "Liam O'Brien", email: "liam@demo.com", phone: "0400000007", role: "worker", team: "north" },
  mia: { id: newId(), name: "Mia Chen", email: "mia@demo.com", phone: "0400000008", role: "worker", team: "south" },
  noah: { id: newId(), name: "Noah Davis", email: "noah@demo.com", phone: "0400000009", role: "worker", team: "south" },
  ava: { id: newId(), name: "Ava Wilson", email: "ava@demo.com", phone: "0400000010", role: "worker", team: "south" },
} satisfies Record<string, DemoUser>;

const teams = {
  north: { id: newId(), name: "North Area", description: "Clients in the northern suburbs", leader: users.taylor },
  south: { id: newId(), name: "South Area", description: "Clients in the southern suburbs", leader: users.jordan },
};

const clients = [
  { id: newId(), team: "north", name: "Margaret Hill", phone: "0400000101", address: "14 Banksia Street, Northgate", notes: "Prefers morning visits" },
  { id: newId(), team: "north", name: "Robert Evans", phone: "0400000102", address: "3 Wattle Court, Northgate", notes: "Help with shopping" },
  { id: newId(), team: "north", name: "Helen Ward", phone: "0400000103", address: "27 Gum Tree Road, Hillview", notes: "Evening meal preparation" },
  { id: newId(), team: "south", name: "George Baker", phone: "0400000104", address: "8 Harbour Lane, Southbank", notes: "Uses a walking frame" },
  { id: newId(), team: "south", name: "Dorothy Price", phone: "0400000105", address: "51 Ocean Avenue, Seaview", notes: "Medication reminders" },
  { id: newId(), team: "south", name: "Frank Murray", phone: "0400000106", address: "2 Jetty Street, Southbank", notes: "Social outings" },
] as const;

// Each client's daily slot. Slots don't overlap, so a worker can take any
// other shift on the same day without a clash (handy for swaps).
const SLOTS = [
  { startTime: "08:00", endTime: "12:00", breakMinutes: 0 },
  { startTime: "13:00", endTime: "17:00", breakMinutes: 30 },
  { startTime: "18:00", endTime: "22:00", breakMinutes: 0 },
];

// ---------- Dates ----------

const day = (monday: Date, offset: number) => addUtcDays(monday, offset); // 0 = Mon

// Worked out on every reset (not once when the file loads), so a server
// that runs for weeks still resets to upcoming shifts.
const getDemoDates = () => {
  const today = toUtcMidnight(new Date());
  const thisMonday = getWeekRange(today).weekStart;
  const nextMonday = addUtcDays(thisMonday, 7);
  return {
    today,
    lastMonday: addUtcDays(thisMonday, -7),
    nextMonday,
    liamDayOff: day(nextMonday, 1),
  };
};
type DemoDates = ReturnType<typeof getDemoDates>;

// Availability: Sam never works Saturdays; Liam is off next Tuesday.
const isUnavailable = (worker: DemoUser, date: Date, liamDayOff: Date) =>
  (worker === users.sam && date.getUTCDay() === 6) ||
  (worker === users.liam && date.getTime() === liamDayOff.getTime());

// ---------- Build ----------

const buildShifts = ({ today, lastMonday, liamDayOff }: DemoDates) => {
  const shifts: {
    _id: Id;
    workerId: Id | null;
    clientId: Id;
    location: string;
    date: Date;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    totalHours: number;
    status: "assigned" | "unassigned" | "completed";
    createdBy: Id;
  }[] = [];

  // Last week, this week and next week.
  for (let i = 0; i < 21; i++) {
    const date = day(lastMonday, i);
    const isPast = date < today;

    (["north", "south"] as const).forEach((teamKey) => {
      const teamWorkers: DemoUser[] = Object.values(users).filter(
        (u: DemoUser) => u.role === "worker" && u.team === teamKey,
      );
      const teamClients = clients.filter((c) => c.team === teamKey);

      teamClients.forEach((client, k) => {
        const slot = SLOTS[k];
        if (!slot) return;

        // Rotate workers so each gets a different client each day; skip
        // anyone unavailable that day.
        let worker: DemoUser | null = null;
        for (let t = 0; t < teamWorkers.length; t++) {
          const candidate = teamWorkers[(i + k + t) % teamWorkers.length];
          if (candidate && !isUnavailable(candidate, date, liamDayOff)) {
            worker = candidate;
            break;
          }
        }

        // Leave some upcoming shifts open, so "Needs attention" has work.
        const leaveOpen = !isPast && (i + k) % 4 === 0;
        const assignee = leaveOpen ? null : worker;

        shifts.push({
          _id: newId(),
          workerId: assignee ? assignee.id : null,
          clientId: client.id,
          location: client.address,
          date,
          ...slot,
          totalHours: calculateTotalHours(slot.startTime, slot.endTime, slot.breakMinutes),
          status: !assignee ? "unassigned" : isPast ? "completed" : "assigned",
          createdBy: users.coordinator.id,
        });
      });
    });
  }
  return shifts;
};

// When the demo was last reset, kept in its own small collection (the wipe
// below doesn't touch it).
const demoMeta = () =>
  mongoose.connection.collection<{ _id: string; lastResetAt: Date }>("demometa");
const ONE_DAY = 24 * 60 * 60 * 1000;

// Wipes and refills the demo data. Needs a database connection already.
// Used by `yarn seed:demo` and by the server's daily reset.
export const resetDemoData = async () => {
  if (!isDemoMode()) {
    throw new Error(
      "Refusing to run: this WIPES the database. Set DEMO_MODE=true to use it on a demo database.",
    );
  }

  // Second guard: DEMO_MODE doesn't choose the database, MONGO_URL does. If
  // MONGO_URL is missing it falls back to the real "Rosterview" database, so
  // only wipe a database whose name contains "demo".
  const dbName = mongoose.connection.name;
  if (!dbName.toLowerCase().includes("demo")) {
    throw new Error(
      `Refusing to run: connected to "${dbName}", not a demo database. Point MONGO_URL at a database with "demo" in its name, e.g. .../RosterviewDemo.`,
    );
  }

  const dates = getDemoDates();
  const { nextMonday, liamDayOff } = dates;

  // Roles come from `yarn seed`.
  const roleIds: Record<DemoUser["role"], Id> = {} as Record<DemoUser["role"], Id>;
  for (const name of ["admin", "coordinator", "teamLeader", "worker"] as const) {
    const role = await getRoleByName(name);
    if (!role) throw new Error(`Role "${name}" missing: run "yarn seed" first`);
    roleIds[name] = role._id as Id;
  }

  console.log("Wiping demo collections…");
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Client.deleteMany({}),
    Shift.deleteMany({}),
    Availability.deleteMany({}),
    LeaveRequest.deleteMany({}),
    ShiftSwap.deleteMany({}),
  ]);

  const password = await hashedPassword(DEMO_PASSWORD);

  await User.insertMany(
    Object.values(users).map((u: DemoUser) => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      password,
      roleId: roleIds[u.role],
      teamId: u.team ? teams[u.team].id : undefined,
      status: "active",
      mustChangePassword: false, // shared demo logins must keep working
      additionalPermissions: [],
    })),
  );

  await Team.insertMany(
    Object.values(teams).map((t) => ({
      _id: t.id,
      name: t.name,
      normalizedName: t.name.toLowerCase(),
      description: t.description,
      teamLeaderId: t.leader.id,
      isActive: true,
    })),
  );

  await Client.insertMany(
    clients.map((c) => ({
      _id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address,
      email: `${c.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      notes: c.notes,
      isActive: true,
      teamId: teams[c.team].id,
      createdBy: users.admin.id,
    })),
  );

  const shifts = buildShifts(dates);
  await Shift.insertMany(shifts);

  await Availability.insertMany([
    { workerId: users.sam.id, type: "recurring", dayOfWeek: 6, status: "unavailable" },
    { workerId: users.liam.id, type: "specific", date: liamDayOff, status: "unavailable" },
  ]);

  await LeaveRequest.insertMany([
    {
      workerId: users.liam.id,
      startDate: day(nextMonday, 3), // next Thu–Fri
      endDate: day(nextMonday, 4),
      type: "annual",
      reason: "Family wedding",
      status: "pending",
    },
    {
      workerId: users.sam.id,
      startDate: day(nextMonday, 14), // two weeks later, Mon–Wed
      endDate: day(nextMonday, 16),
      type: "annual",
      reason: "Short holiday",
      status: "pending",
    },
  ]);

  // Swaps, all in next week (one pay cycle, all in the future).
  const nextWeekShift = (worker: DemoUser, skipDays: Date[] = []) =>
    shifts.find(
      (s) =>
        s.workerId?.equals(worker.id) &&
        s.status === "assigned" &&
        s.date >= nextMonday &&
        s.date < addUtcDays(nextMonday, 7) &&
        !skipDays.some((d) => d.getTime() === s.date.getTime()) &&
        // Sam is in every swap and never works Saturdays
        s.date.getUTCDay() !== 6,
    );

  const swaps = [];
  // Waiting for a manager: Sam and Priya both agreed.
  const samShift = nextWeekShift(users.sam);
  const priyaShift = samShift && nextWeekShift(users.priya, [samShift.date]);
  if (samShift && priyaShift) {
    swaps.push({
      requestedShiftId: samShift._id,
      targetedShiftId: priyaShift._id,
      requestedBy: users.sam.id,
      requestedTo: users.priya.id,
      status: "workerAccepted",
    });
  }
  // Waiting for Sam to answer: Liam asked (not on Liam's leave days).
  const liamLeaveDays = [day(nextMonday, 3), day(nextMonday, 4)];
  const liamShift = nextWeekShift(users.liam, liamLeaveDays);
  const samShift2 =
    liamShift &&
    shifts.find(
      (s) =>
        s.workerId?.equals(users.sam.id) &&
        s.status === "assigned" &&
        s.date >= nextMonday &&
        s.date < addUtcDays(nextMonday, 7) &&
        s.date.getTime() !== liamShift.date.getTime() &&
        s._id !== samShift?._id &&
        s._id !== priyaShift?._id &&
        !liamLeaveDays.some((d) => d.getTime() === s.date.getTime()),
    );
  if (liamShift && samShift2) {
    swaps.push({
      requestedShiftId: liamShift._id,
      targetedShiftId: samShift2._id,
      requestedBy: users.liam.id,
      requestedTo: users.sam.id,
      status: "pending",
    });
  }
  await ShiftSwap.insertMany(swaps);

  await demoMeta().updateOne(
    { _id: "lastReset" },
    { $set: { lastResetAt: new Date() } },
    { upsert: true },
  );

  console.log(
    `Demo ready: ${Object.keys(users).length} users, 2 teams, ${clients.length} clients, ` +
      `${shifts.length} shifts, ${swaps.length} swaps. Password for all: ${DEMO_PASSWORD}`,
  );
};

// Resets only if the last reset was over a day ago (or never), so visitors'
// changes and the dates never get more than a day stale. Returns true if it
// reset. Does nothing when DEMO_MODE is off.
export const resetDemoIfStale = async () => {
  if (!isDemoMode()) return false;
  const meta = await demoMeta().findOne({ _id: "lastReset" });
  if (meta && Date.now() - meta.lastResetAt.getTime() < ONE_DAY) return false;
  await resetDemoData();
  return true;
};

// `yarn seed:demo`: only when this file is run directly, not when the server
// imports it.
if (require.main === module) {
  connectDB()
    .then(resetDemoData)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Demo seeding failed:", error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
