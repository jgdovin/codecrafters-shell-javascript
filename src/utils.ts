import { constants, accessSync } from "fs";
export const hasPermission = (path, mode = constants.X_OK) => {
  try {
    accessSync(path, mode);
    return true;
  } catch {
    return false;
  }
};
