#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadJSON(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

let errors = 0;
const pendingLocalDependencies = [];

function fail(message) {
  console.error(`ERROR: ${message}`);
  errors++;
}

// 1. Validate the Claude Code marketplace and the Codex (Agent Plugins) catalog.
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function checkManifest(label, entryName, manifestPath) {
  if (!existsSync(manifestPath)) {
    fail(`${label} plugin "${entryName}": missing ${manifestPath.slice(root.length + 1)}`);
    return null;
  }
  let manifest;
  try {
    manifest = loadJSON(manifestPath);
  } catch (error) {
    fail(`${label} plugin "${entryName}": invalid JSON in ${manifestPath.slice(root.length + 1)}: ${error.message}`);
    return null;
  }
  if (manifest.name !== entryName) {
    fail(`${label} plugin "${entryName}": manifest name is "${manifest.name}"`);
  }
  if (!NAME_PATTERN.test(manifest.name ?? "")) {
    fail(`${label} plugin "${entryName}": name must be kebab-case`);
  }
  for (const key of ["version", "description"]) {
    if (typeof manifest[key] !== "string" || manifest[key].length === 0) {
      fail(`${label} plugin "${entryName}": missing "${key}"`);
    }
  }
  return manifest;
}

const claudeMarketplacePath = resolve(root, ".claude-plugin/marketplace.json");
if (existsSync(claudeMarketplacePath)) {
  const claudeMarketplace = loadJSON(claudeMarketplacePath);
  const listed = new Set();
  for (const entry of claudeMarketplace.plugins ?? []) {
    listed.add(entry.name);
    if (typeof entry.source !== "string") {
      fail(`Claude plugin "${entry.name}": source must be a relative path string`);
      continue;
    }
    const pluginDir = resolve(root, entry.source);
    if (!existsSync(pluginDir)) {
      fail(`Claude plugin "${entry.name}": source directory "${entry.source}" does not exist`);
      continue;
    }
    const manifest = checkManifest(
      "Claude",
      entry.name,
      resolve(pluginDir, ".claude-plugin/plugin.json")
    );
    if (existsSync(resolve(pluginDir, ".cursor-plugin/plugin.json"))) {
      fail(`Claude plugin "${entry.name}": still ships a Cursor manifest`);
    }
    for (const dependency of manifest?.dependencies ?? []) {
      const name = typeof dependency === "string" ? dependency : dependency.name;
      const [depName, depMarketplace] = name.split("@");
      if (depMarketplace && depMarketplace !== claudeMarketplace.name) {
        const allowed = claudeMarketplace.allowCrossMarketplaceDependenciesOn ?? [];
        if (!allowed.includes(depMarketplace)) {
          fail(`Claude plugin "${entry.name}": dependency "${name}" needs "${depMarketplace}" in allowCrossMarketplaceDependenciesOn`);
        }
      }
      if (!depMarketplace) pendingLocalDependencies.push([entry.name, depName]);
    }
  }
  for (const [owner, depName] of pendingLocalDependencies) {
    if (!listed.has(depName)) {
      fail(`Claude plugin "${owner}": dependency "${depName}" is not listed in .claude-plugin/marketplace.json`);
    }
  }
}

const codexCatalogPath = resolve(root, ".agents/plugins/marketplace.json");
if (existsSync(codexCatalogPath)) {
  const codexCatalog = loadJSON(codexCatalogPath);
  for (const entry of codexCatalog.plugins ?? []) {
    const relative = entry.source?.path;
    if (entry.source?.source !== "local" || typeof relative !== "string") {
      fail(`Codex plugin "${entry.name}": source must be { "source": "local", "path": ... }`);
      continue;
    }
    const pluginDir = resolve(root, relative);
    const manifest = checkManifest("Codex", entry.name, resolve(pluginDir, "plugin.json"));
    const logo = manifest?.extensions?.["com.openai"]?.interface?.logo;
    if (logo && !existsSync(resolve(pluginDir, logo))) {
      fail(`Codex plugin "${entry.name}": logo "${logo}" does not exist`);
    }
  }
}

// 2. Report results
if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log("All plugins validated successfully.");
  process.exit(0);
}
