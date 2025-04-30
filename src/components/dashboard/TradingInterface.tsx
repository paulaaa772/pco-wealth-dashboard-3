'use client'

import { useState, useEffect, useRef } from 'react';
import { AITradingEngine, TradeSignal } from '@/lib/trading-engine/AITradingEngine';
import { TradingMode } from '@/lib/trading-engine/TradingMode';
import ADXIndicator from './ADXIndicator';

// Define the Position interface locally since the imported one has issues
interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  timestamp: number;
  exitPrice?: number;
  closeDate?: Date;
  status?: 'open' | 'closed';
  profit?: number;
  stopLoss?: number;
  strategy?: string;
  confidence?: number;
}

export interface TradingInterfaceProps {
  onSymbolChange: (symbol: string) => void;
  currentSymbol?: string; // Add this prop for two-way binding
  positions: Position[]; // Receive positions from parent
  onClosePosition: (positionId: string) => void; // Callback to parent to close
  onNewAIPosition: (position: Position) => void; // Callback when AI creates position
}

export default function TradingInterface({ 
    onSymbolChange, 
    currentSymbol = 'AAPL', 
    positions, // Use prop
    onClosePosition, // Use prop
    onNewAIPosition // Use prop
}: TradingInterfaceProps) {
  // Setup state for the trading interface
  const [mode, setMode] = useState<TradingMode>(TradingMode.DEMO);
  const [symbol, setSymbol] = useState<string>(currentSymbol);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [lastSignal, setLastSignal] = useState<TradeSignal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Add new state for balance tracking
  const [accountBalance, setAccountBalance] = useState<number>(10000); // Default $10,000
  const [allocatedBalance, setAllocatedBalance] = useState<number>(5000); // Default $5,000 allocated
  const [dailyTradeLimit, setDailyTradeLimit] = useState<number>(500); // Default $500 daily limit
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [showBalanceModal, setShowBalanceModal] = useState<boolean>(false);
  
  const [performance, setPerformance] = useState({
    winRate: 0,
    profitLoss: 0,
    totalTrades: 0,
  });
  
  // Add state for detailed profit/loss tracking
  const [tradeProfitLoss, setTradeProfitLoss] = useState<{
    totalProfit: number,
    totalLoss: number,
    netPL: number,
    todayPL: number,
    trades: {id: string, symbol: string, pl: number, date: Date, strategy?: string, type?: 'buy' | 'sell', entryPrice?: number, exitPrice?: number, quantity?: number, confidence?: number}[]
  }>({
    totalProfit: 0,
    totalLoss: 0,
    netPL: 0,
    todayPL: 0,
    trades: []
  });
  
  // Add state for ADX values
  const [adxValues, setAdxValues] = useState({
    adx: 0,
    plusDI: 0,
    minusDI: 0
  });
  const aiEngine = useRef<AITradingEngine | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add new state for market scanner
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<Array<TradeSignal & { company?: string }>>([]);
  const [showScanResults, setShowScanResults] = useState<boolean>(false);
  // List of popular stocks to scan
  const stocksToScan = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT',
    'DIS', 'BAC', 'HD', 'PG', 'XOM', 'INTC', 'VZ', 'CSCO', 'NFLX', 'ADBE',
    'PYPL', 'CRM', 'AVGO', 'QCOM', 'TXN', 'COST', 'NKE', 'MCD', 'ABT', 'UNH'
  ];

  // Add new state for trade details modal
  const [selectedTrade, setSelectedTrade] = useState<{
    id: string, 
    symbol: string, 
    pl: number, 
    date: Date,
    strategy?: string,
    type?: 'buy' | 'sell',
    entryPrice?: number,
    exitPrice?: number,
    quantity?: number,
    confidence?: number
  } | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState<boolean>(false);

  // Recalculate performance whenever the positions prop changes
  useEffect(() => {
      console.log("[TRADING UI] Positions prop updated, recalculating performance.");
      updatePerformanceDisplay(positions);
      updateTradeProfitLoss(positions);
  }, [positions]);

  // When currentSymbol prop changes, update our local state
  useEffect(() => {
    if (currentSymbol && currentSymbol !== symbol) {
      console.log('[TRADING UI] External symbol update:', currentSymbol);
      setSymbol(currentSymbol);
    }
  }, [currentSymbol, symbol]);

  // On component mount
  useEffect(() => {
    console.log('[TRADING UI] Component mounted with symbol:', symbol);
    
    // Load saved balance data from localStorage
    const savedBalance = localStorage.getItem('accountBalance');
    const savedAllocated = localStorage.getItem('allocatedBalance');
    const savedDailyLimit = localStorage.getItem('dailyTradeLimit');
    
    if (savedBalance) setAccountBalance(parseFloat(savedBalance));
    if (savedAllocated) setAllocatedBalance(parseFloat(savedAllocated));
    if (savedDailyLimit) setDailyTradeLimit(parseFloat(savedDailyLimit));
    
    // Initialize AI engine with the allocated balance
    aiEngine.current = new AITradingEngine(symbol, mode, allocatedBalance);
    
    // Initial market analysis
    analyzeMarket();
    
    // If AI is enabled, we'll analyze the market every 30 seconds
    let interval: NodeJS.Timeout | null = null;
    if (aiEnabled) {
      interval = setInterval(() => {
        if (!isAnalyzing) {
          analyzeMarket();
        }
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Re-analyze when AI is toggled ON, if not already analyzing
  useEffect(() => {
    if (aiEnabled && !isAnalyzing) {
      analyzeMarket();
    }
  }, [aiEnabled]);

  // Handle symbol change from input
  const handleSymbolChange = () => {
    if (!inputRef.current) return;
    
    const newSymbol = inputRef.current.value.trim().toUpperCase();
    if (newSymbol && newSymbol !== symbol && newSymbol.length <= 5) {
      console.log('[TRADING UI] Symbol changed to:', newSymbol);
      setSymbol(newSymbol);
      onSymbolChange(newSymbol); // Notify parent
      if (aiEngine.current) aiEngine.current.setSymbol(newSymbol); // Update engine symbol
      analyzeMarket(newSymbol);
    }
  };

  // Analyze market for current symbol
  const analyzeMarket = async (symbolToAnalyze = symbol) => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      
      console.log('[TRADING UI] Analyzing market for:', symbolToAnalyze);
      
      if (!aiEngine.current) {
        console.log('[TRADING UI] Initializing AI engine');
        aiEngine.current = new AITradingEngine(symbolToAnalyze, mode);
      }
      
      // Fetch ADX values for display (new method to get indicator values)
      const adxData = await fetchADXValues(symbolToAnalyze);
      if (adxData) {
        setAdxValues(adxData);
      }
      
      const signal = await aiEngine.current.analyzeMarket();
      
      if (signal) {
        console.log('[TRADING UI] Signal received:', signal);
        setLastSignal(signal);
        
        // Auto-execute signals in demo mode
        if (mode === TradingMode.DEMO && aiEnabled) {
          executeTradeSignal(signal);
        }
      } else {
        console.log('[TRADING UI] No trading signals available');
      }
    } catch (error) {
      console.error('[TRADING UI] Error analyzing market:', error);
      setErrorMessage('Failed to analyze market data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // New method to fetch ADX values for display
  const fetchADXValues = async (symbolToCheck: string) => {
    try {
      if (!aiEngine.current) return null;
      
      // Use the real ADX calculation from AITradingEngine
      const adxValues = await aiEngine.current.getADXValues(symbolToCheck);
      return adxValues;
    } catch (error) {
      console.error('[TRADING UI] Error fetching ADX values:', error);
      return null;
    }
  };

  // Add new function to update trade profit/loss
  const updateTradeProfitLoss = (currentPositions: Position[]) => {
    const closedTrades = currentPositions.filter(p => p.status === 'closed' && p.profit !== undefined);
    const todayTrades = closedTrades.filter(p => 
      p.closeDate && new Date(p.closeDate).toDateString() === new Date().toDateString()
    );
    
    const winningTrades = closedTrades.filter(p => (p.profit ?? 0) > 0);
    const losingTrades = closedTrades.filter(p => (p.profit ?? 0) <= 0);
    
    const totalProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit ?? 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit ?? 0), 0));
    const netPL = totalProfit - totalLoss;
    const todayPL = todayTrades.reduce((sum, trade) => sum + (trade.profit ?? 0), 0);
    
    const tradeDetails = closedTrades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      pl: trade.profit ?? 0,
      date: trade.closeDate ? new Date(trade.closeDate) : new Date(),
      strategy: trade.strategy,
      type: trade.type,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      confidence: trade.confidence
    })).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort newest first
    
    setTradeProfitLoss({
      totalProfit,
      totalLoss,
      netPL,
      todayPL,
      trades: tradeDetails
    });
    
    // Update account balance with P/L
    updateAccountBalance(netPL);
  };
  
  // Handle account balance updates
  const updateAccountBalance = (profitLoss: number) => {
    // Only update once
    if (profitLoss !== 0 && profitLoss !== tradeProfitLoss.netPL) {
      const newBalance = accountBalance + profitLoss;
      setAccountBalance(newBalance);
      localStorage.setItem('accountBalance', newBalance.toString());
    }
  };
  
  // Handle deposits
  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      const newBalance = accountBalance + amount;
      setAccountBalance(newBalance);
      localStorage.setItem('accountBalance', newBalance.toString());
      setDepositAmount('');
      setShowBalanceModal(false);
    }
  };
  
  // Handle withdrawals
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!isNaN(amount) && amount > 0 && amount <= accountBalance) {
      const newBalance = accountBalance - amount;
      setAccountBalance(newBalance);
      localStorage.setItem('accountBalance', newBalance.toString());
      setWithdrawAmount('');
      setShowBalanceModal(false);
    }
  };
  
  // Update allocated balance
  const handleUpdateAllocated = (newAllocated: number) => {
    if (newAllocated > 0 && newAllocated <= accountBalance) {
      setAllocatedBalance(newAllocated);
      localStorage.setItem('allocatedBalance', newAllocated.toString());
      
      // Update AI engine with new allocated balance
      if (aiEngine.current) {
        aiEngine.current.setTradingBalance(newAllocated);
      }
    }
  };
  
  // Update daily trade limit
  const handleUpdateDailyLimit = (newLimit: number) => {
    if (newLimit > 0 && newLimit <= allocatedBalance) {
      setDailyTradeLimit(newLimit);
      localStorage.setItem('dailyTradeLimit', newLimit.toString());
      
      // Update AI engine with new daily limit
      if (aiEngine.current) {
        aiEngine.current.setDailyTradeLimit(newLimit);
      }
    }
  };

  // Handle view trade details
  const handleViewTradeDetails = (trade: any) => {
    setSelectedTrade(trade);
    setShowTradeDetails(true);
  };

  // Modify executeTradeSignal to store strategy information
  const executeTradeSignal = async (signal: TradeSignal) => {
    try {
      console.log(`[TRADING UI] Attempting to execute ${signal.direction} signal for ${signal.symbol}`);
      
      // Ensure aiEngine exists
      if (!aiEngine.current) {
        console.error('[TRADING UI] AI Engine not initialized!');
        return;
      }
      
      // Check if we have enough allocated balance
      const estimatedCost = signal.price * aiEngine.current.calculatePositionSize(signal.price);
      if (estimatedCost > allocatedBalance) {
        setErrorMessage(`Insufficient allocated balance for this trade. Need $${estimatedCost.toFixed(2)}`);
        return;
      }
      
      // Check daily trade limit
      const todayUsed = tradeProfitLoss.trades
        .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((sum, t) => sum + Math.abs(t.pl), 0);
      
      if (todayUsed + estimatedCost > dailyTradeLimit) {
        setErrorMessage(`This trade would exceed your daily limit of $${dailyTradeLimit}`);
        return;
      }

      const success = await aiEngine.current.executeTradeSignal(signal);
      
      if (success) {
        console.log(`[TRADING UI] ${signal.direction} signal execution successful (Simulated).`);
        const shares = aiEngine.current.calculatePositionSize(signal.price);
        
        if (shares <= 0) {
          console.warn('[TRADING UI] Calculated position size is zero or less. No position opened.');
          return;
        }

        const newPosition: Position = {
          symbol: signal.symbol,
          type: signal.direction,
          entryPrice: signal.price,
          quantity: shares,
          timestamp: Date.now(),
          id: `pos-${Date.now()}`,
          status: 'open', // Mark position as open
          strategy: signal.strategy, // Store strategy information
          confidence: signal.confidence // Store confidence score
        };
        
        // Instead of setPositions, call the parent's handler
        onNewAIPosition(newPosition); 
        console.log('[TRADING UI] Notified parent of new AI position:', newPosition);
      }
    } catch (error) {
      console.error('[TRADING UI] Error executing trade signal:', error);
      setErrorMessage('Error executing trade signal.');
    }
  };

  // Renamed to avoid confusion, recalculates display based on props
  const updatePerformanceDisplay = (currentPositions: Position[]) => {
      let closedTrades = currentPositions.filter(p => p.status === 'closed' && p.profit !== undefined);
      let totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.profit ?? 0), 0);
      let wins = closedTrades.filter(p => (p.profit ?? 0) > 0).length;
      let totalClosed = closedTrades.length;
      // Count open trades towards total count if needed, or adjust definition
      let totalOpenedOrClosed = currentPositions.length; 

      setPerformance({
          winRate: totalClosed > 0 ? wins / totalClosed : 0,
          profitLoss: Math.round(totalPnl * 100) / 100,
          totalTrades: totalOpenedOrClosed // Display total positions attempted/managed
      });
      console.log(`[TRADING UI] Performance updated: Trades=${totalOpenedOrClosed}, Wins=${wins}, P/L=${totalPnl.toFixed(2)}`);
  };

  // Toggle between demo and live modes
  const toggleMode = () => {
    const newMode = mode === TradingMode.DEMO ? TradingMode.LIVE : TradingMode.DEMO;
    console.log('[TRADING UI] Mode changed:', newMode);
    setMode(newMode);
    
    if (aiEngine.current) {
      aiEngine.current.setMode(newMode);
    }
  };

  // Toggle AI trading on/off
  const toggleAI = () => {
    console.log('[TRADING UI] AI trading toggled:', !aiEnabled);
    setAiEnabled(!aiEnabled);
  };

  // Add new function to scan multiple stocks
  const scanMarket = async () => {
    try {
      setIsScanning(true);
      setShowScanResults(true);
      setScanResults([]);
      
      console.log('[TRADING UI] Starting market scan for trading opportunities...');
      
      // Create a temporary trading engine for scanning
      const scannerEngine = new AITradingEngine('', mode, allocatedBalance);
      const results: Array<TradeSignal & { company?: string }> = [];
      
      // Analyze each stock in parallel with a concurrency limit
      const concurrencyLimit = 3; // Process 3 stocks at a time to avoid rate limits
      const chunks = [];
      
      // Split stocks into chunks based on concurrency limit
      for (let i = 0; i < stocksToScan.length; i += concurrencyLimit) {
        chunks.push(stocksToScan.slice(i, i + concurrencyLimit));
      }
      
      // Process each chunk sequentially
      for (const chunk of chunks) {
        // Process stocks in this chunk in parallel
        const chunkPromises = chunk.map(async (stockSymbol) => {
          try {
            console.log(`[MARKET SCANNER] Analyzing ${stockSymbol}...`);
            scannerEngine.setSymbol(stockSymbol);
            const signal = await scannerEngine.analyzeMarket();
            
            if (signal) {
              // Try to get company name
              let companyName = '';
              try {
                const response = await fetch(`/api/search-tickers?q=${encodeURIComponent(stockSymbol)}`);
                if (response.ok) {
                  const searchResults = await response.json();
                  companyName = searchResults.find((r: any) => r.symbol === stockSymbol)?.name || '';
                }
              } catch (e) {
                console.error(`[MARKET SCANNER] Error fetching company name for ${stockSymbol}:`, e);
              }
              
              results.push({
                ...signal,
                company: companyName
              });
              
              console.log(`[MARKET SCANNER] Found ${signal.direction.toUpperCase()} signal for ${stockSymbol}`);
            }
          } catch (e) {
            console.error(`[MARKET SCANNER] Error analyzing ${stockSymbol}:`, e);
          }
        });
        
        // Wait for all stocks in this chunk to be analyzed
        await Promise.all(chunkPromises);
        
        // Small delay between chunks to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Sort results by confidence (highest first)
      results.sort((a, b) => b.confidence - a.confidence);
      
      console.log(`[MARKET SCANNER] Scan complete. Found ${results.length} trading opportunities.`);
      setScanResults(results);
    } catch (error) {
      console.error('[MARKET SCANNER] Error scanning market:', error);
      setErrorMessage('Error scanning market for trading opportunities');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-2xl font-semibold text-white mb-4">AI Terminal</h2>
      
      {/* Add account balance section */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 w-full md:w-auto flex-grow">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Account Balance</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-gray-700 rounded-md p-2">
              <div className="text-xs text-gray-400">Total Balance</div>
              <div className="text-lg font-semibold text-white">${accountBalance.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700 rounded-md p-2">
              <div className="text-xs text-gray-400">AI Trading Allocation</div>
              <div className="text-lg font-semibold text-white">${allocatedBalance.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700 rounded-md p-2">
              <div className="text-xs text-gray-400">Daily Limit</div>
              <div className="text-lg font-semibold text-white">${dailyTradeLimit.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700 rounded-md p-2">
              <div className="text-xs text-gray-400">Today's P/L</div>
              <div className={`text-lg font-semibold ${tradeProfitLoss.todayPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${tradeProfitLoss.todayPL.toFixed(2)}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowBalanceModal(true)}
            className="w-full text-sm px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Manage Funds
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 w-full md:w-auto md:min-w-[250px]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Symbol Controls</h3>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              ref={inputRef}
              defaultValue={symbol}
              className="flex-1 bg-gray-700 text-white p-2 rounded-lg text-sm"
              placeholder="Symbol"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSymbolChange();
                }
              }}
            />
            <button 
              onClick={handleSymbolChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              Search
            </button>
          </div>
          <div className="flex justify-between text-xs">
            <button 
              onClick={toggleMode} 
              className={`px-2 py-1 rounded-md ${
                mode === TradingMode.DEMO ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {mode === TradingMode.DEMO ? 'Demo' : 'Live'} Mode
            </button>
            <button 
              onClick={toggleAI} 
              className={`px-2 py-1 rounded-md ${
                aiEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
            >
              AI: {aiEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 flex-grow">
          <h3 className="text-sm font-medium text-gray-400 mb-2">AI Signal</h3>
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          ) : lastSignal ? (
            <div className="flex flex-col gap-2">
              <div className={`p-2 rounded-md text-sm ${
                lastSignal.direction === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
              }`}>
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="font-semibold text-white">{lastSignal.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className={`font-semibold ${
                    lastSignal.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {lastSignal.direction.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry:</span>
                  <span className="font-semibold text-white">${lastSignal.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Strategy:</span>
                  <span className="font-semibold text-blue-400 text-xs">{lastSignal.strategy}</span>
                </div>
              </div>
              <button 
                onClick={() => executeTradeSignal(lastSignal)}
                className={`w-full text-sm px-3 py-1 rounded-md transition-colors ${ 
                  lastSignal.direction === 'buy' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700' 
                } text-white`}
              >
                Execute {lastSignal.direction.toUpperCase()} Signal
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 text-gray-500 text-sm">
              No signals available
            </div>
          )}
          {errorMessage && (
            <div className="mt-2 p-1 text-xs bg-red-900/30 border border-red-700 rounded-md text-red-400">
              {errorMessage}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3 w-full md:w-auto md:min-w-[200px]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Performance</h3>
          <div className="p-2 bg-gray-700 rounded-md text-sm mb-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate:</span>
              <span className="font-semibold text-white">{(performance.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P/L:</span>
              <span className={`font-semibold ${
                performance.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${performance.profitLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trades:</span>
              <span className="font-semibold text-white">{performance.totalTrades}</span>
            </div>
          </div>
          <button 
            onClick={() => analyzeMarket()}
            disabled={isAnalyzing}
            className={`w-full text-sm px-3 py-1 rounded-md ${
              isAnalyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </div>
      </div>
      
      {/* Add Market Scanner button */}
      <div className="mb-4">
        <button
          onClick={scanMarket}
          disabled={isScanning}
          className={`w-full p-3 rounded-lg text-white font-medium ${
            isScanning ? 'bg-indigo-800 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isScanning ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span>Scanning Market for Trading Opportunities...</span>
            </div>
          ) : (
            <span>Scan Market for Trading Opportunities</span>
          )}
        </button>
      </div>
      
      {/* Market Scanner Results */}
      {showScanResults && (
        <div className="mb-4 bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-400">Market Scanner Results</h3>
            <button
              onClick={() => setShowScanResults(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {isScanning ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-gray-400 text-sm">Scanning markets for trading opportunities...</div>
            </div>
          ) : scanResults.length > 0 ? (
            <div className="bg-gray-700 rounded-md overflow-hidden">
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 bg-gray-800">
                    <tr>
                      <th className="px-4 py-2">Symbol</th>
                      <th className="px-4 py-2">Company</th>
                      <th className="px-4 py-2">Signal</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Strategy</th>
                      <th className="px-4 py-2">Confidence</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {scanResults.map((signal, index) => (
                      <tr key={`${signal.symbol}-${index}`} className="bg-gray-700 hover:bg-gray-600">
                        <td className="px-4 py-2 font-medium text-white">{signal.symbol}</td>
                        <td className="px-4 py-2 text-gray-300 truncate max-w-[150px]">{signal.company || '-'}</td>
                        <td className={`px-4 py-2 font-medium ${
                          signal.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {signal.direction.toUpperCase()}
                        </td>
                        <td className="px-4 py-2">${signal.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-blue-400 text-xs">{signal.strategy}</td>
                        <td className="px-4 py-2">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                signal.confidence > 0.8 ? 'bg-green-500' : 
                                signal.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${signal.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{(signal.confidence * 100).toFixed()}%</span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => {
                              // Set the symbol and then execute the signal
                              setSymbol(signal.symbol);
                              onSymbolChange(signal.symbol);
                              executeTradeSignal(signal);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              signal.direction === 'buy' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                            } text-white`}
                          >
                            Execute
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2 bg-gray-800 text-xs text-gray-400">
                Found {scanResults.length} trading opportunities across {stocksToScan.length} stocks
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No trading opportunities found. Try again later or adjust scanner settings.
            </div>
          )}
        </div>
      )}
      
      {/* New section for Profit/Loss Details */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-400">Profit/Loss Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Total Profit</div>
            <div className="text-lg font-semibold text-green-400">${tradeProfitLoss.totalProfit.toFixed(2)}</div>
          </div>
          <div className="bg-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Total Loss</div>
            <div className="text-lg font-semibold text-red-400">-${tradeProfitLoss.totalLoss.toFixed(2)}</div>
          </div>
          <div className="bg-gray-700 rounded-md p-2">
            <div className="text-xs text-gray-400">Net P/L</div>
            <div className={`text-lg font-semibold ${tradeProfitLoss.netPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${tradeProfitLoss.netPL.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Recent trades table - modified to make rows clickable */}
        {tradeProfitLoss.trades.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-400 mb-1">Recent Trade History (click for details)</div>
            <div className="bg-gray-700 rounded-md max-h-32 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 border-b border-gray-600">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-right">P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {tradeProfitLoss.trades.slice(0, 5).map(trade => (
                    <tr 
                      key={trade.id} 
                      className="cursor-pointer hover:bg-gray-600"
                      onClick={() => handleViewTradeDetails(trade)}
                    >
                      <td className="p-2">{trade.date.toLocaleDateString()}</td>
                      <td className="p-2">{trade.symbol}</td>
                      <td className={`p-2 text-right ${trade.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.pl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Add ADX Indicator component */}
      <div className="mb-4">
        <ADXIndicator 
          aiEngine={aiEngine} 
          adxValue={adxValues.adx} 
          plusDI={adxValues.plusDI} 
          minusDI={adxValues.minusDI} 
        />
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Active Positions</h3>
        {positions.filter(p => p.status === 'open').length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {positions.filter(p => p.status === 'open').map(position => (
              <div 
                key={position.id}
                className={`p-2 rounded-md relative text-sm ${
                  position.type === 'buy' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
                }`}
              >
                <button 
                  onClick={() => onClosePosition(position.id)}
                  className="absolute top-1 right-1 p-0.5 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded leading-none"
                  title="Close Position (Demo)"
                >
                  X
                </button>
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="font-semibold text-white">{position.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className={`font-semibold ${
                    position.type === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry:</span>
                  <span className="font-semibold text-white">${position.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="font-semibold text-white">{position.quantity} sh</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-gray-500 text-sm">
            No active positions
          </div>
        )}
      </div>
      
      {/* Modal for fund management */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Funds</h3>
            
            <div className="space-y-4">
              {/* Deposit */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deposit Funds</label>
                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-grow bg-gray-700 text-white p-2 rounded-l-md"
                    placeholder="Amount"
                  />
                  <button
                    onClick={handleDeposit}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-r-md"
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  >
                    Deposit
                  </button>
                </div>
              </div>
              
              {/* Withdraw */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Withdraw Funds</label>
                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    max={accountBalance}
                    step="100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-grow bg-gray-700 text-white p-2 rounded-l-md"
                    placeholder="Amount"
                  />
                  <button
                    onClick={handleWithdraw}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-md"
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > accountBalance}
                  >
                    Withdraw
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Available: ${accountBalance.toFixed(2)}</p>
              </div>
              
              {/* AI Allocation */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Trading Allocation</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={accountBalance}
                    step="100"
                    value={allocatedBalance}
                    onChange={(e) => handleUpdateAllocated(parseFloat(e.target.value))}
                    className="flex-grow mr-2"
                  />
                  <span className="text-white min-w-[80px] text-right">${allocatedBalance.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">Amount available for AI to trade with</p>
              </div>
              
              {/* Daily Limit */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Daily Trading Limit</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={allocatedBalance}
                    step="100"
                    value={dailyTradeLimit}
                    onChange={(e) => handleUpdateDailyLimit(parseFloat(e.target.value))}
                    className="flex-grow mr-2"
                  />
                  <span className="text-white min-w-[80px] text-right">${dailyTradeLimit.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">Maximum amount to trade per day</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBalanceModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Trade details modal */}
      {showTradeDetails && selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Trade Details</h3>
              <button
                onClick={() => setShowTradeDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="font-semibold text-white">{selectedTrade.symbol}</span>
              </div>
              
              {selectedTrade.type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className={`font-semibold ${
                    selectedTrade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedTrade.type.toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Entry Price:</span>
                <span className="font-semibold text-white">${selectedTrade.entryPrice?.toFixed(2) || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Exit Price:</span>
                <span className="font-semibold text-white">${selectedTrade.exitPrice?.toFixed(2) || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="font-semibold text-white">{selectedTrade.quantity || 0} shares</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">P/L:</span>
                <span className={`font-semibold ${selectedTrade.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${selectedTrade.pl.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="font-semibold text-white">{selectedTrade.date.toLocaleString()}</span>
              </div>
              
              {selectedTrade.strategy && (
                <div className="bg-gray-700 p-3 rounded-md">
                  <div className="text-gray-400 mb-1">Strategy:</div>
                  <div className="text-blue-400 font-medium">{selectedTrade.strategy}</div>
                  
                  {selectedTrade.confidence && (
                    <div className="mt-2">
                      <div className="text-gray-400 mb-1">Signal Confidence:</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              selectedTrade.confidence > 0.8 ? 'bg-green-500' : 
                              selectedTrade.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedTrade.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-300">{(selectedTrade.confidence * 100).toFixed()}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTradeDetails(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 