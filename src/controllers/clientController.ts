import { NextFunction, Request, Response } from "express";
import { AppError } from "../utlis/AppError";
import { addClient, getAllClients } from "../models/client/clientModel";

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const { name, address, phone, notes } = req.body;

    const obj = {
      name,
      address,
      phone,
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
