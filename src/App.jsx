import { useMemo, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://business-insight-hub-backend.onrender.com'
const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/analyze-csv`

const navItems = [
  { label: 'Overview', active: true },
  { label: 'Upload' },
  { label: 'AI Insights' },
  { label: 'History', badge: 'Coming Soon' },
  { label: 'Workflow', badge: 'Coming Soon' },
  { label: 'Settings' },
]

const insights = [
  'Revenue is trending upward across your strongest product categories.',
  'Customer acquisition costs appear stable compared with last period.',
  'Inventory movement suggests a few segments may need closer review.',
]

const mockKpiSummary = {
  total_revenue: 1472292.04,
  total_orders: 12540,
  unique_customers: 1000,
  average_order_value: 117.41,
}

const mockRevenueTrend = [
  { month: '2023-01', revenue: 58478.26 },
  { month: '2023-03', revenue: 64142.8 },
  { month: '2023-05', revenue: 70640.15 },
  { month: '2023-07', revenue: 78820.42 },
  { month: '2023-09', revenue: 84220.67 },
  { month: '2023-11', revenue: 116905.21 },
]

const categoryColors = [
  '#0ea5e9',
  '#60a5fa',
  '#67e8f9',
  '#a5b4fc',
  '#38bdf8',
  '#cbd5e1',
]

const mockCategorySales = [
  { category: 'Electronics', revenue: 523400, percentage: 35.6 },
  { category: 'Clothing', revenue: 364700, percentage: 24.8 },
  { category: 'Home & Kitchen', revenue: 275000, percentage: 18.7 },
  { category: 'Beauty', revenue: 180900, percentage: 12.3 },
  { category: 'Others', revenue: 126500, percentage: 8.6 },
]

const mockTopProducts = [
  { product_name: 'Wireless Headphones', revenue: 45231 },
  { product_name: 'Smart Watch', revenue: 38921 },
  { product_name: 'Bluetooth Speaker', revenue: 32112 },
  { product_name: 'Laptop Stand', revenue: 28430 },
  { product_name: 'LED Desk Lamp', revenue: 21309 },
]

const isValidMetric = (value) => Number.isFinite(Number(value))

const formatNumberMetric = (value) =>
  isValidMetric(value) ? Number(value).toLocaleString() : 'N/A'

const formatCurrencyMetric = (value, compact = false) => {
  if (!isValidMetric(value)) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 2 : 0,
  }).format(Number(value))
}

const buildKpiMetrics = (kpiSummary) => [
  {
    label: 'Total Revenue',
    value: formatCurrencyMetric(kpiSummary.total_revenue, true),
    detail: 'Revenue detected',
    icon: '$',
  },
  {
    label: 'Total Orders',
    value: formatNumberMetric(kpiSummary.total_orders),
    detail: 'Distinct orders',
    icon: 'O',
  },
  {
    label: 'Unique Customers',
    value: formatNumberMetric(kpiSummary.unique_customers),
    detail: 'Distinct customers',
    icon: 'U',
  },
  {
    label: 'Average Order Value',
    value: formatCurrencyMetric(kpiSummary.average_order_value),
    detail: 'Revenue per order',
    icon: 'A',
  },
]

const formatRevenueAxis = (value) => {
  if (value >= 1000000) {
    return `${Math.round(value / 1000000)}M`
  }

  return `${Math.round(value / 1000)}K`
}

const buildRevenueChart = (trend) => {
  const chartWidth = 920
  const chartHeight = 370
  const left = 78
  const right = 872
  const top = 34
  const bottom = 286
  const maxRevenue = Math.max(...trend.map((point) => point.revenue), 1)
  const axisMax = Math.ceil(maxRevenue / 20000) * 20000
  const xStep = trend.length > 1 ? (right - left) / (trend.length - 1) : 0
  const points = trend.map((point, index) => {
    const x = trend.length > 1 ? left + index * xStep : (left + right) / 2
    const y = bottom - (point.revenue / axisMax) * (bottom - top)

    return { ...point, x, y }
  })
  const yLabels = [1, 0.8, 0.6, 0.4, 0.2, 0].map((ratio) => ({
    label: ratio === 0 ? '0' : formatRevenueAxis(axisMax * ratio),
    y: top + (1 - ratio) * (bottom - top),
  }))
  const labelEvery = Math.max(1, Math.ceil(trend.length / 6))
  const xLabels = points.filter(
    (_, index) => index % labelEvery === 0 || index === points.length - 1,
  )
  const yearLabels = Object.values(
    points.reduce((years, point) => {
      const year = point.month.slice(0, 4)

      if (!years[year]) {
        years[year] = {
          year,
          firstX: point.x,
          lastX: point.x,
        }
      } else {
        years[year].lastX = point.x
      }

      return years
    }, {}),
  ).map((year) => ({
    ...year,
    x: (year.firstX + year.lastX) / 2,
  }))

  return {
    chartWidth,
    chartHeight,
    points,
    yLabels,
    xLabels,
    yearLabels,
    polyline: points.map((point) => `${point.x},${point.y}`).join(' '),
  }
}

const normalizeRevenueTrend = (trend) => {
  if (!Array.isArray(trend)) {
    return []
  }

  return trend
    .map((point) => ({
      month: point.month,
      revenue: Number(point.revenue),
    }))
    .filter((point) => point.month && Number.isFinite(point.revenue))
}

const normalizeCategorySales = (categorySales) => {
  if (!Array.isArray(categorySales)) {
    return []
  }

  return categorySales
    .map((item) => ({
      category: item.category,
      revenue: Number(item.revenue),
      percentage: Number(item.percentage),
    }))
    .filter(
      (item) =>
        item.category &&
        Number.isFinite(item.revenue) &&
        Number.isFinite(item.percentage),
    )
}

const formatCurrencyCompact = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
  }).format(value)

const buildDonutGradient = (categories) => {
  if (!categories.length) {
    return '#e0f2fe'
  }

  let start = 0
  const segments = categories.map((category, index) => {
    const end = start + category.percentage
    const color = categoryColors[index % categoryColors.length]
    const segment = `${color} ${start}% ${end}%`
    start = end
    return segment
  })

  return `conic-gradient(${segments.join(', ')})`
}

const normalizeTopProducts = (topProducts) => {
  if (!Array.isArray(topProducts)) {
    return []
  }

  return topProducts
    .map((product) => ({
      product_name: product.product_name,
      revenue: Number(product.revenue),
    }))
    .filter(
      (product) =>
        product.product_name &&
        Number.isFinite(product.revenue) &&
        product.revenue >= 0,
    )
}

function App() {
  const fileInputRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const kpiSummary = analysis?.kpi_summary ?? mockKpiSummary
  const kpiMetrics = useMemo(
    () => buildKpiMetrics(kpiSummary),
    [kpiSummary],
  )
  const revenueTrendSkipped = analysis?.skipped_modules?.some(
    (module) => module.module === 'revenue_trend',
  )
  const liveRevenueTrend = normalizeRevenueTrend(analysis?.revenue_trend)
  const revenueTrend = analysis ? liveRevenueTrend : mockRevenueTrend
  const revenueTrendUnavailable = analysis && liveRevenueTrend.length === 0
  const revenueTrendMessage = revenueTrendSkipped
    ? 'Revenue Trend unavailable: missing order_date or revenue'
    : 'Revenue Trend unavailable'
  const revenueChart = useMemo(
    () => buildRevenueChart(revenueTrend),
    [revenueTrend],
  )
  const categorySalesSkipped = analysis?.skipped_modules?.some(
    (module) => module.module === 'category_sales',
  )
  const liveCategorySales = normalizeCategorySales(analysis?.category_sales)
  const categorySales = analysis ? liveCategorySales : mockCategorySales
  const categorySalesUnavailable = analysis && liveCategorySales.length === 0
  const totalCategoryRevenue = categorySales.reduce(
    (total, category) => total + category.revenue,
    0,
  )
  const donutGradient = buildDonutGradient(categorySales)
  const topProductsSkipped = analysis?.skipped_modules?.some(
    (module) => module.module === 'top_products',
  )
  const liveTopProducts = normalizeTopProducts(analysis?.top_products)
  const topProducts = analysis ? liveTopProducts : mockTopProducts
  const topProductsUnavailable = analysis && liveTopProducts.length === 0
  const highestProductRevenue = Math.max(
    ...topProducts.map((product) => product.revenue),
    1,
  )

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setIsUploading(true)
    setErrorMessage('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail || 'Unable to analyze this CSV file.')
      }

      setAnalysis(data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while analyzing the CSV.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 p-4 text-slate-800">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="flex flex-col rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_60px_rgba(56,130,190,0.13)] backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-sky-400 text-lg font-bold text-white shadow-lg shadow-sky-200">
              BI
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-slate-900">
                Business
              </p>
              <p className="text-sm font-semibold leading-tight text-sky-600">
                Insight Hub
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                  item.active
                    ? 'bg-sky-100 text-sky-700 shadow-sm'
                    : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'
                }`}
                key={item.label}
                type="button"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-500">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/80 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-950">Sample Data</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              E-commerce sales demo
            </p>
            <button
              className="mt-3 w-full rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-100"
              type="button"
            >
              Load Sample CSV
            </button>
          </div>

          <div className="mt-4 rounded-[22px] bg-gradient-to-br from-sky-400 to-blue-500 p-4 text-white shadow-xl shadow-sky-200 xl:mt-auto">
            <p className="text-sm font-semibold text-sky-50">Upgrade to Pro</p>
            <p className="mt-2 text-xs leading-5 text-white/85">
              Unlock unlimited datasets, deeper summaries, and priority insight
              generation.
            </p>
            <button
              className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow-sm"
              type="button"
            >
              View Plans
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(56,130,190,0.11)] backdrop-blur">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Welcome to Business Insight Hub &#10024;
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Upload your CSV data to get AI-powered business insights in
              seconds.
            </p>
          </header>

          <div className="grid flex-1 gap-4">
            <section className="rounded-[28px] border border-dashed border-sky-200 bg-white/90 p-6 text-center shadow-[0_18px_48px_rgba(56,130,190,0.11)]">
              <input
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sky-100 text-xl font-bold text-sky-500">
                CSV
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                Drag & drop your CSV file here
              </h2>
              <button
                className="mt-4 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
                disabled={isUploading}
                onClick={handleChooseFile}
                type="button"
              >
                {isUploading ? 'Analyzing...' : 'Choose File'}
              </button>
              {isUploading && (
                <p className="mt-3 text-sm font-semibold text-sky-600">
                  Analyzing your business data...
                </p>
              )}
              {errorMessage && (
                <p className="mx-auto mt-3 max-w-lg rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                  {errorMessage}
                </p>
              )}
              <p className="mt-3 text-xs font-semibold text-slate-400">
                Supported format: CSV (Max 50MB)
              </p>
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(56,130,190,0.11)] backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-500">
                    Business Metrics
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    KPI Summary
                  </h2>
                </div>
                <p className="rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
                  {analysis?.filename ?? 'E-commerce Sales Dataset'}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 min-[1500px]:grid-cols-4">
                {kpiMetrics.map((metric) => (
                  <article
                    className="min-h-[100px] rounded-[22px] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(56,130,190,0.09)]"
                    key={metric.label}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-xs font-black text-sky-600">
                        {metric.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-500">
                          {metric.label}
                        </p>
                        <p className="mt-1 break-words text-2xl font-bold leading-tight tracking-tight text-slate-950">
                          {metric.value}
                        </p>
                        <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-400">
                          {metric.detail}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(56,130,190,0.11)] backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-500">
                    Sample Insights
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    Dashboard Preview
                  </h2>
                </div>
                <button
                  className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 shadow-sm"
                  type="button"
                >
                  This Year v
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <article className="min-h-[390px] rounded-[24px] border border-sky-100 bg-white p-5 shadow-[0_12px_32px_rgba(56,130,190,0.09)] xl:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-slate-950">
                      Revenue Over Time
                    </h3>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                      {analysis ? 'Live Data' : 'Sample'}
                    </span>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-white p-5">
                    {revenueTrendUnavailable ? (
                      <div className="grid min-h-[310px] place-items-center text-sm font-bold text-slate-400">
                        {revenueTrendMessage}
                      </div>
                    ) : (
                      <svg
                        className="h-[310px] w-full"
                        role="img"
                        viewBox={`0 0 ${revenueChart.chartWidth} ${revenueChart.chartHeight}`}
                      >
                        <title>Revenue over time chart</title>
                        {revenueChart.yLabels.map((axis) => (
                          <g key={axis.label}>
                            <line
                              stroke="#dbeafe"
                              strokeWidth="1"
                              x1="78"
                              x2="872"
                              y1={axis.y}
                              y2={axis.y}
                            />
                            <text
                              fill="#94a3b8"
                              fontSize="15"
                              textAnchor="end"
                              x="62"
                              y={axis.y + 5}
                            >
                              {axis.label}
                            </text>
                          </g>
                        ))}
                        <polyline
                          fill="none"
                          points={revenueChart.polyline}
                          stroke="#38bdf8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="6"
                        />
                        {revenueChart.points.map((point) => (
                          <circle
                            cx={point.x}
                            cy={point.y}
                            fill="#ffffff"
                            key={point.month}
                            r="6"
                            stroke="#0ea5e9"
                            strokeWidth="4"
                          />
                        ))}
                        {revenueChart.xLabels.map((point) => (
                          <text
                            fill="#64748b"
                            fontSize="14"
                            fontWeight="700"
                            key={point.month}
                            textAnchor="middle"
                            x={point.x}
                            y="326"
                          >
                            {point.month.slice(5)}
                          </text>
                        ))}
                        {revenueChart.yearLabels.map((year) => (
                          <g key={year.year}>
                            <line
                              stroke="#bae6fd"
                              strokeLinecap="round"
                              strokeWidth="2"
                              x1={year.firstX}
                              x2={year.lastX}
                              y1="344"
                              y2="344"
                            />
                            <text
                              fill="#0ea5e9"
                              fontSize="15"
                              fontWeight="800"
                              textAnchor="middle"
                              x={year.x}
                              y="364"
                            >
                              {year.year}
                            </text>
                          </g>
                        ))}
                      </svg>
                    )}
                  </div>
                </article>

                <article className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(56,130,190,0.09)]">
                  <h3 className="text-base font-bold text-slate-950">
                    Sales by Category
                  </h3>

                  {categorySalesUnavailable ? (
                    <div className="mt-4 grid min-h-48 place-items-center rounded-2xl bg-sky-50 text-sm font-bold text-slate-400">
                      {categorySalesSkipped
                        ? 'Category Analysis unavailable'
                        : 'Category Analysis unavailable'}
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row xl:flex-col min-[1440px]:flex-row">
                      <div
                        className="relative size-36 shrink-0 rounded-full shadow-inner shadow-sky-100"
                        style={{ background: donutGradient }}
                      >
                        <div className="absolute inset-7 grid place-items-center rounded-full bg-white text-center shadow-inner">
                          <span className="text-xl font-bold text-slate-950">
                            {formatCurrencyCompact(totalCategoryRevenue)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Total Revenue
                          </span>
                        </div>
                      </div>

                      <ul className="w-full space-y-2">
                        {categorySales.map((category, index) => (
                          <li
                            className="flex items-center justify-between gap-3 text-sm"
                            key={category.category}
                          >
                            <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-600">
                              <span
                                className="size-3 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    categoryColors[index % categoryColors.length],
                                }}
                              ></span>
                              <span className="truncate">{category.category}</span>
                            </span>
                            <span className="font-bold text-slate-900">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>

                <article className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(56,130,190,0.09)]">
                  <h3 className="text-base font-bold text-slate-950">
                    Top 5 Products by Revenue
                  </h3>

                  {topProductsUnavailable ? (
                    <div className="mt-4 grid min-h-48 place-items-center rounded-2xl bg-sky-50 text-sm font-bold text-slate-400">
                      {topProductsSkipped
                        ? 'Top Products unavailable'
                        : 'Top Products unavailable'}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {topProducts.map((product) => (
                        <div key={product.product_name}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-semibold text-slate-600">
                              {product.product_name}
                            </span>
                            <span className="shrink-0 font-bold text-slate-950">
                              {formatCurrency(product.revenue)}
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-sky-50">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-300 to-sky-500 shadow-sm"
                              style={{
                                width: `${Math.max(
                                  (product.revenue / highestProductRevenue) * 100,
                                  3,
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            </section>
          </div>
        </section>

        <aside className="rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_60px_rgba(56,130,190,0.13)] backdrop-blur">
          <h2 className="text-xl font-bold text-slate-950">
            AI Business Summary
          </h2>

          <div className="mt-6 rounded-[24px] bg-gradient-to-br from-sky-50 to-white p-5 shadow-inner shadow-sky-100">
            <p className="text-sm font-semibold text-slate-500">
              Overall Performance
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-950">Strong</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A calm placeholder snapshot for the future AI-generated score.
            </p>
          </div>

          <div className="mt-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-500">
              Placeholder Insights
            </p>
            <ul className="mt-4 space-y-4">
              {insights.map((insight) => (
                <li
                  className="rounded-2xl border border-sky-100 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm"
                  key={insight}
                >
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default App
