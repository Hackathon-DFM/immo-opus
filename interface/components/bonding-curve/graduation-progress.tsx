'use client';

import { useBondingCurve } from '@/lib/hooks/use-bonding-curve';

interface GraduationProgressProps {
  bondingCurveAddress: `0x${string}`;
  tokenSymbol: string;
}

export function GraduationProgress({ bondingCurveAddress, tokenSymbol }: GraduationProgressProps) {
  const { 
    currentMarketCap, 
    targetMarketCap, 
    graduationProgress, 
    graduated, 
    tokenReserve,
    currentPrice,
    calculateUsdcNeededForGraduation,
    isLoading,
    hasError
  } = useBondingCurve(bondingCurveAddress);

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    if (num < 0.01) return `$${num.toFixed(6)}`;
    return `$${num.toFixed(2)}`;
  };

  const formatTokenAmount = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  if (hasError) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Graduation Progress</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            Error loading graduation data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Graduation Progress</h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-2"></div>
          </div>
        </div>
      </div>
    );
  }

  const usdcNeeded = calculateUsdcNeededForGraduation ? calculateUsdcNeededForGraduation() : '0';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Graduation Progress</h3>
        {graduated && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
            Graduated! 🎓
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            <span>Current Market Cap</span>
            <span>Target: {formatValue(targetMarketCap)}</span>
          </div>
          
          <div className="relative h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                graduated ? 'bg-green-500' : 
                graduationProgress > 90 ? 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse' :
                graduationProgress > 75 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 
                'bg-blue-500'
              } ${graduationProgress > 75 && !graduated ? 'shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}
              style={{ width: `${Math.min(graduationProgress, 100)}%` }}
            >
              <div className={`absolute inset-0 ${graduated ? 'bg-white/20 animate-pulse' : 'bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer'}`}></div>
            </div>
            
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute h-full w-px bg-white/50 animate-fade-in"
                  style={{ left: `${milestone}%`, animationDelay: `${milestone * 10}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 gap-2">
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate tabular-nums min-w-0">
              {formatValue(currentMarketCap)}
            </span>
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
              {graduationProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        {!graduated && graduationProgress > 90 && (
          <div className="bg-purple-50 dark:bg-purple-900/50 p-4 rounded-lg border border-purple-200 dark:border-purple-700 animate-pulse">
            <h4 className="font-medium text-purple-900 dark:text-purple-400 mb-2">🚀 Almost There!</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {tokenSymbol} is {graduationProgress.toFixed(1)}% of the way to graduation! 
              Only approximately {formatValue(usdcNeeded)} more USDC needed to reach the target market cap.
            </p>
          </div>
        )}

        {!graduated && graduationProgress <= 90 && (
          <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">What happens at graduation?</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• All remaining tokens transfer to Direct Pool</li>
              <li>• Collected USDC moves to Direct Pool</li>
              <li>• Market Makers can start borrowing tokens</li>
              <li>• Public trading ends on bonding curve</li>
            </ul>
          </div>
        )}

        {graduated && (
          <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-400 mb-2">Bonding Curve Graduated!</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              {tokenSymbol} has reached its target market cap. Trading has moved to the Direct Pool 
              where registered Market Makers can now borrow tokens for professional trading.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <p className="font-medium text-gray-600 dark:text-gray-400">Remaining to Graduate</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatValue((parseFloat(targetMarketCap) - parseFloat(currentMarketCap)).toString())}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <p className="font-medium text-gray-600 dark:text-gray-400">Token Reserve</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTokenAmount(tokenReserve)} {tokenSymbol}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <p className="font-medium text-gray-600 dark:text-gray-400">Current Price</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatValue(currentPrice)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <p className="font-medium text-gray-600 dark:text-gray-400">Est. USDC to Graduate</p>
            <p className="font-semibold text-gray-900 dark:text-white" title="This is a rough estimate">
              ~{formatValue(usdcNeeded)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}