export type AssetId = 'cash' | 'fd' | 'index' | 'debt' | 'gold';
export type ScenarioId =
  | 'baseline'
  | 'equity-crash'
  | 'contribution-pause'
  | 'increase-contribution'
  | 'withdrawal';

export interface UserProfile {
  goalAmountINR: number;
  goalType: 'nominal' | 'today-value';
  monthlyIncomeINR: number;
  monthlyCommittedSpendINR: number;
  monthlyReserveINR: number;
  plannedContributionINR: number;
  initialBalanceINR: number;
  horizonYears: number;
  liquidityNeed: 'soon' | 'medium' | 'long' | 'unsure';
  lossResponse: 'need-access' | 'review-wait' | 'might-add' | 'unsure';
  emergencyReserveStatus: 'none' | 'building' | 'available' | 'unsure';
}

export interface AssetAssumption {
  id: AssetId;
  label: string;
  annualReturn: number; // e.g. 0.08 = illustrative 8% effective yearly
  annualFee: number; // nonneg annual proportional fee
  modelNotes: string;
}

export interface FinancialPlan {
  profile: UserProfile;
  allocation: Record<AssetId, number>; // fractions summing to 1
  assumptions: Record<AssetId, AssetAssumption>;
  inflationRateAnnual: number;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface ScenarioSettings {
  id: ScenarioId;
  eventMonth: number;
  equityShockFraction?: number; // -0.25 = one-time -25%
  pauseMonths?: number;
  monthlyIncreaseINR?: number;
  withdrawalINR?: number;
}

export interface MonthSnapshot {
  month: number;
  byAssetINR: Record<AssetId, number>;
  contributedPrincipalINR: number;
  cumulativeWithdrawalsINR: number;
  totalValueINR: number;
  todayValueINR: number;
  nominalGoalThresholdINR: number;
  goalReached: boolean;
}

export interface ProjectionResult {
  snapshots: MonthSnapshot[];
  firstGoalMonth: number | null;
  warnings: string[];
  assumptionsDescription: string[];
}

export interface AppState {
  plan: FinancialPlan;
  activeScenario: ScenarioSettings;
  onboardingStep: number;
  onboardingComplete: boolean;
  selectedAsset: AssetId | null;
  lastEdit: { field: string; before: unknown; after: unknown } | null;
  savedPlans: Array<{ id: string; label: string; plan: FinancialPlan; savedAt: string }>;
  actions: {
    updateProfile: (patch: Partial<UserProfile>) => void;
    updateAllocation: (asset: AssetId, portion: number) => void;
    normalizeAllocation: () => void;
    updateAssumption: (asset: AssetId, patch: Partial<AssetAssumption>) => void;
    setScenario: (scenario: ScenarioSettings) => void;
    saveCurrentPlan: () => void;
    resetToDemo: () => void;
    clearAllLocalData: () => void;
    setOnboardingStep: (step: number) => void;
    completeOnboarding: () => void;
    setSelectedAsset: (id: AssetId | null) => void;
    recordEdit: (field: string, before: unknown, after: unknown) => void;
  };
}
