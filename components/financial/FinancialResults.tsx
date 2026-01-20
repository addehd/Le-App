import { View, Text } from 'react-native';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import type { FinancialData } from '../../lib/store/propertyLinkStore';

interface FinancialResultsProps {
  results: FinancialData['results'] | null;
  mortgage?: FinancialData['mortgage'];
  totalCost?: FinancialData['totalCost'];
  affordability?: FinancialData['affordability'];
}

export function FinancialResults({
  results,
  mortgage,
  totalCost,
  affordability
}: FinancialResultsProps) {
  // Helper function to format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Helper function to get DTI color and icon
  const getDTIStatus = (dti: number, type: 'front' | 'back') => {
    const frontEndThresholds = { green: 28, yellow: 36 };
    const backEndThresholds = { green: 36, yellow: 43 };

    const thresholds = type === 'front' ? frontEndThresholds : backEndThresholds;

    if (dti <= thresholds.green) {
      return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle, iconColor: '#10b981' };
    } else if (dti <= thresholds.yellow) {
      return { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertCircle, iconColor: '#f59e0b' };
    } else {
      return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle, iconColor: '#ef4444' };
    }
  };

  // Helper function to calculate total interest and total payments
  const calculateTotals = () => {
    if (!results?.monthlyPayment || !mortgage) return null;

    const totalMonths = mortgage.loanTermYears * 12;
    const totalPayments = results.monthlyPayment * totalMonths;
    const totalInterest = totalPayments - mortgage.principal;

    return { totalPayments, totalInterest };
  };

  // If no results, show placeholder
  if (!results) {
    return (
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <Text className="text-gray-500 dark:text-gray-400 text-center text-base">
          Calculate to see results
        </Text>
      </View>
    );
  }

  const totals = calculateTotals();

  return (
    <View>
      {/* Mortgage Payment Section */}
      {results.monthlyPayment !== undefined && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Mortgage Payment
          </Text>

          {/* Monthly Payment - Large and prominent */}
          <View className="mb-4">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(results.monthlyPayment)}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              per month
            </Text>
          </View>

          {/* Total Payments and Interest */}
          {totals && (
            <View className="space-y-2">
              <View className="flex-row justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Total Payments ({mortgage?.loanTermYears} years)
                </Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(totals.totalPayments)}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Total Interest
                </Text>
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(totals.totalInterest)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Total Monthly Cost Section */}
      {results.totalMonthly !== undefined && totalCost && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Total Monthly Cost
          </Text>

          {/* Breakdown */}
          <View className="space-y-2 mb-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Mortgage Payment
              </Text>
              <Text className="text-sm text-gray-900 dark:text-white">
                {formatCurrency(results.monthlyPayment || 0)}
              </Text>
            </View>

            {totalCost.propertyTaxAnnual && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Property Tax
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalCost.propertyTaxAnnual / 12)}
                </Text>
              </View>
            )}

            {totalCost.insuranceAnnual && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Insurance
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalCost.insuranceAnnual / 12)}
                </Text>
              </View>
            )}

            {totalCost.hoaMonthly && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  HOA
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalCost.hoaMonthly)}
                </Text>
              </View>
            )}

            {totalCost.pmiMonthly && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  PMI
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(totalCost.pmiMonthly)}
                </Text>
              </View>
            )}

            {totalCost.maintenanceRate && totalCost.homeValue && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Maintenance ({formatPercentage(totalCost.maintenanceRate * 100)})
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency((totalCost.homeValue * totalCost.maintenanceRate) / 12)}
                </Text>
              </View>
            )}
          </View>

          {/* Total Monthly */}
          <View className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Total Monthly
              </Text>
              <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(results.totalMonthly)}
              </Text>
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
              {formatCurrency(results.totalMonthly * 12)}/year
            </Text>
          </View>
        </View>
      )}

      {/* Affordability Section */}
      {results.frontEndDTI !== undefined && results.backEndDTI !== undefined && affordability && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Affordability Analysis
          </Text>

          {/* Front-End DTI */}
          <View className="mb-3">
            {(() => {
              const status = getDTIStatus(results.frontEndDTI, 'front');
              const Icon = status.icon;
              return (
                <View className={`${status.bg} rounded-lg p-3 border border-gray-200 dark:border-gray-700`}>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Front-End DTI
                    </Text>
                    <Icon size={20} color={status.iconColor} />
                  </View>
                  <Text className={`text-2xl font-bold ${status.color}`}>
                    {formatPercentage(results.frontEndDTI)}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Housing costs / Gross income
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Back-End DTI */}
          <View className="mb-3">
            {(() => {
              const status = getDTIStatus(results.backEndDTI, 'back');
              const Icon = status.icon;
              return (
                <View className={`${status.bg} rounded-lg p-3 border border-gray-200 dark:border-gray-700`}>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Back-End DTI
                    </Text>
                    <Icon size={20} color={status.iconColor} />
                  </View>
                  <Text className={`text-2xl font-bold ${status.color}`}>
                    {formatPercentage(results.backEndDTI)}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    All debts / Gross income
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Affordability Badge */}
          <View className={`rounded-lg p-4 ${
            results.canAfford
              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
              : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
          }`}>
            <View className="flex-row items-center justify-center">
              {results.canAfford ? (
                <>
                  <CheckCircle size={24} color="#10b981" className="mr-2" />
                  <Text className="text-lg font-bold text-green-700 dark:text-green-400">
                    Affordable
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={24} color="#ef4444" className="mr-2" />
                  <Text className="text-lg font-bold text-red-700 dark:text-red-400">
                    May Not Qualify
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Loan Type Qualifications */}
          <View className="mt-4 space-y-2">
            <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Loan Type Guidelines:
            </Text>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Conventional (≤28% / ≤36%)
              </Text>
              {results.frontEndDTI <= 28 && results.backEndDTI <= 36 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <XCircle size={16} color="#ef4444" />
              )}
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                FHA (≤31% / ≤43%)
              </Text>
              {results.frontEndDTI <= 31 && results.backEndDTI <= 43 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <XCircle size={16} color="#ef4444" />
              )}
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Ideal (≤28% / ≤36%)
              </Text>
              {results.frontEndDTI <= 28 && results.backEndDTI <= 36 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <XCircle size={16} color="#ef4444" />
              )}
            </View>
          </View>
        </View>
      )}

      {/* Calculation Timestamp */}
      <View className="mt-2">
        <Text className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Calculated at {new Date(results.calculatedAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
