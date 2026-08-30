import { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import {
  addClient,
  getAllClients,
  getClientById,
  updateClientById,
} from "../models/client/clientModel";

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const { name, address, phone, email, notes } = req.body;

    const obj = {
      name,
      address,
      phone,
      email,
      notes,
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
    const clients = await getAllClients();

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
    const { id } = req.params;
    const client = await getClientById(id);

    if (!client) {
      throw new AppError("Client doesn't exist", 400);
    }

    res.status(201).json({
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

    const result = await updateClientById(id, updatePayload);

    if (result.matchedCount === 0) throw new AppError("User not found ", 404);

    res.json({
      status: "success",
      message: " Client detal updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
