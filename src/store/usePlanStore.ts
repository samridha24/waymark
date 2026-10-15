import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FinancialPlan, AssetId, ScenarioSettings, UserProfile, AssetAssumption } from '../types/finance';
import { demoPlan } from '../data/demoPlan';

interface SavedPlan {
  id: string;
  label: string;
  plan: FinancialPlan;
  savedAt: string;
}

interface PlanState {
  plan: FinancialPlan;
  activeScenario: ScenarioSettings;
  onboardingStep: number;
  onboardingComplete: boolean;
  selectedAsset: AssetId | null;
  lastEdit: { field: string; before: unknown; after: unknown } | null;
  savedPlans: SavedPlan[];
  // actions
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
}

const ASSET_IDS: AssetId[] = ['cash', 'fd', 'index', 'debt', 'gold'];

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: { ...demoPlan, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      activeScenario: { id: 'baseline', eventMonth: 0 },
      onboardingStep: 0,
      onboardingComplete: false,
      selectedAsset: null,
      lastEdit: null,
      savedPlans: [],

      updateProfile: (patch) =>
        set((state) => ({
          plan: {
            ...state.plan,
            profile: { ...state.plan.profile, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      updateAllocation: (asset, portion) =>
        set((state) => ({
          plan: {
            ...state.plan,
            allocation: { ...state.plan.allocation, [asset]: Math.max(0, portion) },
            updatedAt: new Date().toISOString(),
          },
        })),

      normalizeAllocation: () =>
        set((state) => {
          const alloc = { ...state.plan.allocation };
          const sum = ASSET_IDS.reduce((s, id) => s + (alloc[id] ?? 0), 0);
          if (sum <= 0) return state;
          const normalized = ASSET_IDS.reduce(
            (acc, id) => ({ ...acc, [id]: (alloc[id] ?? 0) / sum }),
            {} as Record<AssetId, number>
          );
          return {
            plan: {
              ...state.plan,
              allocation: normalized,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateAssumption: (asset, patch) =>
        set((state) => ({
          plan: {
            ...state.plan,
            assumptions: {
              ...state.plan.assumptions,
              [asset]: { ...state.plan.assumptions[asset], ...patch },
            },
            updatedAt: new Date().toISOString(),
          },
        })),

      setScenario: (scenario) => set({ activeScenario: scenario }),

      saveCurrentPlan: () =>
        set((state) => {
          const savedPlan: SavedPlan = {
            id: crypto.randomUUID(),
            label: `Plan — ${new Date().toLocaleDateString('en-IN')}`,
            plan: { ...state.plan, updatedAt: new Date().toISOString() },
            savedAt: new Date().toISOString(),
          };
          return {
            savedPlans: [savedPlan, ...state.savedPlans.slice(0, 9)],
            plan: { ...state.plan, updatedAt: new Date().toISOString() },
          };
        }),

      resetToDemo: () =>
        set({
          plan: {
            ...demoPlan,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          activeScenario: { id: 'baseline', eventMonth: 0 },
          onboardingStep: 0,
          onboardingComplete: false,
          lastEdit: null,
        }),

      clearAllLocalData: () => {
        localStorage.removeItem('waymark-plan');
        set({
          plan: {
            ...demoPlan,
            isDemo: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          savedPlans: [],
          activeScenario: { id: 'baseline', eventMonth: 0 },
          onboardingStep: 0,
          onboardingComplete: false,
          lastEdit: null,
        });
      },

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      setSelectedAsset: (id) => set({ selectedAsset: id }),

      recordEdit: (field, before, after) =>
        set({ lastEdit: { field, before, after } }),
    }),
    {
      name: 'waymark-plan',
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
      partialize: (state) => ({
        plan: state.plan,
        savedPlans: state.savedPlans,
        onboardingStep: state.onboardingStep,
        onboardingComplete: state.onboardingComplete,
        activeScenario: state.activeScenario,
      }),
    }
  )
);
