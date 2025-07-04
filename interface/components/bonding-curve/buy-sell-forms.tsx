'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useBondingCurve, useBondingCurveBuy, useBondingCurveSell, useUSDCApproval } from '@/lib/hooks/use-bonding-curve';

interface BuySellFormsProps {
  bondingCurveAddress: `0x${string}`;
  usdcAddress: `0x${string}`;
  tokenSymbol: string;
}

export function BuySellForms({ bondingCurveAddress, usdcAddress, tokenSymbol }: BuySellFormsProps) {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyTokensOut, setBuyTokensOut] = useState('0');
  const [sellUsdcOut, setSellUsdcOut] = useState('0');
  const [slippage, setSlippage] = useState(0.5);
  const [isApproving, setIsApproving] = useState(false);

  const { currentPrice, graduated, calculateBuyReturn, calculateSellReturn } = useBondingCurve(bondingCurveAddress);
  const { buy, isPending: isBuying } = useBondingCurveBuy(bondingCurveAddress);
  const { sell, isPending: isSelling } = useBondingCurveSell(bondingCurveAddress);
  const { allowance, checkAndApprove, isApproving: isApprovingHook } = useUSDCApproval(usdcAddress, bondingCurveAddress);

  // Calculate expected output when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (activeTab === 'buy' && buyAmount && parseFloat(buyAmount) > 0) {
        const tokens = await calculateBuyReturn(buyAmount);
        setBuyTokensOut(tokens ? formatUnits(tokens, 18) : '0');
      } else if (activeTab === 'sell' && sellAmount && parseFloat(sellAmount) > 0) {
        const usdc = await calculateSellReturn(sellAmount);
        setSellUsdcOut(usdc ? formatUnits(usdc, 6) : '0');
      }
    };
    
    calculateOutput();
  }, [buyAmount, sellAmount, activeTab, calculateBuyReturn, calculateSellReturn]);

  const handleBuy = async () => {
    if (!address || !buyAmount || graduated) return;

    try {
      setIsApproving(true);
      
      // Check and approve USDC if needed
      const approvalResult = await checkAndApprove(buyAmount);
      
      if (approvalResult) {
        setIsApproving(false);
        // Execute buy
        await buy(buyAmount, slippage);
        setBuyAmount('');
        setBuyTokensOut('0');
      }
    } catch (error) {
      console.error('Buy failed:', error);
      setIsApproving(false);
    }
  };

  const handleSell = async () => {
    if (!address || !sellAmount || graduated) return;

    try {
      await sell(sellAmount, slippage);
      setSellAmount('');
      setSellUsdcOut('0');
    } catch (error) {
      console.error('Sell failed:', error);
    }
  };

  if (graduated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-medium">This bonding curve has graduated!</p>
        <p className="text-yellow-700 text-sm mt-1">Trading has moved to the Direct Pool.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-2 px-4 font-medium rounded-l-lg transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-2 px-4 font-medium rounded-r-lg transition-colors ${
            activeTab === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'buy' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                You Pay (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  USDC
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                You Receive ({tokenSymbol})
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={buyTokensOut}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {tokenSymbol}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                You Sell ({tokenSymbol})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {tokenSymbol}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                You Receive (USDC)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sellUsdcOut}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  USDC
                </span>
              </div>
            </div>
          </>
        )}

        <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Price:</span>
            <span className="font-medium">${currentPrice} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slippage Tolerance:</span>
            <div className="flex items-center space-x-1">
              {[0.1, 0.5, 1].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-2 py-1 text-xs rounded ${
                    slippage === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {!address ? (
          <button
            disabled
            className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Connect Wallet
          </button>
        ) : activeTab === 'buy' ? (
          <button
            onClick={handleBuy}
            disabled={!buyAmount || parseFloat(buyAmount) <= 0 || isBuying || isApproving}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !buyAmount || parseFloat(buyAmount) <= 0 || isBuying || isApproving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isApproving ? 'Approving USDC...' : isBuying ? 'Buying...' : 'Buy'}
          </button>
        ) : (
          <button
            onClick={handleSell}
            disabled={!sellAmount || parseFloat(sellAmount) <= 0 || isSelling}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !sellAmount || parseFloat(sellAmount) <= 0 || isSelling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isSelling ? 'Selling...' : 'Sell'}
          </button>
        )}
      </div>
    </div>
  );
}