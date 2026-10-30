import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const esmCode = `import dotenv from "dotenv";
dotenv.config();
import express from "express";

// IMPORT API COMPONENTS
import { connectToTunnel, tunnelMiddleware } from "api-visualizer";

// CONNECT WITH YOUR API KEY FROM THE DASHBOARD
connectToTunnel(process.env.API_VISUALIZER_KEY);

const app = express();

// ATTACH THE MIDDLEWARE (before body parsers)
app.use(tunnelMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api", (req, res) => {
  res.json({ message: "Received", body: req.body });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});`;

const cjsCode = `require("dotenv").config();
const express = require("express");

// IMPORT API COMPONENTS
const { connectToTunnel, tunnelMiddleware } = require("api-visualizer");

// CONNECT WITH YOUR API KEY FROM THE DASHBOARD
connectToTunnel(process.env.API_VISUALIZER_KEY);

const app = express();

// ATTACH THE MIDDLEWARE (before body parsers)
app.use(tunnelMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api", (req, res) => {
  res.json({ message: "Received", body: req.body });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});`;

const tsCode = `import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";

// IMPORT API COMPONENTS (types included)
import { connectToTunnel, tunnelMiddleware } from "api-visualizer";

// CONNECT WITH YOUR API KEY FROM THE DASHBOARD
connectToTunnel(process.env.API_VISUALIZER_KEY);

const app = express();

// ATTACH THE MIDDLEWARE (before body parsers)
app.use(tunnelMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api", (req: Request, res: Response) => {
  res.json({ message: "Received", body: req.body });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});`;

const variants = [
  {
    id: "esm",
    label: "ES Modules",
    filename: "app.js",
    language: "javascript",
    code: esmCode,
    note: <>Needs <code className="bg-gray-800 px-1 rounded text-green-400">"type": "module"</code> in your package.json, or name the file <code className="bg-gray-800 px-1 rounded text-green-400">app.mjs</code>.</>,
  },
  {
    id: "cjs",
    label: "CommonJS",
    filename: "app.js",
    language: "javascript",
    code: cjsCode,
    note: <>The default for Node.js projects without <code className="bg-gray-800 px-1 rounded text-green-400">"type": "module"</code> in package.json.</>,
  },
  {
    id: "ts",
    label: "TypeScript",
    filename: "app.ts",
    language: "typescript",
    code: tsCode,
    note: <>Types for <code className="bg-gray-800 px-1 rounded text-green-400">api-visualizer</code> are built in. Install <code className="bg-gray-800 px-1 rounded text-green-400">@types/express</code> for Express types.</>,
  },
] as const;

// Highlight by content so line numbers can differ per variant
const isKeyLine = (line: string) =>
  line.includes(`"api-visualizer"`) || line.startsWith("connectToTunnel(") || line.includes("app.use(tunnelMiddleware)");

const CodeBlock = () => {
  const [selected, setSelected] = useState<(typeof variants)[number]["id"]>("esm");
  const [copied, setCopied] = useState(false);

  const variant = variants.find((v) => v.id === selected) ?? variants[0];
  const keyLines = new Set(
    variant.code.split("\n").flatMap((line, i) => (isKeyLine(line) ? [i + 1] : []))
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(variant.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const select = (id: typeof selected) => {
    setSelected(id);
    setCopied(false);
  };

  return (
    <section className="mb-20 sm:mb-24 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
        Connect Middleware to Your Server
      </h2>

      <p className="text-center text-gray-400 mb-4 text-sm">
        Install:{" "}
        <code className="bg-gray-800 px-1 rounded text-green-400">npm install api-visualizer dotenv</code>
        {" "}· Add{" "}
        <code className="bg-gray-800 px-1 rounded text-green-400">API_VISUALIZER_KEY=avz-...</code>
        {" "}to your .env
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-x-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div role="tablist" aria-label="Module format" className="flex flex-wrap gap-1 bg-gray-800 rounded-lg p-1">
            {variants.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={selected === v.id}
                onClick={() => select(v.id)}
                className={`cursor-pointer px-3 py-1 rounded-md text-sm transition-colors ${selected === v.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-mono">{variant.filename}</span>
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-green-400 px-3 py-1 rounded text-sm transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <SyntaxHighlighter
          language={variant.language}
          style={oneDark}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber) =>
            keyLines.has(lineNumber)
              ? { style: { backgroundColor: "rgba(255,255,0,0.1)" } }
              : {}
          }
        >
          {variant.code}
        </SyntaxHighlighter>
      </div>

      <p className="text-center text-gray-400 mt-4 text-sm">{variant.note}</p>
    </section>
  );
}

export default CodeBlock;
