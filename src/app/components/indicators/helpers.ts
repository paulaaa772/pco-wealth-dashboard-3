import { IChartApi, DeepPartial, HistogramStyleOptions, SeriesOptionsCommon } from 'lightweight-charts'

export const createLineIndicator = (type: string) => (chart: IChartApi, data: any[]) => {
  const series = chart.addLineSeries({
    color: '#2962FF',
    lineWidth: 2,
  })
  
  const points = data.map((d) => ({
    time: d.time,
    value: d[type] || 0,
  }))
  
  series.setData(points)
  return series
}

export const createBandIndicator = (type: string) => (chart: IChartApi, data: any[]) => {
  const upperSeries = chart.addLineSeries({
    color: '#2962FF',
    lineWidth: 1,
  })
  
  const lowerSeries = chart.addLineSeries({
    color: '#2962FF',
    lineWidth: 1,
  })
  
  const points = data.map((d) => ({
    time: d.time,
    upper: d[`${type}_upper`] || 0,
    lower: d[`${type}_lower`] || 0,
  }))
  
  upperSeries.setData(points.map((p) => ({ time: p.time, value: p.upper })))
  lowerSeries.setData(points.map((p) => ({ time: p.time, value: p.lower })))
  
  return [upperSeries, lowerSeries]
}

export const createVolumeIndicator = () => (chart: IChartApi, data: any[]) => {
  const series = chart.addHistogramSeries({
    color: '#888',
    priceFormat: { type: 'volume' },
  })

  // Configure the price scale after creation
  const priceScale = chart.priceScale('right')
  if (priceScale) {
    priceScale.applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })
  }

  const points = data.map((d) => ({
    time: d.time,
    value: d.volume || 0,
    color: d.close >= d.open ? '#26a69a' : '#ef5350',
  }))

  series.setData(points)
  return series
}
