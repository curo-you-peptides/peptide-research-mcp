# Curo Peptide Research MCP: PepBank Studies, Peptide Lookup and Lab Reports (COAs)

[![MCP Badge](https://lobehub.com/badge/mcp/curo-you-peptides-peptide-research-mcp)](https://lobehub.com/mcp/curo-you-peptides-peptide-research-mcp)
[![Curo Peptide Research MCP connector](https://glama.ai/mcp/connectors/you.curo/peptide-research/badges/score.svg)](https://glama.ai/mcp/connectors/you.curo/peptide-research)
[![skills.sh](https://skills.sh/b/curo-you-peptides/peptide-research-mcp)](https://skills.sh/curo-you-peptides/peptide-research-mcp)

Peptide research for your AI: PepBank study findings plus the curo.you peptide catalog and lot COAs.

Curo MCP connects your AI to peptide research and to Curo ([curo.you](https://curo.you/?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)). Add it to Claude, ChatGPT, Gemini, Grok, Perplexity or another MCP app. Your AI can then answer peptide questions from PepBank (https://pepbank.io), a free peptide research database, with study summaries, findings and a link to each source. It can also look up peptides in the Curo catalog ([curo.you/product-catalog](https://curo.you/product-catalog?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)), with the third-party lab report for each lot ([curo.you/coa](https://curo.you/coa?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)), prices, stock and shipping. Server address: https://mcp.curo.you. Setup guide: [curo.you/mcp](https://curo.you/mcp?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp).

## Server address

```
https://mcp.curo.you
```

Transport: Streamable HTTP. The server runs at this address. `https://mcp.curo.you/mcp` reaches the same server. This repository holds its listing files.

## Add it to your AI app

Claude: open Customize, then Connectors. Select Add custom connector. Name it Curo and enter `https://mcp.curo.you`.

ChatGPT: open Plugins. Select +, then Add custom MCP server. Name it Curo and enter `https://mcp.curo.you`.

Claude Code:

```
claude mcp add --transport http curo https://mcp.curo.you
```

Codex (`config.toml`):

```toml
[mcp_servers.curo]
url = "https://mcp.curo.you"
```

Gemini CLI (`settings.json`):

```json
{ "mcpServers": { "curo": { "httpUrl": "https://mcp.curo.you" } } }
```

Steps for Gemini, Grok, Perplexity, Muse and other apps: [curo.you/mcp](https://curo.you/mcp?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)

## Command line and local server (npm)

The `curo-peptides` package runs the same server over stdio for apps that need a local server, and answers from the terminal:

```
npx curo-peptides research BPC-157
npx curo-peptides search tendon healing
npx curo-peptides products
npx curo-peptides coa <lot number>
```

Local server config for MCP apps:

```json
{ "mcpServers": { "curo": { "command": "npx", "args": ["-y", "curo-peptides"] } } }
```

## Tools

| Tool | What it does |
|---|---|
| `peptide_research` | Reads the PepBank summary, main findings, sources and credit for one peptide |
| `search_research` | Searches PepBank study findings, with sources and credit for each result |
| `use_and_dose` | Reads community-reported use and dose for one peptide, with sources, and the doses from published studies |
| `search_products` | Finds Curo products by name, or lists all products |
| `get_product` | Reads product variants, prices, stock and lot reports |
| `get_coa` | Reads the lab reports for a lot number or a product |
| `get_store_info` | Reads shipping, returns, contact and research-use policies |
| `build_cart` | Makes a cart link. You check out and pay on curo.you |

## Prompts and resources

| Name | Type | What it does |
|---|---|---|
| `research_peptide` | Prompt | Asks what the research says about one peptide |
| `lab_report` | Prompt | Asks for the lab report (COA) of one lot |
| `curo://store-info` | Resource | Shipping, returns, contact and research-use policies |

## Plugin package

This repository is also a plugin package that connects the server and adds one skill, `skills/curo-peptide-research/SKILL.md`.

- `plugin.json` and `mcp.json`: Agent Plugins format (Hermes Agent)
- `.claude-plugin/plugin.json` and `.mcp.json`: Claude Code plugin format
- `.cursor-plugin/plugin.json`: Cursor plugin format
- `openclaw.plugin.json`: OpenClaw (ClawHub)

Install the skill with the `skills` CLI:

```
npx skills add curo-you-peptides/peptide-research-mcp
```

## Questions to try

- What does the research say about TB-500?
- Show me the lab report for my lot number.
- Which Curo peptides are in stock right now?
- How long does shipping take?

## Links

- [Curo](https://curo.you/?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)
- [Peptide catalog](https://curo.you/product-catalog?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)
- [Lab reports (COAs)](https://curo.you/coa?utm_source=github&utm_medium=listing&utm_campaign=curo-mcp)
- PepBank: https://pepbank.io
- Official MCP Registry entry: [`you.curo/peptide-research`](https://registry.modelcontextprotocol.io/?q=you.curo)

Curo products are for laboratory research use only. Nothing here is medical advice.
