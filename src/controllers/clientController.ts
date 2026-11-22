import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import {
  addClient,
  getAllClients,
  getClientById,
  getClientsByTeam,
  updateClientById,
} from "../models/client/clientModel";
import { getTeamById } from "../models/team/teamModel";
import { getRoleById } from "../models/role/roleModel";
import { IUser } from "../models/user/userSchema";

// Which clients may this user see? undefined = all; otherwise only this team's.
const getClientTeamScope = async (
  user: IUser,
): Promise<{ teamId: string | null } | undefined> => {
  const role = await getRoleById(user.roleId.toString());
  if (role?.name !== "teamLeader") return undefined;
  return { teamId: user.teamId ? user.teamId.toString() : null };
};

// A client's area must be a real, active team.
const assertActiveTeam = async (teamId: string) => {
  const team = await getTeamById(teamId);
  if (!team) throw new AppError("Team not found", 404);
  if (!team.isActive) {
    throw new AppError(`${team.name} is not active`, 409);
  }
};

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const { name, address, phone, email, notes, teamId } = req.body;
    await assertActiveTeam(teamId);

    const obj = {
      name,
      address,
      phone,
      email,
      notes,
      teamId,
      createdBy: req.userInfo._id,
    };

    const client = await addClient(obj);
    res.status(201).json({
      status: "success",
      message: " New Client added successfully with following detail:",
      client,
    });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) throw new AppError("Unauthorized", 401);
    const scope = await getClientTeamScope(req.userInfo);

    const clients = !scope
      ? await getAllClients()
      : scope.teamId
        ? await getClientsByTeam(scope.teamId)
        : []; // team leader without a team: no clients

    res.json({
      status: "success",
      message: "Fetched all clients",
      clients,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleClient = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) throw new AppError("Unauthorized", 401);
    const { id } = req.params;
    const client = await getClientById(id);
    const scope = await getClientTeamScope(req.userInfo);

    // "Not yours" gets the same answer as "not there", so nothing leaks.
    const canSee =
      !scope ||
      (scope.teamId !== null && client?.teamId?.toString() === scope.teamId);
    if (!client || !canSee) {
      throw new AppError("Client doesn't exist", 404);
    }

    res.json({
      status: "success",
      message: "Client detail fetched successfully",
      client,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const updatePayload = req.body;
    if (updatePayload.teamId !== undefined) {
      await assertActiveTeam(updatePayload.teamId);
    }

    const result = await updateClientById(id, updatePayload);

    if (result.matchedCount === 0) throw new AppError("Client not found", 404);

    res.json({
      status: "success",
      message: " Client detal updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
