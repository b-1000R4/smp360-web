import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const assetRoot = join(repoRoot, "assets", "starch");
const starchApi = "https://api.starch.one";
const companyId = "F7931A";

function extensionFromType(contentType) {
  if (contentType.includes("image/gif")) return "gif";
  if (contentType.includes("image/webp")) return "webp";
  if (contentType.includes("image/jpeg")) return "jpg";
  return "png";
}

async function readExisting(path) {
  try {
    return await readFile(path);
  } catch {
    return null;
  }
}

async function writeIfChanged(path, data) {
  const existing = await readExisting(path);
  const next = Buffer.isBuffer(data) ? data : Buffer.from(data);
  if (existing && Buffer.compare(existing, next) === 0) return false;
  await writeFile(path, next);
  return true;
}

function withoutUpdatedAt(manifest) {
  if (!manifest) return null;
  const { updatedAt, ...rest } = manifest;
  return rest;
}

async function getJson(path) {
  const response = await fetch(`${starchApi}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

async function cacheImage(kind, id) {
  const response = await fetch(`${starchApi}/img/${kind}/${encodeURIComponent(id)}_icon`);
  if (!response.ok) throw new Error(`${kind}/${id} icon returned ${response.status}`);

  const contentType = response.headers.get("content-type") || "image/png";
  const extension = extensionFromType(contentType);
  const fileName = `${kind}-${id}.${extension}`;
  const filePath = join(assetRoot, fileName);
  const bytes = Buffer.from(await response.arrayBuffer());
  const changed = await writeIfChanged(filePath, bytes);

  return {
    changed,
    file: `assets/starch/${fileName}`,
    contentType,
    bytes: bytes.length
  };
}

await mkdir(assetRoot, { recursive: true });

const manifestPath = join(assetRoot, "manifest.json");
const existingManifestBuffer = await readExisting(manifestPath);
const existingManifest = existingManifestBuffer
  ? JSON.parse(existingManifestBuffer.toString("utf8"))
  : null;

const [profile, account, config, roster] = await Promise.all([
  getJson(`/teams/${companyId}/profile`),
  getJson(`/teams/${companyId}/account`),
  getJson(`/teams/${companyId}/config`),
  getJson(`/teams/${companyId}/members`)
]);

const memberIds = Array.isArray(roster.members) ? roster.members : [];
const companyIcon = await cacheImage("team", companyId);
const miners = {};
let changed = companyIcon.changed;

for (const id of memberIds) {
  const icon = await cacheImage("miner", id);
  changed = changed || icon.changed;
  miners[id] = {
    id,
    icon: icon.file,
    contentType: icon.contentType,
    bytes: icon.bytes
  };
}

const manifest = {
  company: {
    id: companyId,
    name: profile.name || "quiet root co.",
    description: profile.description || "",
    balance: account.balance ?? 0,
    signatureId: config.signature_id || "",
    icon: companyIcon.file,
    contentType: companyIcon.contentType,
    bytes: companyIcon.bytes
  },
  members: memberIds,
  miners
};

const materialChanged =
  changed ||
  JSON.stringify(withoutUpdatedAt(existingManifest)) !== JSON.stringify(manifest);
const nextManifest = {
  ...manifest,
  updatedAt: materialChanged
    ? new Date().toISOString()
    : existingManifest?.updatedAt || new Date().toISOString()
};
const manifestChanged = materialChanged
  ? await writeIfChanged(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`)
  : false;

console.log(JSON.stringify({
  companyId,
  members: memberIds,
  changed: changed || manifestChanged,
  updatedAt: nextManifest.updatedAt
}, null, 2));
