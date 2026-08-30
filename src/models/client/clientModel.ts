import mongoose from "mongoose";
import clientSchema, { IClient } from "./clientSchema";

interface ClientInput {
  name: string;
  address: string;
  phone: string;
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
}
interface updateClientPayload {
  name: string;
  address: string;
  phone: string;
  email: string;
  notes: string;
  status: string;
}

export const addClient = async (clientObj: ClientInput): Promise<IClient> => {
  return await new clientSchema(clientObj).save();
};

export const getAllClients = async (): Promise<IClient[]> => {
  return clientSchema.find();
};

export const getClientById = async (id: string): Promise<IClient | null> => {
  return await clientSchema.findById(id);
};

export const updateClientById = async (
  id: string,
  data: updateClientPayload,
) => {
  return clientSchema.updateOne({ _id: id }, { $set: data });
};
