import roleSchema, { IRole } from "./roleSchema";

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[] | "ALL";
}

export const addRoles = async (
  roleObj: Omit<IRole, "_id" | "createdAt" | "updatedAt">,
): Promise<IRole | null> => {
  return roleSchema.findOneAndUpdate({ name: roleObj.name }, roleObj, {
    upsert: true,
    returnDocument: "after",
  });
};
