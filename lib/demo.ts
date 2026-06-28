// Server-side context for the no-login demo. A random visitor can run a real
// audit + A/B test on Vela's own public repo WITHOUT signing in to GitHub: the
// demo simply acts as the repo owner (us), reusing the owner's stored OAuth
// token + GitHub App installation. The repo is hard-coded, so an anonymous
// caller can only ever touch our own demo repo — never anyone else's.

import { db } from "@/lib/db";
import { newSdkKey } from "@/lib/sdk-key";

export const DEMO_REPO_FULL_NAME = "phamphamh/Vela";
export const DEMO_REPO_URL = "https://github.com/phamphamh/Vela";
export const DEMO_BRANCH = "main";
// The GitHub login that owns the demo repo; the demo runs as this user.
const DEMO_OWNER_LOGIN = "phamphamh";

export type DemoContext = {
  /** Owner's GitHub OAuth token — reads the repo + resolves the App installation. */
  token: string;
  project: {
    id: string;
    repoFullName: string;
    defaultBranch: string;
    sdkKey: string | null;
    private: boolean;
  };
};

/**
 * Resolve the demo's server-side context: the owner's GitHub token and a Project
 * row for the demo repo (created on first use). Throws if the owner hasn't
 * connected their GitHub account yet (one-time setup on our side).
 */
export async function getDemoContext(): Promise<DemoContext> {
  const account = await db.account.findFirst({
    where: {
      providerId: "github",
      user: { email: { contains: DEMO_OWNER_LOGIN } },
    },
    select: { accessToken: true, userId: true },
  });
  if (!account?.accessToken) {
    throw new Error(
      "Demo is not configured: the demo repo owner hasn't connected GitHub.",
    );
  }

  const project = await db.project.upsert({
    where: {
      userId_repoFullName: {
        userId: account.userId,
        repoFullName: DEMO_REPO_FULL_NAME,
      },
    },
    create: {
      userId: account.userId,
      name: "Vela",
      repoFullName: DEMO_REPO_FULL_NAME,
      repoUrl: DEMO_REPO_URL,
      defaultBranch: DEMO_BRANCH,
      private: false,
      sdkKey: newSdkKey(),
    },
    update: {},
    select: {
      id: true,
      repoFullName: true,
      defaultBranch: true,
      sdkKey: true,
      private: true,
    },
  });

  return { token: account.accessToken, project };
}
