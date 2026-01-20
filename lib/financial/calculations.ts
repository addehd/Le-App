/**
 * Financial calculation functions for mortgage payments, total cost of ownership, and affordability.
 *
 * All functions are pure and testable, following TDD methodology.
 */

/**
 * Round a number to 2 decimal places (for currency values).
 */
function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Round a number to 1 decimal place (for percentages).
 */
function roundPercentage(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Format a number as Swedish currency (SEK).
 * Uses Swedish locale with space as thousand separator.
 */
export function formatCurrencySEK(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a number with Swedish thousand separator (space).
 */
export function formatNumberSE(value: number): string {
  return new Intl.NumberFormat('sv-SE').format(value);
}

// Swedish mortgage parameters
export interface SwedishMortgageParams {
  purchasePrice: number;
  downPaymentPercent: number;  // Must be >= 15% (85% LTV cap - bolånetak)
  annualInterestRate: number;
  loanTermYears: number;
  propertyType: 'villa' | 'brf';  // Affects maintenance costs
}

export interface MortgageResult {
  monthlyPayment: number;
  monthlyInterest: number;
  monthlyAmortization: number;
  amortizationPercent: number;
  amortizationReason: string;
  totalPayments: number;
  totalInterest: number;
  ltv: number;
}

export interface AmortizationResult {
  monthlyAmortization: number;
  yearlyAmortizationPercent: number;  // 0%, 1%, 2%, or 3%
  reason: string;  // Explanation: "LTV 72% → 2% yearly" or "LTV < 50% → no requirement"
}

export interface SwedishTotalCostParams {
  purchasePrice: number;
  downPaymentPercent: number;
  annualInterestRate: number;
  loanTermYears: number;
  propertyType: 'villa' | 'brf';
  propertyTaxAnnual?: number;
  insuranceAnnual?: number;
  brfMonthly?: number;          // BRF-avgift (if brf property type)
  maintenanceRate?: number;     // Default 0.01 for villa, 0 for brf (included in BRF fee)
}

export interface TotalCostResult {
  monthlyMortgage: number;
  monthlyInterest: number;
  monthlyAmortization: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyBRF: number;
  monthlyMaintenance: number;
  totalMonthly: number;
  totalAnnual: number;
}

export interface SwedishAffordabilityParams {
  grossMonthlyIncome: number;
  monthlyHousingCost: number;
  monthlyOtherDebts: number;
  stressTestRate: number;       // Kalkylränta (typically 5-7%)
  totalDebt?: number;            // For amorteringskrav 3rd rule
  grossAnnualIncome?: number;    // For amorteringskrav 3rd rule
}

export interface AffordabilityResult {
  housingCostRatio: number;
  totalDebtRatio: number;
  stressTestRate: number;
  canAffordConservative: boolean;
  canAffordStandard: boolean;
  reasoning: string;
}

/**
 * Calculate mandatory amortization (amorteringskrav) per Swedish mortgage rules.
 *
 * Swedish rules:
 * - LTV > 70%: 2% yearly amortization
 * - LTV 50-70%: 1% yearly amortization
 * - LTV ≤ 50%: No requirement
 * - Additional 1% if total debt > 4.5x gross annual income
 *
 * @param params - Amortization parameters
 * @returns Monthly amortization amount and explanation
 */
export function calculateAmorteringskrav(params: {
  principal: number;
  purchasePrice: number;
  grossAnnualIncome?: number;
  totalDebt?: number;
}): AmortizationResult {
  const ltv = (params.principal / params.purchasePrice) * 100;

  let yearlyPercent = 0;
  let reason = '';

  // Rule 1: LTV-based amortization
  if (ltv > 70) {
    yearlyPercent = 2;
    reason = `LTV ${ltv.toFixed(1)}% > 70% → 2% yearly`;
  } else if (ltv > 50) {
    yearlyPercent = 1;
    reason = `LTV ${ltv.toFixed(1)}% (50-70%) → 1% yearly`;
  } else {
    reason = `LTV ${ltv.toFixed(1)}% ≤ 50% → no requirement`;
  }

  // Rule 2: Additional 1% if total debt > 4.5x gross income
  if (params.grossAnnualIncome && params.totalDebt) {
    const debtToIncome = params.totalDebt / params.grossAnnualIncome;
    if (debtToIncome > 4.5) {
      yearlyPercent += 1;
      reason += ` + 1% (debt ${debtToIncome.toFixed(1)}x income > 4.5x)`;
    }
  }

  const monthlyAmortization = (params.principal * (yearlyPercent / 100)) / 12;

  return {
    monthlyAmortization: roundCurrency(monthlyAmortization),
    yearlyAmortizationPercent: yearlyPercent,
    reason
  };
}

/**
 * Calculate monthly mortgage payment for Swedish market (with amorteringskrav).
 *
 * Swedish mortgage payment includes:
 * - Interest component (PMT formula)
 * - Mandatory amortization (amorteringskrav: 0-3% yearly based on LTV)
 *
 * Enforces 85% LTV cap (bolånetak).
 *
 * @param params - Swedish mortgage parameters
 * @returns Monthly payment breakdown with interest, amortization, and LTV
 * @throws Error if LTV > 85% or parameters invalid
 */
export function calculateMortgagePayment(params: SwedishMortgageParams): MortgageResult {
  const { purchasePrice, downPaymentPercent, annualInterestRate, loanTermYears } = params;

  // Calculate principal and LTV
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const principal = purchasePrice - downPayment;
  const ltv = (principal / purchasePrice) * 100;

  // Validate 85% LTV cap (bolånetak)
  if (ltv > 85) {
    throw new Error(`LTV ${ltv.toFixed(1)}% exceeds 85% bolånetak (loan cap). Minimum down payment is 15%.`);
  }

  // Validate inputs
  if (purchasePrice <= 0) {
    throw new Error('Purchase price must be positive');
  }
  if (downPaymentPercent < 0 || downPaymentPercent > 100) {
    throw new Error('Down payment percent must be between 0 and 100');
  }
  if (annualInterestRate < 0) {
    throw new Error('Interest rate must be non-negative');
  }
  if (loanTermYears <= 0) {
    throw new Error('Loan term must be positive');
  }

  // Calculate interest-only payment using PMT formula
  const monthlyRate = annualInterestRate / 12;
  const numPayments = loanTermYears * 12;

  let monthlyInterest: number;
  if (annualInterestRate === 0) {
    monthlyInterest = 0;  // 0% interest edge case
  } else {
    const factor = Math.pow(1 + monthlyRate, numPayments);
    monthlyInterest = principal * (monthlyRate * factor) / (factor - 1);
  }

  // Calculate mandatory amortization (amorteringskrav)
  const amortization = calculateAmorteringskrav({
    principal,
    purchasePrice
  });

  const monthlyPayment = monthlyInterest + amortization.monthlyAmortization;
  const totalPayments = monthlyPayment * numPayments;
  const totalInterest = totalPayments - principal;

  return {
    monthlyPayment: roundCurrency(monthlyPayment),
    monthlyInterest: roundCurrency(monthlyInterest),
    monthlyAmortization: amortization.monthlyAmortization,
    amortizationPercent: amortization.yearlyAmortizationPercent,
    amortizationReason: amortization.reason,
    totalPayments: roundCurrency(totalPayments),
    totalInterest: roundCurrency(totalInterest),
    ltv: roundPercentage(ltv)
  };
}

/**
 * Calculate total monthly cost of homeownership (Swedish market).
 *
 * Includes: mortgage payment (interest + amortization), property taxes, insurance, BRF fee, and maintenance.
 * Note: PMI doesn't exist in Sweden. Maintenance only applies to villas (included in BRF for apartments).
 *
 * @param params - Swedish total cost parameters
 * @returns Breakdown of monthly costs and total
 */
export function calculateTotalCost(params: SwedishTotalCostParams): TotalCostResult {
  const {
    purchasePrice,
    downPaymentPercent,
    annualInterestRate,
    loanTermYears,
    propertyType,
    propertyTaxAnnual = 0,
    insuranceAnnual = 0,
    brfMonthly = 0,
    maintenanceRate
  } = params;

  // Calculate mortgage payment (includes amortization)
  const mortgage = calculateMortgagePayment({
    purchasePrice,
    downPaymentPercent,
    annualInterestRate,
    loanTermYears,
    propertyType
  });

  // Monthly costs
  const monthlyPropertyTax = roundCurrency(propertyTaxAnnual / 12);
  const monthlyInsurance = roundCurrency(insuranceAnnual / 12);
  const monthlyBRF = brfMonthly;

  // Maintenance: 1% for villa, 0 for brf (included in BRF fee)
  const effectiveMaintenanceRate = propertyType === 'villa'
    ? (maintenanceRate !== undefined ? maintenanceRate : 0.01)
    : 0;
  const monthlyMaintenance = roundCurrency((purchasePrice * effectiveMaintenanceRate) / 12);

  const totalMonthly =
    mortgage.monthlyPayment +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyBRF +
    monthlyMaintenance;

  return {
    monthlyMortgage: mortgage.monthlyPayment,
    monthlyInterest: mortgage.monthlyInterest,
    monthlyAmortization: mortgage.monthlyAmortization,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyBRF,
    monthlyMaintenance,
    totalMonthly: roundCurrency(totalMonthly),
    totalAnnual: roundCurrency(totalMonthly * 12)
  };
}

/**
 * Calculate affordability using Swedish kalkylränta (stress test).
 *
 * Swedish banks test affordability at a higher "stress test rate" (kalkylränta),
 * typically 5-7%, even if actual rate is lower. This ensures borrowers can afford
 * the mortgage if rates increase.
 *
 * Swedish thresholds (more conservative than US):
 * - Housing cost should be < 50% of gross income at stress test rate (very conservative)
 * - Total debt should be < 60% of gross income at stress test rate (standard)
 *
 * @param params - Swedish affordability parameters with stress test rate
 * @returns Affordability ratios and flags
 * @throws Error if income is zero or negative
 */
export function calculateAffordability(params: SwedishAffordabilityParams): AffordabilityResult {
  const { grossMonthlyIncome, monthlyHousingCost, monthlyOtherDebts, stressTestRate } = params;

  // Validate income
  if (grossMonthlyIncome <= 0) {
    throw new Error('Gross monthly income must be positive');
  }

  // Calculate ratios at stress test rate
  const housingRatio = (monthlyHousingCost / grossMonthlyIncome) * 100;
  const totalDebtRatio = ((monthlyHousingCost + monthlyOtherDebts) / grossMonthlyIncome) * 100;

  // Swedish affordability thresholds
  const canAffordConservative = totalDebtRatio <= 50;  // Very conservative
  const canAffordStandard = totalDebtRatio <= 60;      // Standard Swedish threshold

  return {
    housingCostRatio: roundPercentage(housingRatio),
    totalDebtRatio: roundPercentage(totalDebtRatio),
    stressTestRate,
    canAffordConservative,
    canAffordStandard,
    reasoning: `At ${stressTestRate}% kalkylränta: housing ${housingRatio.toFixed(1)}%, total debt ${totalDebtRatio.toFixed(1)}%`
  };
}
