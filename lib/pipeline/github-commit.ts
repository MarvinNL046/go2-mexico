const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'MarvinNL046';
const REPO_NAME = 'go2-mexico';
const BRANCH = 'main';

export interface CommitFile {
  path: string;
  content: string | Buffer;
  encoding: 'utf-8' | 'base64';
}

interface GitHubBlob {
  sha: string;
  url: string;
}

interface GitHubRef {
  object: {
    sha: string;
  };
}

interface GitHubCommit {
  sha: string;
  tree: {
    sha: string;
  };
}

interface GitHubTree {
  sha: string;
  url: string;
}

interface GitHubNewCommit {
  sha: string;
  html_url: string;
}

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN environment variable is not set');
  return token;
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

async function githubFetch<T>(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${GITHUB_API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...githubHeaders(token),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '(unreadable body)');
    throw new Error(
      `GitHub API error ${response.status} at ${path}: ${body}`
    );
  }

  return response.json() as Promise<T>;
}

async function getLatestCommitSha(token: string): Promise<string> {
  const ref = await githubFetch<GitHubRef>(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${BRANCH}`
  );
  return ref.object.sha;
}

async function getTreeSha(token: string, commitSha: string): Promise<string> {
  const commit = await githubFetch<GitHubCommit>(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${commitSha}`
  );
  return commit.tree.sha;
}

async function createBlob(
  token: string,
  file: CommitFile
): Promise<{ path: string; sha: string }> {
  let blobContent: string;
  let blobEncoding: string;

  if (Buffer.isBuffer(file.content)) {
    blobContent = file.content.toString('base64');
    blobEncoding = 'base64';
  } else if (file.encoding === 'base64') {
    blobContent = file.content;
    blobEncoding = 'base64';
  } else {
    blobContent = file.content;
    blobEncoding = 'utf-8';
  }

  const blob = await githubFetch<GitHubBlob>(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`,
    {
      method: 'POST',
      body: JSON.stringify({ content: blobContent, encoding: blobEncoding }),
    }
  );

  return { path: file.path, sha: blob.sha };
}

async function createTree(
  token: string,
  baseTreeSha: string,
  blobs: Array<{ path: string; sha: string }>
): Promise<string> {
  const tree = blobs.map(({ path, sha }) => ({
    path,
    mode: '100644',
    type: 'blob',
    sha,
  }));

  const newTree = await githubFetch<GitHubTree>(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`,
    {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseTreeSha, tree }),
    }
  );

  return newTree.sha;
}

async function createCommit(
  token: string,
  message: string,
  treeSha: string,
  parentSha: string
): Promise<GitHubNewCommit> {
  return githubFetch<GitHubNewCommit>(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha],
      }),
    }
  );
}

async function updateRef(token: string, commitSha: string): Promise<void> {
  await githubFetch(
    token,
    `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${BRANCH}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ sha: commitSha, force: false }),
    }
  );
}

export async function commitFiles(
  files: CommitFile[],
  message: string
): Promise<{ sha: string; url: string }> {
  if (files.length === 0) {
    throw new Error('commitFiles: no files provided');
  }

  const token = getToken();

  console.log(
    `[github-commit] Committing ${files.length} file(s) to ${REPO_OWNER}/${REPO_NAME}@${BRANCH}`
  );

  let latestCommitSha: string;
  try {
    latestCommitSha = await getLatestCommitSha(token);
  } catch (err) {
    const message_ctx = err instanceof Error ? err.message : String(err);
    throw new Error(`[github-commit] Failed to get latest commit SHA: ${message_ctx}`);
  }
  console.log(`[github-commit] Latest commit SHA: ${latestCommitSha}`);

  let baseTreeSha: string;
  try {
    baseTreeSha = await getTreeSha(token, latestCommitSha);
  } catch (err) {
    const message_ctx = err instanceof Error ? err.message : String(err);
    throw new Error(`[github-commit] Failed to get base tree SHA: ${message_ctx}`);
  }
  console.log(`[github-commit] Base tree SHA: ${baseTreeSha}`);

  let blobs: Array<{ path: string; sha: string }>;
  try {
    blobs = await Promise.all(files.map((file) => createBlob(token, file)));
  } catch (err) {
    const message_ctx = err instanceof Error ? err.message : String(err);
    throw new Error(`[github-commit] Failed to create blob(s): ${message_ctx}`);
  }
  console.log(`[github-commit] Created ${blobs.length} blob(s)`);

  let newTreeSha: string;
  try {
    newTreeSha = await createTree(token, baseTreeSha, blobs);
  } catch (err) {
    const message_ctx = err instanceof Error ? err.message : String(err);
    throw new Error(`[github-commit] Failed to create tree: ${message_ctx}`);
  }
  console.log(`[github-commit] New tree SHA: ${newTreeSha}`);

  let newCommit: GitHubNewCommit;
  try {
    newCommit = await createCommit(token, message, newTreeSha, latestCommitSha);
  } catch (err) {
    const message_ctx = err instanceof Error ? err.message : String(err);
    throw new Error(`[github-commit] Failed to create commit: ${message_ctx}`);
  }
  console.log(`[github-commit] New commit SHA: ${newCommit.sha}`);

  try {
    await updateRef(token, newCommit.sha);
  } catch (err) {
    const message_ctx = err instanceof Error ? err.message : String(err);
    throw new Error(`[github-commit] Failed to update ref: ${message_ctx}`);
  }

  console.log(`[github-commit] Successfully pushed commit: ${newCommit.sha}`);

  return { sha: newCommit.sha, url: newCommit.html_url };
}
