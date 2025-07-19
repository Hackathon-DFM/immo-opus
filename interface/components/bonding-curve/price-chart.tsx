'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useBondingCurve } from '@/lib/hooks/use-bonding-curve';
import { useTheme } from '@/lib/hooks/use-theme';

interface PriceChartProps {
  bondingCurveAddress: `0x${string}`;
  tokenSymbol: string;
}

interface PricePoint {
  time: string;
  price: number;
  marketCap: number;
}

export function PriceChart({ bondingCurveAddress, tokenSymbol }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | 'all'>('24h');
  
  const { currentPrice, currentMarketCap } = useBondingCurve(bondingCurveAddress);
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const chartColors = {
    primary: '#3b82f6', // blue-500
    grid: isDark ? '#374151' : '#E5E7EB', // gray-700 : gray-200
    text: isDark ? '#9CA3AF' : '#6B7280', // gray-400 : gray-500
    background: isDark ? '#1f2937' : 'white', // gray-800 : white
    border: isDark ? '#374151' : '#E5E7EB', // gray-700 : gray-200
  };

  // Simulate price history for demo (in production, fetch from events or indexer)
  useEffect(() => {
    const now = Date.now();
    const price = parseFloat(currentPrice);
    const marketCap = parseFloat(currentMarketCap);
    
    if (price > 0) {
      // Generate simulated historical data
      const points = 50;
      const history: PricePoint[] = [];
      
      for (let i = 0; i < points; i++) {
        const timeOffset = (points - i) * (timeframe === '1h' ? 72000 : timeframe === '24h' ? 1728000 : 3456000); // 1.2min, 28.8min, or 57.6min intervals
        const priceVariation = 1 - (i / points) * 0.3 + Math.random() * 0.1; // Simulate growth with noise
        
        history.push({
          time: new Date(now - timeOffset).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: price * priceVariation,
          marketCap: marketCap * priceVariation,
        });
      }
      
      // Add current price
      history.push({
        time: 'Now',
        price: price,
        marketCap: marketCap,
      });
      
      setPriceHistory(history);
    }
  }, [currentPrice, currentMarketCap, timeframe]);

  const formatPrice = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    if (value < 0.000001) return `$${value.toExponential(2)}`;
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(2)}`;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tokenSymbol} Price Chart</h3>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate tabular-nums">{formatPrice(parseFloat(currentPrice))}</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">USDC</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {(['1h', '24h', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tf === 'all' ? 'All' : tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceHistory}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis 
              dataKey="time" 
              stroke={chartColors.text}
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke={chartColors.text}
              fontSize={12}
              tickLine={false}
              tickFormatter={formatPrice}
              domain={['dataMin * 0.95', 'dataMax * 1.05']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.background,
                border: `1px solid ${chartColors.border}`,
                borderRadius: '8px',
                padding: '8px 12px',
                color: isDark ? '#f3f4f6' : '#1f2937'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'price') return [formatPrice(value), 'Price'];
                return [formatMarketCap(value), 'Market Cap'];
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Cap</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate tabular-nums" title={formatMarketCap(parseFloat(currentMarketCap))}>
            {formatMarketCap(parseFloat(currentMarketCap))}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">24h Change</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            +{(Math.random() * 20 + 5).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}