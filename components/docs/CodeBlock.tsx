"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlight } from "@/lib/highlight";

interface CodeBlockProps {
  code: string;
  language?: string;
}

/**
 * A mono block with the language noted. Real code (bash, python, ts, go, sql,
 * yaml, …) is syntax-highlighted; schemas, plain text and ASCII illustrations
 * in an unknown or unmarked fence stay as plain text.
 */
export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => highlight(code, language), [code, language]);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="group relative my-6 rounded border border-rule bg-surface">
      <div className="flex items-center justify-between border-b border-rule px-3 py-1.5">
        <span className="font-mono text-micro text-inkFaint">{language || "text"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="text-inkFaint transition-colors duration-fast hover:text-ink"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5">
        {html ? (
          <code
            className="hljs font-mono text-tiny leading-relaxed text-ink"
            // highlight.js escapes the source; the only markup is its own token spans.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <code className="font-mono text-tiny leading-relaxed text-ink">{code}</code>
        )}
      </pre>
    </div>
  );
}
