import { IShift } from "../models/shift/shiftSchema";
import { getClientNames } from "../models/client/clientModel";
import { getUserNames } from "../models/user/userModel";

// Add clientName and workerName to each shift, so callers without access to
// the full client/user lists (e.g. workers) can still show names.
// Two queries in total, however many shifts there are.
export const withNames = async (shifts: IShift[]) => {
  const clientIds = [...new Set(shifts.map((s) => s.clientId.toString()))];
  const workerIds = [
    ...new Set(
      shifts.flatMap((s) => (s.workerId ? [s.workerId.toString()] : [])),
    ),
  ];

  const [clientNames, workerNames] = await Promise.all([
    getClientNames(clientIds),
    getUserNames(workerIds),
  ]);

  return shifts.map((s) => ({
    ...s.toObject(),
    clientName: clientNames.get(s.clientId.toString()) ?? null,
    workerName: s.workerId
      ? (workerNames.get(s.workerId.toString()) ?? null)
      : null,
  }));
};
