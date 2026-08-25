export interface ProductionState {
  service: string;
  environment: string;
  paymentAuthorizationTimeoutMs: number;
  remediationApplied: boolean;
  activeRemediationId: string | null;
  updatedAt: string;
}

const DEFAULT_BASE_URL =
  process.env.SENTINELFORGE_SIMULATOR_URL ??
  "http://localhost:3010";

function getBaseUrl(): string {
  return DEFAULT_BASE_URL.replace(/\/$/, "");
}

async function requestJson<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${getBaseUrl()}${path}`,
    options
  );

  if (!response.ok) {
    throw new Error(
      `Production simulator request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

export async function getProductionState(): Promise<ProductionState> {
  return requestJson<ProductionState>(
    "/state"
  );
}

export async function updateProductionState(
  updates: Partial<
    Omit<ProductionState, "updatedAt">
  >
): Promise<ProductionState> {
  return requestJson<ProductionState>(
    "/state",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updates)
    }
  );
}

export async function resetProductionState(): Promise<ProductionState> {
  return requestJson<ProductionState>(
    "/reset",
    {
      method: "POST"
    }
  );
}

export function getProductionSimulatorUrl(): string {
  return getBaseUrl();
}