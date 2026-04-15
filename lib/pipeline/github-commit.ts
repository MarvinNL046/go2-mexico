// Commit one or more files to the GitHub repo via the Contents API
// Then triggers a Vercel redeploy via deploy hook (GitHub API commits don't trigger webhooks)
//
// Repo target is resolved from pipeline.config.json (per sister site) so each
// site commits to its own repo. Overridable via env vars on Vercel if needed.

import { loadPipelineConfig } from "./pipeline-config";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
const BRANCH = process.env.PIPELINE_REPO_BRANCH || "main";

function resolveRepo() {
  const cfg = loadPipelineConfig();
  return {
    owner: process.env.PIPELINE_REPO_OWNER || cfg.repoOwner,
    name: process.env.PIPELINE_REPO_NAME || cfg.repoName,
  };
}

export interface FileToCommit {
  path: string;       // e.g. "content/blog/en/thai-food-guide.md"
  content: string;    // File content (utf-8 string or base64 string)
  encoding?: "utf-8" | "base64"; // default: "utf-8"
}

// Commit multiple files in a single commit using the Git Trees API
// Retries up to 3 times on ref update conflicts (e.g. concurrent pushes)
export async function commitFilesToGitHub(
  files: FileToCommit[],
  commitMessage: string
): Promise<{ sha: string; url: string }> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  const { owner, name } = resolveRepo();
  const apiBase = `https://api.github.com/repos/${owner}/${name}`;

  // Create blobs once (they're content-addressed, reusable across retries)
  const blobShas: { path: string; sha: string }[] = [];
  for (const file of files) {
    const blobRes = await fetch(`${apiBase}/git/blobs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: file.encoding === "base64"
          ? file.content
          : Buffer.from(file.content, "utf-8").toString("base64"),
        encoding: "base64",
      }),
    });
    if (!blobRes.ok) {
      throw new Error(`Failed to create blob for ${file.path}: ${await blobRes.text()}`);
    }
    const blobData = await blobRes.json();
    blobShas.push({ path: file.path, sha: blobData.sha });
  }

  // Retry loop: re-read HEAD, create tree+commit, update ref
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // 1. Get the latest commit SHA on main
    const refRes = await fetch(`${apiBase}/git/ref/heads/${BRANCH}`, { headers });
    if (!refRes.ok) throw new Error(`Failed to get ref: ${await refRes.text()}`);
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // 2. Get the tree SHA of the latest commit
    const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, { headers });
    if (!commitRes.ok) throw new Error(`Failed to get commit: ${await commitRes.text()}`);
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Create a new tree
    const treeRes = await fetch(`${apiBase}/git/trees`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: blobShas.map(b => ({
          path: b.path,
          mode: "100644",
          type: "blob",
          sha: b.sha,
        })),
      }),
    });
    if (!treeRes.ok) throw new Error(`Failed to create tree: ${await treeRes.text()}`);
    const treeData = await treeRes.json();

    // 4. Create the commit
    const newCommitRes = await fetch(`${apiBase}/git/commits`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });
    if (!newCommitRes.ok) {
      throw new Error(`Failed to create commit: ${await newCommitRes.text()}`);
    }
    const newCommitData = await newCommitRes.json();

    // 5. Update the branch reference (non-force — fails if HEAD moved)
    const updateRefRes = await fetch(`${apiBase}/git/refs/heads/${BRANCH}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        sha: newCommitData.sha,
      }),
    });

    if (updateRefRes.ok) {
      console.log(`[github-commit] Committed ${files.length} files: ${newCommitData.sha}`);

      // Trigger Vercel redeploy (GitHub API commits don't fire webhooks)
      if (VERCEL_DEPLOY_HOOK) {
        try {
          const hookRes = await fetch(VERCEL_DEPLOY_HOOK, { method: "POST" });
          console.log(`[github-commit] Vercel deploy hook: ${hookRes.status}`);
        } catch (err) {
          console.warn("[github-commit] Deploy hook failed (non-fatal):", err);
        }
      }

      return {
        sha: newCommitData.sha,
        url: newCommitData.html_url,
      };
    }

    // Ref update failed — HEAD moved between step 1 and 5 (concurrent push)
    if (attempt < MAX_RETRIES) {
      console.warn(`[github-commit] Ref update conflict (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
      await new Promise(r => setTimeout(r, 1000 * attempt)); // backoff
    } else {
      throw new Error(`Failed to update ref after ${MAX_RETRIES} attempts: ${await updateRefRes.text()}`);
    }
  }

  throw new Error("Unreachable");
}
