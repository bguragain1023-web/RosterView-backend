import permissionSchema, {
  IPermission,
  PermissionAction,
} from "./permissionSchema";

export interface PermissisonInput {
  name: string;
  resource: string;
  action: PermissionAction;
  description?: string;
}

export const addPermissions = async (
  permissionObj: PermissisonInput,
): Promise<IPermission | null> => {
  return permissionSchema.findOneAndUpdate(
    { name: permissionObj.name },
    permissionObj,
    { upsert: true, returnDocument: "after" },
  );
};
