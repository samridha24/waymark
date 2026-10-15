export interface InvestmentEntry {
  id: string;
  title: string;
  tagline: string;
  howItWorks: string;
  whatCanGoRight: string;
  whatCanGoWrong: string;
  liquidity: string;
  lockIn: string;
  costsAndFees: string;
  taxConsiderations: string;
  uncertainty: string;
  relationToPlan: string;
  simulatorSimplification: string;
  traits: {
    accessSpeed: 'immediate' | 'days' | 'weeks' | 'months' | 'locked';
    volatility: 'none' | 'low' | 'moderate' | 'high' | 'variable';
    lockInTerms: 'none' | 'flexible' | 'short' | 'medium' | 'long';
    potentialCost: 'free' | 'very-low' | 'low' | 'moderate';
  };
  illustration: {
    type: 'stable' | 'rising' | 'volatile' | 'stepped' | 'lumpy';
    sampleAnnualReturn: number;
    sampleFee: number;
    horizon: number; // years
    seedAmount: number;
  };
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}
