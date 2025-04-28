'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TransfersPage() {
  const [amount, setAmount] = useState('')
  const [transferType, setTransferType] = useState('deposit')
  const [account, setAccount] = useState('')

  const handleTransfer = async () => {
    // TODO: Implement transfer logic
    console.log('Transfer:', { amount, transferType, account })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Transfers</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Transfer Type</label>
              <Select value={transferType} onValueChange={setTransferType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdraw">Withdraw</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Account</label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="savings">Savings Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleTransfer}>
              Submit Transfer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for transfer history */}
              <p className="text-sm text-gray-500">No recent transfers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 