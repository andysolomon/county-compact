import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowPath = join(repositoryRoot, ".arc/workflows/county-compact-issues/workflow.yaml");
const ganttPath = join(repositoryRoot, "docs/workflows/county-compact-issues/gantt.mmd");
const progressPath = join(repositoryRoot, "docs/workflows/county-compact-issues/progress.txt");
const workflowSource = ".arc/workflows/county-compact-issues/workflow.yaml";

function fail(message) {
  throw new Error(message);
}

function checkoutArgument(argumentsList) {
  const flagIndex = argumentsList.indexOf("--arc-checkout");
  if (flagIndex >= 0) return argumentsList[flagIndex + 1];
  return argumentsList[0];
}

const checkoutArgumentValue = checkoutArgument(process.argv.slice(2));
if (!checkoutArgumentValue) {
  fail("Usage: node scripts/render-workflow.mjs --arc-checkout <arc-pi-gantt-workflow-checkout>");
}

const checkoutPath = resolve(checkoutArgumentValue);
const core = await import(
  pathToFileURL(join(checkoutPath, "packages/workflow-core/src/index.ts")).href
);
const requireFromCheckout = createRequire(
  pathToFileURL(join(checkoutPath, "package.json")).href,
);
const { parseDocument } = requireFromCheckout("yaml");

const source = await readFile(workflowPath, "utf8");
const document = parseDocument(source, {
  logLevel: "silent",
  prettyErrors: false,
  strict: true,
  uniqueKeys: true,
});
if (document.errors.length > 0) {
  fail(document.errors.map((error) => error.message).join("; "));
}

const workflow = document.toJS({ maxAliasCount: 100 });
const validation = core.validateWorkflow(workflow);
if (!validation.structurally_valid) {
  fail(JSON.stringify(validation.diagnostics));
}

const timestamps = new Set(
  workflow.items.map((item) => item.checkpoint.updated_at),
);
if (timestamps.size !== 1) {
  fail("Canonical workflow must use one fixed checkpoint snapshot timestamp.");
}

const rendered = core.renderWorkflow(workflow, {
  generated_at: [...timestamps][0],
  source: workflowSource,
});

await Promise.all([
  writeFile(ganttPath, rendered.gantt.text, "utf8"),
  writeFile(progressPath, rendered.progress.text, "utf8"),
]);

console.log(
  JSON.stringify({
    items: workflow.items.length,
    diagnostics: validation.diagnostics.length,
    source_fingerprint: rendered.gantt.provenance.source_fingerprint,
    projections: [ganttPath, progressPath],
  }),
);
