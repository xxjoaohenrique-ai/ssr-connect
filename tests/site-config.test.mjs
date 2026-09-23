import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const fromRoot = (file) => join(root.pathname, file);

test("manifesto referenciado pelo HTML existe e aponta para um ícone real", () => {
  const html = readFileSync(fromRoot("index.html"), "utf8");
  assert.match(html, /%BASE_URL%manifest\.json/);
  const manifest = JSON.parse(readFileSync(fromRoot("public/manifest.json"), "utf8"));
  assert.equal(manifest.start_url, ".");
  assert.equal(manifest.scope, ".");
  assert.ok(manifest.icons.length > 0);
  for (const icon of manifest.icons) {
    assert.ok(existsSync(fromRoot(join("public", icon.src))), `Ícone ausente: ${icon.src}`);
  }
});
