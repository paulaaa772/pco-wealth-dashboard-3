'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TaxCenterPage() {
  const taxYear = new Date().getFullYear() - 1
  
  const documents = [
    { name: '1099-B', status: 'Available', date: 'Feb 15, 2024' },
    { name: '1099-DIV', status: 'Available', date: 'Feb 15, 2024' },
    { name: '1099-INT', status: 'Available', date: 'Feb 15, 2024' },
    { name: 'Cost Basis', status: 'Available', date: 'Feb 15, 2024' },
  ]

  const taxLotMethods = [
    { name: 'FIFO', description: 'First In, First Out' },
    { name: 'LIFO', description: 'Last In, First Out' },
    { name: 'Specific Lot', description: 'Choose specific lots when selling' },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tax Center</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Documents ({taxYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-gray-500">Generated: {doc.date}</p>
                  </div>
                  <Button variant="outline">Download</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Lot Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxLotMethods.map((method, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h3 className="font-medium">{method.name}</h3>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              ))}
              <Button className="w-full">Update Method</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Realized Gains/Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Short Term</p>
                  <p className="text-xl font-bold text-green-600">+$2,450.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Long Term</p>
                  <p className="text-xl font-bold text-green-600">+$5,230.00</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">View Details</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">• Understanding your 1099-B</p>
              <p className="text-sm">• Cost basis reporting guide</p>
              <p className="text-sm">• Tax lot identification methods</p>
              <p className="text-sm">• Capital gains and losses</p>
              <Button variant="link" className="p-0">View All Resources →</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 