import { Position, PortfolioType, PortfolioPerformance } from '../trading-engine/types';
import { v4 as uuidv4 } from 'uuid';

export class PortfolioManager {
  private portfolios: Map<string, PortfolioType>;

  constructor() {
    this.portfolios = new Map();
    this.initializeDefaultPortfolios();
  }

  private initializeDefaultPortfolios() {
    const defaultPerformance: PortfolioPerformance = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
      allTime: 0
    };

    const longTermPortfolio: PortfolioType = {
      id: uuidv4(),
      name: 'Long-term Investment Portfolio',
      type: 'long-term',
      balance: 0,
      positions: [],
      performance: defaultPerformance
    };

    const activePortfolio: PortfolioType = {
      id: uuidv4(),
      name: 'Active Trading Portfolio',
      type: 'active-trading',
      balance: 0,
      positions: [],
      performance: defaultPerformance
    };

    this.portfolios.set(longTermPortfolio.id, longTermPortfolio);
    this.portfolios.set(activePortfolio.id, activePortfolio);
  }

  public getPortfolio(portfolioId: string): PortfolioType | undefined {
    return this.portfolios.get(portfolioId);
  }

  public getAllPortfolios(): PortfolioType[] {
    return Array.from(this.portfolios.values());
  }

  public addPosition(portfolioId: string, position: Omit<Position, 'lastUpdated' | 'unrealizedPnL' | 'realizedPnL'>): boolean {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return false;

    const newPosition: Position = {
      ...position,
      lastUpdated: new Date(),
      unrealizedPnL: 0,
      realizedPnL: 0
    };

    portfolio.positions.push(newPosition);
    return true;
  }

  public updatePosition(portfolioId: string, symbol: string, updates: Partial<Position>): boolean {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return false;

    const positionIndex = portfolio.positions.findIndex(p => p.symbol === symbol);
    if (positionIndex === -1) return false;

    portfolio.positions[positionIndex] = {
      ...portfolio.positions[positionIndex],
      ...updates,
      lastUpdated: new Date()
    };

    return true;
  }

  public removePosition(portfolioId: string, symbol: string): boolean {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return false;

    const initialLength = portfolio.positions.length;
    portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
    
    return portfolio.positions.length !== initialLength;
  }

  public updateBalance(portfolioId: string, newBalance: number): boolean {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return false;

    portfolio.balance = newBalance;
    return true;
  }

  public updatePerformance(portfolioId: string, performance: PortfolioPerformance): boolean {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return false;

    portfolio.performance = performance;
    return true;
  }
} 