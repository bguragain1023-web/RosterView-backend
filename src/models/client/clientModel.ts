import mongoose from "mongoose";
import clientSchema, { IClient } from "./clientSchema";

interface ClientInput {
  name: string;
  address: string;
  phone: string;
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
}

export const addClient = async (clientObj: ClientInput): Promise<IClient> => {
  return await new clientSchema(clientObj).save();
};

export const getAllClients = async (): Promise<IClient[]> => {
  return clientSchema.find();
};
