'use client';

import { useBondingCurve } from '@/lib/hooks/use-bonding-curve';

interface GraduationProgressProps {
  bondingCurveAddress: `0x${string}`;
  tokenSymbol: string;
}

export function GraduationProgress({ bondingCurveAddress, tokenSymbol }: GraduationProgressProps) {
  const { currentMarketCap, targetMarketCap, graduationProgress, graduated } = useBondingCurve(bondingCurveAddress);

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Current Market Cap</span>
            <span>Target: {formatValue(targetMarketCap)}</span>
          </div>
          
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                graduated ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(graduationProgress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute h-full w-px bg-white/50"
                  style={{ left: `${milestone}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(currentMarketCap)}
            </span>
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {graduationProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        {!graduated && (
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
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Remaining to Graduate</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatValue((parseFloat(targetMarketCap) - parseFloat(currentMarketCap)).toString())}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Token Reserve</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {parseFloat(useBondingCurve(bondingCurveAddress).tokenReserve).toLocaleString()} {tokenSymbol}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}