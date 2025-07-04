'use client';

import { BuySellForms } from './buy-sell-forms';
import { PriceChart } from './price-chart';
import { GraduationProgress } from './graduation-progress';

interface TradingInterfaceProps {
  bondingCurveAddress: `0x${string}`;
  usdcAddress: `0x${string}`;
  tokenName: string;
  tokenSymbol: string;
}

export function TradingInterface({ 
  bondingCurveAddress, 
  usdcAddress, 
  tokenName, 
  tokenSymbol 
}: TradingInterfaceProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{tokenName}</h1>
        <p className="text-gray-600 mt-1">Trade {tokenSymbol} on the bonding curve</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Price chart and graduation progress */}
        <div className="lg:col-span-2 space-y-6">
          <PriceChart 
            bondingCurveAddress={bondingCurveAddress} 
            tokenSymbol={tokenSymbol} 
          />
          
          <GraduationProgress 
            bondingCurveAddress={bondingCurveAddress} 
            tokenSymbol={tokenSymbol} 
          />
        </div>

        {/* Right column - Buy/Sell forms */}
        <div>
          <BuySellForms 
            bondingCurveAddress={bondingCurveAddress}
            usdcAddress={usdcAddress}
            tokenSymbol={tokenSymbol}
          />
        </div>
      </div>
    </div>
  );
}