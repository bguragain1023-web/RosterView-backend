import { connectDB } from "../config/dbconfig";
import {
  addPermissions,
  PermissisonInput,
} from "../models/permission/permissionModel";
import dotenv from "dotenv";
import { addRoles } from "../models/role/roleModel";
import Permission from "../models/permission/permissionSchema";

interface RoleSeedInput {
  name: string;
  description?: string;
  permissions: string[] | "ALL";
}

dotenv.config();

const permissions: PermissisonInput[] = [
  {
    name: "user:create",
    resource: "user",
    action: "create",
    description: "Create a new staff account",
  },
  {
    name: "user:read",
    resource: "user",
    action: "read",
    description: "Read  staff data",
  },
  {
    name: "user:update",
    resource: "user",
    action: "update",
    description: "Update user detail ",
  },

  {
    name: "team:create",
    resource: "team",
    action: "create",
  },
  {
    name: "team:read",
    resource: "team",
    action: "read",
  },
  {
    name: "team:update",
    resource: "team",
    action: "update",
  },

  {
    name: "roster:read",
    resource: "shift",
    action: "read",
    description: "View roaster",
  },
  {
    name: "roster:create",
    resource: "shift",
    action: "create",
    description: "Create new shift",
  },
  {
    name: "roster:update",
    resource: "shift",
    action: "update",
    description: "Update roster ",
  },

  {
    name: "roster:assign",
    resource: "shift",
    action: "assign",
    description: "Assign staff to shift",
  },
  {
    name: "availability:read",
    resource: "availability",
    action: "read",
    description: "View Worker Availability",
  },

  {
    name: "availability:update",
    resource: "availability",
    action: "update",
    description: "Update worker Availability",
  },
  {
    name: "leave:create",
    resource: "leaveRequest",
    action: "create",
    description: "Make a leave request",
  },
  {
    name: "leave:read",
    resource: "leaveRequest",
    action: "read",
    description: "View Leave Request",
  },

  {
    name: "leave:approve",
    resource: "leaveRequest",
    action: "approve",
    description: "Approve Leave Request",
  },
  {
    name: "swap:create",
    resource: "shiftSwap",
    action: "create",
    description: "Create shift swap request",
  },
  {
    name: "swap:read",
    resource: "shiftSwap",
    action: "read",
    description: "View shift swap request",
  },
  {
    name: "swap:approve",
    resource: "shiftSwap",
    action: "approve",
    description: "Approve/Reject shift swap request",
  },

  {
    name: "incident:create",
    resource: "incidentReport",
    action: "create",
    description: "Create Incident report",
  },
  {
    name: "incident:read",
    resource: "incidentReport",
    action: "read",
    description: "Read Incident report",
  },
  {
    name: "incident:review",
    resource: "incidentReport",
    action: "review",
    description: "Review Incident report",
  },
];
const roles: RoleSeedInput[] = [
  {
    name: "admin",
    description: "Full access to all system features",
    permissions: "ALL",
  },

  {
    name: "coordinator",
    description:
      "Manages rosters, staff assignments, conflicts and shift swaps",
    permissions: [
      "user:read",

      "team:read",

      "roster:read",
      "roster:create",
      "roster:update",
      "roster:assign",

      "availability:read",

      "leave:read",
      "leave:approve",

      "swap:read",
      "swap:approve",

      "incident:read",
      "incident:review",
    ],
  },

  {
    name: "teamLeader",
    description: "Manages workers within their assigned team",
    permissions: [
      "roster:read",

      "availability:read",

      "leave:read",
      "leave:approve",

      "swap:read",
      "swap:approve",

      "incident:create",
      "incident:read",
    ],
  },

  {
    name: "worker",
    description:
      "Access to personal roster, availability, shift swaps and incident reporting",
    permissions: [
      "roster:read",

      "availability:read",
      "availability:update",

      "swap:create",

      "incident:create",
    ],
  },
];

const seedPermissions = async () => {
  try {
    for (const p of permissions) {
      await addPermissions(p);
    }

    console.log("seeding permission completed");
  } catch (error) {
    console.error("error seeding permission:", error);
    process.exit(1);
  }
};

const seedRoles = async () => {
  try {
    for (const r of roles) {
      if (r.permissions === "ALL") {
        const allPermissions = await Permission.find();

        const permissionIds = allPermissions.map((p) => p._id);

        const { permissions, ...rest } = r;

        const roleObj = {
          ...rest,
          permissions: permissionIds,
        };
        await addRoles(roleObj);
      } else {
        const allowedPermission = await Permission.find({
          name: { $in: r.permissions },
        });

        const permissionIds = allowedPermission.map((p) => p._id);

        const { permissions, ...rest } = r;

        const roleObj = {
          ...rest,
          permissions: permissionIds,
        };
        await addRoles(roleObj);
      }
    }
    console.log("seeding roles completed");
  } catch (error) {
    console.error("error seeding roles:", error);
    process.exit(1);
  }
};

const seed = async () => {
  try {
    await connectDB();
    await seedPermissions();
    await seedRoles();

    console.log("Database seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seed();
