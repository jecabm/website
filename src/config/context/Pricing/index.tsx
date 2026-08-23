'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import request, { getErrorMessage } from '@/config/configServer/request';
import { useCountry } from '@/hooks/use-country';

export type PlanInterval = 'day' | 'week' | 'month' | 'year';

export interface PlanCurrency {
  id: number;
  description: string | null;
  region: string;
  currency: string;
  price: string;
  interval: PlanInterval;
  status: 'active' | 'inactive' | 'draft';
  archive: boolean;
  paymentLinkUrl: string | null;
  allowTrial: boolean;
  trialDays: number | null;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  userLimit: number;
  customizationSupport: boolean;
  contactSales: boolean;
  showPrice: boolean;
  status: 'active' | 'inactive' | 'draft' | 'soft-deleted';
  position: number | null;
  planCurrencies: PlanCurrency[];
}

export interface IPricingContext {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  currency: string;
  refetch: () => void;
}

const initialState: IPricingContext = {
  plans: [],
  loading: false,
  error: null,
  currency: '',
  refetch: () => {},
};

export const PricingContext = createContext<IPricingContext>(initialState);

export function PricingProvider({ children }: { children: ReactNode }) {
  const { content } = useCountry();
  const currency = content.currency;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = (await request(
          `/plans/ordered/top?currency=${encodeURIComponent(currency)}`,
        )) as Plan[] | null;
        if (cancelled) return;
        setPlans(response ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setPlans([]);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currency, reloadKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return (
    <PricingContext.Provider value={{ plans, loading, error, currency, refetch }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing(): IPricingContext {
  return useContext(PricingContext);
}
