import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// 🔹 Types matching backend entity
export interface Policy {
  id: string;
  policyId: string;
  proposal: any;
  policyholder: any;
  policyClass: string;
  subjectMatter: string;
  sumInsured: string;
  premium: string;
  premiumFrequency: string;
  frequencyFactor: number;
  startDate: string;
  expirationDate: string;
  isActive: boolean;
  isExpired: boolean;
  claimsCount: number;
  hasClaimed: boolean;
  hasReinsurance: boolean;
  reinsuranceTxnId?: string | null;
  aggregateClaimAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicySlice {
  // --- State ---
  policies: Policy[];
  selectedPolicy: Policy | null;
  isLoadingPolicy: boolean;
  policyError: string | null;
  hasLoadedPolicies: boolean;

  // --- Mutators ---
  setPolicies: (policies: Policy[]) => void;
  setSelectedPolicy: (policy: Policy | null) => void;
  setPolicyLoading: (loading: boolean) => void;
  setPolicyError: (error: string | null) => void;

  // --- API Actions (policyholder only) ---
  fetchPoliciesByUser: (userId: string) => Promise<{ success: boolean; policies?: Policy[] }>;
  fetchPolicyById: (id: string) => Promise<{ success: boolean; policy?: Policy }>;

  // --- Utility Actions ---
  clearSelectedPolicy: () => void;
  clearPolicyError: () => void;
}

export const createPolicySlice: StateCreator<PolicySlice> = (set, get) => ({
  // --- Initial State ---
  policies: [],
  selectedPolicy: null,
  isLoadingPolicy: false,
  policyError: null,
  hasLoadedPolicies: false,

  // --- Mutators ---
  setPolicies: (policies) => set({ policies, hasLoadedPolicies: true }),
  setSelectedPolicy: (policy) => set({ selectedPolicy: policy }),
  setPolicyLoading: (loading) => set({ isLoadingPolicy: loading }),
  setPolicyError: (error) => set({ policyError: error }),

  // --- API Actions ---

  fetchPoliciesByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPolicy: true, policyError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/policies/user/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok)
        throw new Error(`Failed to fetch policies: ${res.statusText}`);

    const result = await res.json();
    const policies = result.data.data;
      set({ policies, isLoadingPolicy: false, hasLoadedPolicies: true });
      return { success: true, policies };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch policies";
      set({ policyError: message, isLoadingPolicy: false });
      return { success: false };
    }
  },

  fetchPolicyById: async (id) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPolicy: true, policyError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/policies/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok)
        throw new Error(`Failed to fetch policy: ${res.statusText}`);

    const result = await res.json();
    const policy = result.data.data;
      set({ selectedPolicy: policy, isLoadingPolicy: false });
      return { success: true, policy };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch policy";
      set({ policyError: message, isLoadingPolicy: false });
      return { success: false };
    }
  },

  // --- Utility Actions ---
  clearSelectedPolicy: () => set({ selectedPolicy: null }),
  clearPolicyError: () => set({ policyError: null }),
});

