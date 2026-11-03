import type { NextFunction, Request, Response } from "express";
import { generatePassword } from "../helper/generatePassword";
import { comparePassword, hashedPassword } from "../utlis/bcrypt";
import { getRoleById, getRoleByName } from "../models/role/roleModel";
import { AppError } from "../utlis/AppError";
import {
  addUser,
  getAllUsers,
  getUserById,
  getUserbyEmail,
  updateAdditionalPermission,
  updateUserDetailById,
} from "../models/user/userModel";
import { getTeamById, getTeamByName } from "../models/team/teamModel";
import {
  getPermissionById,
  getPermissionsByName,
} from "../models/permission/permissionModel";
import { signJwt } from "../utlis/jwt";

//Create User
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tempPassword = generatePassword();

    const hashPassword = await hashedPassword(tempPassword);

    const userRole = await getRoleByName(req.body.role);
    if (!userRole) {
      throw new AppError("Role Not Found", 404);
    }
    // Only take the fields the form sends; everything else is set here.
    const { name, email, phone } = req.body;
    const userObj = {
      name,
      email,
      phone,
      password: hashPassword,
      roleId: userRole._id,
      mustChangePassword: true,
      additionalPermissions: [],
    };
    const user = await addUser(userObj);

    const { password, ...userDetail } = user.toObject();
    res.json({
      status: "success",
      message: " New staff added successfully with following detail:",
      userDetail,
      tempPassword,
    });
  } catch (error) {
    next(error);
  }
};

//Login User
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await getUserbyEmail(email);
    const isMatched = user
      ? await comparePassword(password, user.password)
      : false;

    if (!user || !isMatched) {
      throw new AppError("Email or password didn't match", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Your account is inactive", 403);
    }

    const role = await getRoleById(user.roleId.toString());
    if (!role) {
      throw new AppError("role not found", 404);
    }

    const accessJWT: string = signJwt({
      email: user.email,
      id: user._id.toString(),
      roleId: user.roleId.toString(),
    });

    const { password: _password, ...userDetail } = user.toObject();
    res.json({
      status: "success",
      message: " login successfull",
      userDetail: {
        ...userDetail,
        role: role.name,
      },
      accessJWT,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const userId = req.userInfo._id.toString();
    const { newPassword } = req.body;
    if (!newPassword) {
      throw new AppError("New password is required", 400);
    }
    const hashPassword = await hashedPassword(newPassword);

    const obj = {
      password: hashPassword,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    };

    await updateUserDetailById(userId, obj);

    res.json({
      status: "success",
      message: "password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
//Get User

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await getAllUsers();

    const allUsers = users.map(({ roleId, ...rest }) => {
      return { ...rest, roleId: roleId?._id, role: roleId?.name };
    });

    res.json({
      status: "success",
      message: "All user fetched",
      allUsers,
    });
  } catch (error) {
    next(error);
  }
};

//Get me

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userInfo) {
      throw new AppError("Unauthorized", 401);
    }
    const userDetail = req.userInfo;
    const role = await getRoleById(userDetail.roleId.toString());
    if (!role) {
      throw new AppError("User role not found", 404);
    }

    res.json({
      status: "success",
      message: "Fetched user detail",
      userDetail: {
        ...userDetail,
        role: role.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

//Update User
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { role, team, ...rest } = req.body;

    let updateObj = { ...rest };
    if (!id) {
      throw new AppError("User id not found", 404);
    }

    if (role) {
      const roleUpdate = await getRoleByName(role);
      if (!roleUpdate) {
        throw new AppError("Role not found", 404);
      }

      updateObj.roleId = roleUpdate._id;
    }

    if (team) {
      const teamUpdate = await getTeamByName(team);
      if (!teamUpdate) {
        throw new AppError("Team not found ", 404);
      }

      updateObj.teamId = teamUpdate._id;
    }

    const result = await updateUserDetailById(id, updateObj);

    if (result.matchedCount === 0) {
      throw new AppError("User not found", 404);
    }

    res.json({
      status: "success",
      message: "user update successfully",
    });
  } catch (error) {
    next(error);
  }
};

//Get single user, with role, team and permission names resolved
export const getUserDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await getUserById(req.params.id as string);
    if (!user) throw new AppError("User not found", 404);

    const role = await getRoleById(user.roleId.toString());
    const team = user.teamId ? await getTeamById(user.teamId.toString()) : null;
    const [rolePermissions, additionalPermissions] = await Promise.all([
      getPermissionById((role?.permissions ?? []).map(String)),
      getPermissionById(user.additionalPermissions.map(String)),
    ]);

    const { password, ...rest } = user.toObject();
    res.json({
      status: "success",
      message: "User detail fetched",
      userDetail: {
        ...rest,
        role: role?.name ?? null,
        team: team ? { _id: team._id, name: team.name } : null,
        rolePermissions: rolePermissions.map((p) => p.name),
        additionalPermissions: additionalPermissions.map((p) => p.name),
      },
    });
  } catch (error) {
    next(error);
  }
};

//update User Permission
export const updateUserPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    // Remove duplicates so the "all found" count check below is accurate.
    const permissionNames: string[] = [
      ...new Set<string>(req.body.permissionNames),
    ];

    const additionalPermissions = await getPermissionsByName(permissionNames);
    if (additionalPermissions.length !== permissionNames.length) {
      throw new AppError("One or more permissions not found", 404);
    }

    const additonalPermissionIds = additionalPermissions.map((p) => p._id);

    const addPermissions = await updateAdditionalPermission(
      id,
      additonalPermissionIds,
    );

    if (!addPermissions) {
      throw new AppError("User not found ", 404);
    }

    res.json({
      status: "success",
      message: "Successfully added additional permissions",
    });
  } catch (error) {
    next(error);
  }
};
