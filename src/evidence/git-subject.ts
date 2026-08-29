import { spawnSync } from "node:child_process";

export interface GitSubject {
  source_revision?: string;
  source_dirty: boolean;
}

export function readGitSubject(root = process.cwd()): GitSubject {
  const revision = spawnSync(
    "git",
    ["-C", root, "rev-parse", "--verify", "HEAD^{commit}"],
    { encoding: "utf8" },
  );
  const status = spawnSync(
    "git",
    ["-C", root, "status", "--porcelain=v1", "--untracked-files=all"],
    { encoding: "utf8" },
  );
  const sourceRevision = revision.status === 0 ? revision.stdout.trim() : "";
  return {
    ...(sourceRevision.match(/^[a-f0-9]{40}$/)
      ? { source_revision: sourceRevision }
      : {}),
    source_dirty: status.status !== 0 || status.stdout.trim().length > 0,
  };
}
