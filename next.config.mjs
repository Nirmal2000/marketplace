import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

const nextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.NEXT_PUBLIC_CIVIC_APP_ID
});

export default withCivicAuth(nextConfig);
