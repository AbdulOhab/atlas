import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import diff from "highlight.js/lib/languages/diff";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import graphql from "highlight.js/lib/languages/graphql";
import groovy from "highlight.js/lib/languages/groovy";
import http from "highlight.js/lib/languages/http";
import ini from "highlight.js/lib/languages/ini";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import nginx from "highlight.js/lib/languages/nginx";
import powershell from "highlight.js/lib/languages/powershell";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

/**
 * Only the languages the content actually uses are registered, which keeps
 * the client bundle small. Fence names that differ from highlight.js's own
 * (cjs, hcl, conf, …) are mapped to the closest grammar.
 */
const LANGUAGES = {
  bash, diff, dockerfile, go, graphql, groovy, http, ini, java, javascript, json, markdown, nginx, powershell,
  python, ruby, rust, shell, sql, typescript, xml, yaml,
};
for (const [name, grammar] of Object.entries(LANGUAGES)) hljs.registerLanguage(name, grammar);

const ALIASES: Record<string, string> = {
  sh: "bash",
  zsh: "bash",
  console: "shell",
  cjs: "javascript",
  mjs: "javascript",
  jsx: "javascript",
  tsx: "typescript",
  // HCL (Terraform), TOML and generic config read well with the INI grammar.
  hcl: "ini",
  terraform: "ini",
  tf: "ini",
  toml: "ini",
  conf: "ini",
  gitignore: "bash",
  html: "xml",
};

/** Highlighted HTML for a fenced block, or null when the language isn't one we highlight. */
export function highlight(code: string, language?: string): string | null {
  if (!language) return null;
  const name = ALIASES[language.toLowerCase()] ?? language.toLowerCase();
  if (!hljs.getLanguage(name)) return null;
  try {
    return hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
  } catch {
    return null;
  }
}
