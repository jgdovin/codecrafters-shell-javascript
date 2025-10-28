import { constants, accessSync, readdirSync } from "fs";

export const hasPermission = ({
  path,
  mode = constants.X_OK,
}: {
  path: string;
  mode?: number;
}) => {
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
  if (!process.env.PATH) {
    throw new Error("User has no PATH defined");
  }
  const paths = process.env.PATH.split(":");
  for (const path of paths) {
    const filePath = `${path}/${command}`;
    if (hasPermission({ path: filePath })) {
      return filePath;
    }
  }
  return null;
};

const findPartialMatches = ({
  path,
  line,
}: {
  path: string;
  line: string;
}): string[] => {
  try {
    const files = readdirSync(path);
    return files.filter((file) => file.startsWith(line));
  } catch (e) {
    if (e instanceof Error) {
      // ignore invalid directories for now.
      // process.stderr.write(e.message);
      return [];
    }
    throw new Error("Unknown error");
  }
};

export const checkPathForAutocomplete = ({
  line,
}: {
  line: string;
}): string[] => {
  if (!process.env.PATH) {
    throw new Error("User has no PATH defined");
  }
  const matches: string[] = [];

  const paths = process.env.PATH.split(":");
  for (const path of paths) {
    matches.push(...findPartialMatches({ path, line }));
  }

  return matches;
};
