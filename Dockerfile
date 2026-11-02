# Runs the Curo MCP server over stdio. It forwards each request to https://mcp.curo.you.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY bin ./bin
ENTRYPOINT ["node", "bin/curo-peptides.mjs"]
