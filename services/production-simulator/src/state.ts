export interface ProductionState {
  service: string;
  environment: string;
  paymentAuthorizationTimeoutMs: number;
  remediationApplied: boolean;
  activeRemediationId: string | null;
  updatedAt: string;
}

function createDefaultState(): ProductionState {
  return {
    service: "checkout-service",
    environment: "production",
    paymentAuthorizationTimeoutMs: 500,
    remediationApplied: false,
    activeRemediationId: null,
    updatedAt: new Date().toISOString()
  };
}

let productionState: ProductionState =
  createDefaultState();

export function getProductionState(): ProductionState {
  return {
    ...productionState
  };
}

export function updateProductionState(
  updates: Partial<
    Omit<ProductionState, "updatedAt">
  >
): ProductionState {
  productionState = {
    ...productionState,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return getProductionState();
}

export function resetProductionState(): ProductionState {
  productionState = createDefaultState();

  return getProductionState();
}