import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
const PORT = process.env.PORT || 4402;

// Payment receiver address (Base Sepolia)
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS;

// Facilitator URL
const FACILITATOR_URL = "https://x402.org/facilitator";

// Create facilitator client and resource server
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  "eip155:84532",
  new ExactEvmScheme(),
);

// Route configuration
const routes = {
  "GET /protected": {
    accepts: {
      scheme: "exact" as const,
      price: "$0.001",
      network: "eip155:84532" as const,
      payTo: PAYMENT_ADDRESS as `0x${string}`,
    },
    description: "Access to premium content",
  },
};

// Configure CORS for x402 headers
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: [
      "X-Payment",
      "X-Payment-Response",
      "WWW-Authenticate",
      "Content-Type",
      "PAYMENT-REQUIRED",
      "Payment-Required",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Payment",
      "X-Payment-Response",
      "Accept",
      "PAYMENT-REQUIRED",
      "Payment-Required",
    ],
  }),
);
app.use(express.json());

// Apply payment middleware
app.use(paymentMiddleware(routes, resourceServer));

// Public endpoint
app.get("/", (req, res) => {
  res.json({
    message: "x402 Test Server",
    endpoints: {
      public: "/",
      protected: "/protected (requires $0.001 USDC payment)",
    },
  });
});

// Protected endpoint
app.get("/protected", (req, res) => {
  res.json({
    success: true,
    message: "Payment received! Here is your protected content.",
    timestamp: new Date().toISOString(),
    data: {
      secret: "This is the protected data you paid for!",
    },
  });
});

app.listen(PORT, () => {
  console.log(`[x402-server] Running on http://localhost:${PORT}`);
  console.log(`[x402-server] Payment address: ${PAYMENT_ADDRESS}`);
  console.log(
    `[x402-server] Protected endpoint: http://localhost:${PORT}/protected`,
  );
});
