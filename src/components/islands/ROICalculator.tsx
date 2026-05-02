import React, { useState } from 'react';

export default function ROICalculator() {
  const [sqft, setSqft] = useState<number | ''>('');
  const [roofAge, setRoofAge] = useState<number | ''>('');
  const [annualSpend, setAnnualSpend] = useState<number | ''>('');
  const [calculated, setCalculated] = useState<{ savings: number; monthly: number } | null>(null);

  const calculateROI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqft || !roofAge || !annualSpend) return;

    // Placeholder calculation logic
    const sqftNum = Number(sqft);
    const ageNum = Number(roofAge);
    const spendNum = Number(annualSpend);

    const roofAgeFactor = ageNum > 15 ? 1.5 : ageNum > 5 ? 1.2 : 1.0;
    const monthlyMaint = (sqftNum * 0.05) / 12; // Example: 5 cents per sqft per year
    
    // Total cost of maintenance over 5 years vs doing nothing and doing major repairs
    const estimatedFiveYearSavings = (spendNum * 5 * roofAgeFactor) - (monthlyMaint * 12 * 5);

    setCalculated({
      savings: Math.max(0, estimatedFiveYearSavings),
      monthly: monthlyMaint,
    });

    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'roi_calculator_complete',
        sqft: sqftNum,
        roofAge: ageNum,
        annualSpend: spendNum,
        savings: estimatedFiveYearSavings
      });
    }
  };

  return (
    <div className="bg-surface-elevated p-8 rounded-2xl shadow-sm ring-1 ring-border">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Calculate Your ProPlan Savings</h2>
      
      <form onSubmit={calculateROI} className="space-y-6">
        <div>
          <label htmlFor="sqft" className="block text-sm font-medium text-text-secondary">Facility Square Footage</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="sqft"
              value={sqft}
              onChange={(e) => setSqft(e.target.value ? Number(e.target.value) : '')}
              required
              min="0"
              className="block w-full rounded-md border-border pl-4 focus:border-accent focus:ring-accent sm:text-sm"
              placeholder="e.g. 50000"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-text-tertiary sm:text-sm">sq ft</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="roofAge" className="block text-sm font-medium text-text-secondary">Current Roof Age (Years)</label>
          <div className="mt-1">
            <input
              type="number"
              id="roofAge"
              value={roofAge}
              onChange={(e) => setRoofAge(e.target.value ? Number(e.target.value) : '')}
              required
              min="0"
              className="block w-full rounded-md border-border focus:border-accent focus:ring-accent sm:text-sm"
              placeholder="e.g. 10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="annualSpend" className="block text-sm font-medium text-text-secondary">Estimated Annual Repair Spend ($)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-tertiary sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="annualSpend"
              value={annualSpend}
              onChange={(e) => setAnnualSpend(e.target.value ? Number(e.target.value) : '')}
              required
              min="0"
              className="block w-full rounded-md border-border pl-7 focus:border-accent focus:ring-accent sm:text-sm"
              placeholder="5000"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-on-brand bg-brand-primary hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          Calculate Savings
        </button>
      </form>

      {calculated && (
        <div className="mt-8 bg-surface-inset rounded-lg p-6 ring-1 ring-border" aria-live="polite">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Your Estimated ROI</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-text-tertiary font-medium">Estimated 5-Year Savings</p>
              <p className="mt-1 text-3xl font-bold text-success">
                ${calculated.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary font-medium">ProPlan Monthly Cost (Est.)</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                ${calculated.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="text-sm font-normal text-text-tertiary">/mo</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-tertiary">
            * This is an estimate based on industry averages. A formal inspection is required for an exact quote.
          </p>
        </div>
      )}
    </div>
  );
}
