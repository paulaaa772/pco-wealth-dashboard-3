'use client'

import React, { useState } from 'react';

// Define props if we need to pass data or functions down later
export interface OrderEntryPanelProps {
    symbol: string;
    currentPrice: number;
    onOrderSubmit: (order: Omit<ManualOrder, 'id' | 'timestamp' | 'status' | 'price'>) => any;
}

// Simple structure for the simulated order - EXPORT this interface
export interface ManualOrder {
    id: string;
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    timestamp: number;
    status: 'open' | 'filled' | 'canceled';
}

const OrderEntryPanel: React.FC<OrderEntryPanelProps> = ({
    symbol,
    currentPrice,
    onOrderSubmit,
}) => {
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [quantity, setQuantity] = useState<number>(10);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!symbol) {
            setError('No symbol selected');
            return;
        }
        
        if (quantity <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }
        
        if (!currentPrice || currentPrice <= 0) {
            setError('Invalid current price');
            return;
        }
        
        try {
            const order = {
                symbol,
                type: orderType,
                quantity,
            };
            
            onOrderSubmit(order);
            
            // Show success message briefly
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
            
            // Reset form if it's a buy order
            if (orderType === 'buy') {
                setQuantity(10);
            }
        } catch (err: any) {
            setError(`Error submitting order: ${err.message || 'Unknown error'}`);
        }
    };

    const totalValue = quantity * currentPrice;

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Place Order</h3>
            
            {error && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded text-sm">
                    {error}
                </div>
            )}
            
            {isSuccess && (
                <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded text-sm">
                    Order submitted successfully!
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Symbol</label>
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        {symbol}
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Type</label>
                    <div className="flex">
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md focus:outline-none ${
                                orderType === 'buy'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setOrderType('buy')}
                        >
                            Buy
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md focus:outline-none ${
                                orderType === 'sell'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setOrderType('sell')}
                        >
                            Sell
                        </button>
                    </div>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="quantity" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Quantity
                    </label>
                    <input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price</label>
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            ${currentPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Market Price
                        </div>
                    </div>
                </div>
                
                <div className="mb-5 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                        <span className="font-bold text-gray-900 dark:text-white">${totalValue.toFixed(2)}</span>
                    </div>
                </div>
                
                <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded font-medium ${
                        orderType === 'buy'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {symbol}
                </button>
            </form>
        </div>
    );
};

export default OrderEntryPanel; 