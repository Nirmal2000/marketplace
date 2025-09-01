> Note: After signing in, the dashboard may take 5–10 seconds to load. Please wait for the redirect to complete.
> Deployment of MCP servers from the platform typically takes 1–2 minutes.

## Using MCPs on the Platform

Follow these steps to enable MCPs with X402 payments in your client:

1) Clone the X402 MCP repo and build it

```bash
git clone https://github.com/Nirmal2000/x402-mcp.git
cd x402-mcp
npm run build
```

2) Configure your MCP client to use the client proxy

You can copy the MCP client config directly from the Marketplace UI. For reference, here is the manual form you can paste into your client config (e.g., Claude Desktop `claude_desktop_config.json`):

```json
"youtube-video-clipper": {
  "command": "node",
  "args": [
    "[path to repo]/x402-mcp/dist/scripts/client-proxy.js"
  ],
  "env": {
    "PRIVATE_KEY": "your private key",
    "TARGET_URL": "the server url from the platform"
  }
}
```

- PRIVATE_KEY: your wallet’s private key for payments.
- TARGET_URL: the MCP server URL provided by the platform (the tool endpoint).

Once added, restart your MCP client. You can now invoke tools exposed by the server and the proxy will handle X402 payment flows automatically.

Testnet funds: use the Coinbase faucet to obtain USDC/ETH on Base Sepolia for tool payments and gas:
https://portal.cdp.coinbase.com/products/faucet

## Adding X402 Sample MCPs

You can try these sample MCPs with the platform:

1. YouTube clipping example
   - https://github.com/Nirmal2000/youtube-video-clip
2. TODO sample (same repo as the X402 MCP toolkit)
   - https://github.com/Nirmal2000/x402-mcp.git

Follow the instructions in each repository/website to configure environment variables and run the servers.
