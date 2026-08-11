import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const temporaryRoot = mkdtempSync(join(tmpdir(), "skill-trace-sampler-package-"));
const sourceRoot = join(temporaryRoot, "source");
const consumerRoot = join(temporaryRoot, "consumer");

mkdirSync(sourceRoot);
mkdirSync(consumerRoot);

try {
  const sourceEntries = [
    "src",
    "tests",
    "scripts",
    "docs",
    "examples",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "README.md",
    "SKILL.md",
    "LICENSE",
    "SECURITY.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md"
  ];

  for (const relativePath of sourceEntries) {
    cpSync(join(projectRoot, relativePath), join(sourceRoot, relativePath), {
      recursive: true
    });
  }

  execFileSync("npm", ["ci"], { cwd: sourceRoot, stdio: "inherit" });
  const output = execFileSync("npm", ["pack", "--json"], {
    cwd: sourceRoot,
    encoding: "utf8"
  });
  const [pack] = JSON.parse(output);
  const files = new Set(pack.files.map((file) => file.path));

  const required = [
    "dist/src/cli.js",
    "dist/src/index.js",
    "dist/tests/sampler.test.js",
    "examples/sample.txt",
    "docs/RELEASE_CANDIDATE.md",
    "SKILL.md",
    "README.md",
    "LICENSE",
    "SECURITY.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md"
  ];

  const missing = required.filter((file) => !files.has(file));
  if (missing.length) {
    throw new Error(`Package smoke failed; missing files:\n${missing.join("\n")}`);
  }

  const tarball = join(sourceRoot, pack.filename);
  execFileSync("npm", ["install", "--ignore-scripts", tarball], {
    cwd: consumerRoot,
    stdio: "inherit"
  });

  const binName = process.platform === "win32"
    ? "skill-trace-sampler.cmd"
    : "skill-trace-sampler";
  const installedBin = join(consumerRoot, "node_modules", ".bin", binName);
  if (!existsSync(installedBin)) {
    throw new Error(`Package smoke failed; installed bin is missing: ${installedBin}`);
  }

  const help = execFileSync(installedBin, ["--help"], { encoding: "utf8" });
  if (!help.includes("skill-trace-sampler")) {
    throw new Error("Package smoke failed; installed bin did not print CLI help");
  }

  console.log(
    `package smoke ok: ${pack.filename} includes ${pack.files.length} files; installed bin --help passed`
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
