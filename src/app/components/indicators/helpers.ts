import { IChartApi, DeepPartial, HistogramStyleOptions, SeriesOptionsCommon, LineStyle } from 'lightweight-charts'

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

// ML Indicators
export const createMLIndicator = (type: string) => (chart: IChartApi, data: any[]) => {
  let series = null;
  
  if (type === 'ai_trend') {
    // Main prediction line
    series = chart.addLineSeries({
      color: '#8884d8', // Purple
      lineWidth: 2,
    });
    
    // Forecast with dashed style
    const forecastSeries = chart.addLineSeries({
      color: '#F1025E', // Pink
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
    });
    
    const mainPoints = data.filter(d => !d.isForecast).map(d => ({
      time: d.time,
      value: d.value
    }));
    
    const forecastPoints = data.filter(d => d.isForecast).map(d => ({
      time: d.time,
      value: d.value
    }));
    
    series.setData(mainPoints);
    if (forecastPoints.length > 0) {
      forecastSeries.setData(forecastPoints);
      return [series, forecastSeries];
    }
    
  } else if (type === 'neural_osc') {
    // Create a separate pane for the oscillator
    series = chart.addLineSeries({
      color: '#00BFFF', // Sky blue
      lineWidth: 2,
      priceScaleId: 'neural-scale',
    });
    
    series.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
      autoScale: true,
    });
    
    const points = data.map(d => ({
      time: d.time,
      value: d.value
    }));
    
    series.setData(points);
    
  } else if (type === 'adaptive_ma') {
    // Main MA line
    series = chart.addLineSeries({
      color: '#FF6EC7', // Pink
      lineWidth: 2,
    });
    
    const points = data.map(d => ({
      time: d.time,
      value: d.value
    }));
    
    series.setData(points);
  }
  
  return series;
}
