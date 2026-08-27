import teamSchema, { ITeam } from "./teamSchema";

export const getTeamByName = (teamName: string): Promise<ITeam | null> => {
  return teamSchema.findOne({ name: teamName });
};
