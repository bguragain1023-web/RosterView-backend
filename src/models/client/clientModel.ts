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

// { id -> name } for the given client ids. Only the name is fetched.
export const getClientNames = async (
  ids: string[],
): Promise<Map<string, string>> => {
  const clients = await clientSchema
    .find({ _id: { $in: ids } })
    .select("name")
    .lean();
  return new Map(clients.map((c) => [c._id.toString(), c.name]));
};
