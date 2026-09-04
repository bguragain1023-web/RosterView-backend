import teamSchema, { ITeam } from "./teamSchema";

export interface TeamInput {
  name: string;
  normalizedName: string;
  description?: string;
}

export const getTeamByName = (teamName: string): Promise<ITeam | null> => {
  return teamSchema.findOne({ normalizedName: teamName.toLowerCase() });
};

export const addTeam = async (teamObj: TeamInput): Promise<ITeam> => {
  return new teamSchema(teamObj).save();
};

export const getAllTeams = (): Promise<ITeam[]> => {
  return teamSchema.find();
};

export const getTeamById = (teamId: string): Promise<ITeam | null> => {
  return teamSchema.findById(teamId);
};
