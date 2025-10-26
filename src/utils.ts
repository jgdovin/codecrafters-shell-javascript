import { constants, accessSync } from "fs";

export const hasPermission = (path, mode = constants.X_OK) => {
  try {
    accessSync(path, mode);
    return true;
  } catch {
    return false;
  }
};

export const checkPathForApp = ({
  command,
}: {
  command: string;
}): string | null => {
  const paths = process.env.PATH.split(":");
  for (const path of paths) {
    const filePath = `${path}/${command}`;
    if (hasPermission(filePath)) {
      return filePath;
    }
  }
  return null;
};
