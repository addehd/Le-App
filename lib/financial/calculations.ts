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

export interface MortgageParams {
  principal: number;        // loan amount
  annualInterestRate: number; // as decimal (0.06 for 6%)
  loanTermYears: number;    // 15, 30, etc.
}

export interface MortgageResult {
  monthlyPayment: number;
  totalPayments: number;    // monthlyPayment × months
  totalInterest: number;    // totalPayments - principal
}

export interface TotalCostParams {
  purchasePrice: number;
  mortgageParams: MortgageParams;
  propertyTaxAnnual?: number;   // optional, varies by location
  insuranceAnnual?: number;      // optional, varies by property
  hoaMonthly?: number;           // optional, 0 if not applicable
  pmiMonthly?: number;           // optional, 0 if down payment ≥ 20%
  maintenanceRate?: number;      // optional, default 1% (0.01)
}

export interface TotalCostResult {
  monthlyMortgage: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  monthlyMaintenance: number;
  totalMonthly: number;
  totalAnnual: number;
}

export interface DTIParams {
  grossMonthlyIncome: number;
  monthlyHousingCost: number;  // from TotalCostResult.totalMonthly
  monthlyOtherDebts: number;   // credit cards, auto loans, student loans, etc.
}

export interface DTIResult {
  frontEndDTI: number;         // percentage
  backEndDTI: number;          // percentage
  canAffordConventional: boolean;  // backEndDTI ≤ 50%
  canAffordFHA: boolean;           // frontEndDTI ≤ 31% && backEndDTI ≤ 43%
  canAffordIdeal: boolean;         // backEndDTI ≤ 36%
}

/**
 * Calculate monthly mortgage payment using the PMT formula.
 *
 * Formula: A = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 * Where:
 *   A = monthly payment amount
 *   P = mortgage principal (loan amount)
 *   r = monthly interest rate (annual rate / 12)
 *   n = loan term in months
 *
 * @param params - Mortgage parameters (principal, rate, term)
 * @returns Monthly payment, total payments, and total interest
 * @throws Error if parameters are invalid (negative principal/rate, zero/negative term)
 */
export function calculateMortgagePayment(params: MortgageParams): MortgageResult {
  const { principal, annualInterestRate, loanTermYears } = params;

  // Validate inputs
  if (principal < 0) {
    throw new Error('Principal must be non-negative');
  }
  if (annualInterestRate < 0) {
    throw new Error('Interest rate must be non-negative');
  }
  if (loanTermYears <= 0) {
    throw new Error('Loan term must be positive');
  }

  // Handle zero principal edge case
  if (principal === 0) {
    return {
      monthlyPayment: 0,
      totalPayments: 0,
      totalInterest: 0,
    };
  }

  // Convert to monthly values
  const monthlyRate = annualInterestRate / 12;
  const numberOfPayments = loanTermYears * 12;

  // Handle 0% interest edge case (simple division)
  if (annualInterestRate === 0) {
    const monthlyPayment = principal / numberOfPayments;
    return {
      monthlyPayment: roundCurrency(monthlyPayment),
      totalPayments: roundCurrency(principal),
      totalInterest: 0,
    };
  }

  // PMT formula: A = P × [r(1 + r)^n] / [(1 + r)^n - 1]
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);

  // Round monthly payment first, then calculate total based on rounded value
  const roundedMonthlyPayment = roundCurrency(monthlyPayment);
  const totalPayments = roundedMonthlyPayment * numberOfPayments;
  const totalInterest = totalPayments - principal;

  return {
    monthlyPayment: roundedMonthlyPayment,
    totalPayments: roundCurrency(totalPayments),
    totalInterest: roundCurrency(totalInterest),
  };
}

/**
 * Calculate total monthly cost of homeownership.
 *
 * Includes: mortgage payment, property taxes, insurance, HOA, PMI, and maintenance.
 *
 * @param params - Total cost parameters
 * @returns Breakdown of monthly costs and total
 */
export function calculateTotalCost(params: TotalCostParams): TotalCostResult {
  const {
    purchasePrice,
    mortgageParams,
    propertyTaxAnnual = 0,
    insuranceAnnual = 0,
    hoaMonthly = 0,
    pmiMonthly = 0,
    maintenanceRate = 0.01, // Default 1%
  } = params;

  // Calculate mortgage payment
  const mortgageResult = calculateMortgagePayment(mortgageParams);
  const monthlyMortgage = mortgageResult.monthlyPayment;

  // Convert annual costs to monthly
  const monthlyPropertyTax = roundCurrency(propertyTaxAnnual / 12);
  const monthlyInsurance = roundCurrency(insuranceAnnual / 12);

  // Calculate monthly maintenance based on purchase price
  const monthlyMaintenance = roundCurrency((purchasePrice * maintenanceRate) / 12);

  // Sum all components
  const totalMonthly = monthlyMortgage + monthlyPropertyTax + monthlyInsurance +
                       hoaMonthly + pmiMonthly + monthlyMaintenance;
  const totalAnnual = totalMonthly * 12;

  return {
    monthlyMortgage: roundCurrency(monthlyMortgage),
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyHOA: hoaMonthly,
    monthlyPMI: pmiMonthly,
    monthlyMaintenance,
    totalMonthly: roundCurrency(totalMonthly),
    totalAnnual: roundCurrency(totalAnnual),
  };
}

/**
 * Calculate debt-to-income ratios for mortgage affordability.
 *
 * Two ratios:
 *   - Front-end DTI: Housing costs only (percentage of income)
 *   - Back-end DTI: All debts including housing (percentage of income)
 *
 * @param params - DTI parameters (income, housing cost, other debts)
 * @returns DTI percentages and affordability flags
 * @throws Error if income is zero or negative
 */
export function calculateDTI(params: DTIParams): DTIResult {
  const { grossMonthlyIncome, monthlyHousingCost, monthlyOtherDebts } = params;

  // Validate income
  if (grossMonthlyIncome <= 0) {
    throw new Error('Gross monthly income must be positive');
  }

  // Calculate DTI ratios
  const frontEndDTI = (monthlyHousingCost / grossMonthlyIncome) * 100;
  const backEndDTI = ((monthlyHousingCost + monthlyOtherDebts) / grossMonthlyIncome) * 100;

  // Affordability thresholds
  const canAffordConventional = backEndDTI <= 50;
  const canAffordFHA = frontEndDTI <= 31 && backEndDTI <= 43;
  const canAffordIdeal = backEndDTI <= 36;

  return {
    frontEndDTI: roundPercentage(frontEndDTI),
    backEndDTI: roundPercentage(backEndDTI),
    canAffordConventional,
    canAffordFHA,
    canAffordIdeal,
  };
}
