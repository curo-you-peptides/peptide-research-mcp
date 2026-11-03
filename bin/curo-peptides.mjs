#!/usr/bin/env node
// Curo Peptide Research: a command-line tool and a local (stdio) bridge to the
// Curo MCP server at https://mcp.curo.you. No dependencies. Node 18 or later.
import { createInterface } from "node:readline";

const VERSION = "1.0.2";
const SERVER = process.env.CURO_MCP_URL || "https://mcp.curo.you/mcp";
const HELP = `curo-peptides ${VERSION}
Peptide research for your AI: PepBank study findings plus the curo.you peptide catalog and lot COAs.

Usage:
  curo-peptides                     Run the Curo MCP server over stdio (for MCP apps)
  curo-peptides research <peptide>  PepBank research brief for one peptide
  curo-peptides search <words>      Search PepBank study findings
  curo-peptides products [name]     Curo products, prices and stock
  curo-peptides coa <lot|product>   Lab reports (COAs) for a lot or product
  curo-peptides store               Shipping, returns, contact and research-use policies
  Add --json to print the raw result.

Setup guide: https://curo.you/mcp
Curo products are for laboratory research use only. Nothing here is medical advice.`;

// One JSON-RPC call to the server. The server answers with JSON or with SSE "data:" lines.
async function post(message, userAgent) {
  const response = await fetch(SERVER, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "user-agent": userAgent },
    body: JSON.stringify(message),
  });
  const text = await response.text();
  if (!text.trim()) return [];
  if (text.trimStart().startsWith("{") || text.trimStart().startsWith("[")) return [].concat(JSON.parse(text));
  return text.split("\n").filter((line) => line.startsWith("data: ")).map((line) => JSON.parse(line.slice(6)));
}

// Stdio bridge: each line on stdin is one JSON-RPC message; each reply goes to stdout as one line.
function bridge() {
  let userAgent = `curo-peptides/${VERSION}`;
  const lines = createInterface({ input: process.stdin });
  lines.on("line", async (line) => {
    if (!line.trim()) return;
    let message;
    try { message = JSON.parse(line); } catch { return; }
    // Pass the app name on, so Curo can tell which app sent the visit.
    if (message.method === "initialize" && message.params?.clientInfo?.name) userAgent = `curo-peptides/${VERSION} (${message.params.clientInfo.name})`;
    try {
      for (const reply of await post(message, userAgent)) process.stdout.write(`${JSON.stringify(reply)}\n`);
    } catch (error) {
      if (message.id !== undefined) process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32603, message: `Curo MCP server not reachable: ${error.message}` } })}\n`);
    }
  });
}

async function tool(name, args) {
  const [reply] = await post({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }, `curo-peptides-cli/${VERSION}`);
  if (reply?.error) throw new Error(reply.error.message);
  return JSON.parse(reply.result.content[0].text);
}

const usd = (price) => `$${price}`;
const productLine = (p) => `- ${p.name} ${p.variant}: ${usd(p.price)}, ${p.stock === "in_stock" ? "in stock" : "out of stock"}. Each lot has a lab report. ${p.buy_link}`;

function printCuro(curo) {
  if (!curo?.length) return;
  console.log("\nAt Curo:");
  for (const p of curo) console.log(productLine(p));
}

const commands = {
  async research(words) {
    const data = await tool("peptide_research", { peptide: words.join(" ") });
    if (!data.research && data.note) { console.log(data.note); printCuro(data.curo); return data; }
    const e = data.evidence_summary ?? {};
    console.log(`${data.peptide?.preferred_name ?? words.join(" ")}`);
    console.log(`Evidence: ${e.human?.findings ?? 0} human, ${e.animal?.findings ?? 0} animal and ${e.laboratory?.findings ?? 0} lab findings. ${e.trials?.total ?? 0} registered trials.`);
    for (const n of data.notices ?? []) console.log(`Note: ${n.text}`);
    console.log("\nKey findings:");
    for (const f of data.key_findings ?? []) console.log(`- [${f.evidence_class}] ${f.statement}${f.citation?.url ? ` ${f.citation.url}` : ""}`);
    if (data.credit?.line) console.log(`\n${data.credit.line}`);
    printCuro(data.curo);
    return data;
  },
  async search(words) {
    const data = await tool("search_research", { query: words.join(" ") });
    for (const r of data.results ?? []) console.log(`- [${r.evidence_class}] ${r.claim?.statement_plain ?? r.claim?.statement}`);
    if (data.credit?.line) console.log(`\n${data.credit.line}`);
    printCuro(data.curo);
    return data;
  },
  async products(words) {
    const data = await tool("search_products", words.length ? { query: words.join(" ") } : {});
    for (const p of data.products ?? []) console.log(productLine(p));
    return data;
  },
  async coa(words) {
    const data = await tool("get_coa", { query: words.join(" ") });
    if (!data.reports?.length) console.log("No lab report found. See all reports: https://curo.you/coa");
    for (const r of data.reports ?? []) {
      const results = [r.purityPercent != null && `purity ${r.purityPercent}%`, r.identityStatus && `identity ${r.identityStatus}`, r.resultStatus && r.resultStatus !== "published" && `result ${r.resultStatus}`].filter(Boolean).join(", ");
      console.log(`- ${r.label ?? r.productId}, lot ${r.lot}, ${r.reportDate}${results ? `: ${results}` : ""}. ${r.report_link ?? ""}`);
    }
    return data;
  },
  async store() {
    const data = await tool("get_store_info", {});
    for (const [key, value] of Object.entries(data)) console.log(`${key.replace(/_/g, " ")}: ${value.link}`);
    return data;
  },
};

const args = process.argv.slice(2);
const json = args.includes("--json");
const [command, ...words] = args.filter((a) => a !== "--json");

if (!command || command === "mcp") bridge();
else if (command === "help" || command === "--help" || command === "-h") console.log(HELP);
else if (command === "--version" || command === "-v") console.log(VERSION);
else if (!commands[command]) { console.error(`Unknown command: ${command}\n\n${HELP}`); process.exit(1); }
else if (command !== "products" && command !== "store" && !words.length) { console.error(`Usage: curo-peptides ${command} <words>`); process.exit(1); }
else {
  const log = console.log;
  if (json) console.log = () => {};
  try {
    const data = await commands[command](words);
    if (json) log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Curo MCP server error: ${error.message}`);
    process.exit(1);
  }
}
