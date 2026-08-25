import express from "express";
import { z } from "zod";

import {
  getProductionState,
  resetProductionState,
  updateProductionState
} from "./state.js";

export const app = express();

app.use(express.json());

const updateStateSchema = z.object({
  paymentAuthorizationTimeoutMs: z
    .number()
    .int()
    .positive()
    .optional(),

  remediationApplied: z
    .boolean()
    .optional(),

  activeRemediationId: z
    .string()
    .nullable()
    .optional()
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "sentinelforge-production-simulator"
  });
});

app.get("/state", (_req, res) => {
  res.json(getProductionState());
});

app.patch("/state", (req, res) => {
  const parsed = updateStateSchema.safeParse(
    req.body
  );

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid production state update",
      details: parsed.error.flatten()
    });

    return;
  }

  const state = updateProductionState(
    parsed.data
  );

  res.json(state);
});

app.post("/reset", (_req, res) => {
  const state = resetProductionState();

  res.json(state);
});