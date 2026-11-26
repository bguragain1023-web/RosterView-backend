// The demo logins shown on the live demo. Used by the demo seed script and
// by DEMO_MODE, which stops visitors changing these accounts.
import { AppError } from "../utlis/AppError";

export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS = {
  admin: "admin@demo.com",
  coordinator: "coordinator@demo.com",
  teamLeader: "leader@demo.com",
  worker: "worker@demo.com",
};

export const isDemoMode = () => process.env.DEMO_MODE === "true";

export const isDemoAccount = (email: string) =>
  Object.values(DEMO_ACCOUNTS).includes(email.toLowerCase());

// In demo mode, the shared demo logins can't be changed (password, role,
// status, permissions, team), so the demo keeps working for every visitor.
// Does nothing when DEMO_MODE is off or for any other account.
export const assertNotDemoAccount = (email: string) => {
  if (isDemoMode() && isDemoAccount(email)) {
    throw new AppError(
      "This is a shared demo account, so it can't be changed in the demo.",
      403,
    );
  }
};
