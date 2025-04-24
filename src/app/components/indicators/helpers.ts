import { IChartApi } from 'lightweight-charts'

export function createLineIndicator(name: string) {
  return (chart: IChartApi, data: any[]) => {
    const series = chart.addLineSeries({
      color: name === 'sma' ? 'orange' : 'yellow',
      lineWidth: 2,
    })

    const points = data.map((d) => ({
      time: d.time,
      value: (d.open + d.close + d.high + d.low) / 4,
    }))

    series.setData(points)
  }
}

export function createBandIndicator(name: string) {
  return (chart: IChartApi, data: any[]) => {
    const top = chart.addLineSeries({ color: 'cyan', lineWidth: 1 })
    const bottom = chart.addLineSeries({ color: 'purple', lineWidth: 1 })

    const upper = data.map((d) => ({ time: d.time, value: d.high }))
    const lower = data.map((d) => ({ time: d.time, value: d.low }))

    top.setData(upper)
    bottom.setData(lower)
  }
}

export function createVolumeIndicator() {
  return (chart: IChartApi, data: any[]) => {
    const series = chart.addHistogramSeries({
      color: '#888',
      priceFormat: { type: 'volume' },
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const points = data.map((d) => ({
      time: d.time,
      value: d.volume ?? 100,
      color: d.close > d.open ? 'green' : 'red',
    }))

    series.setData(points)
  }
}
