const InsightCard = ({ insight }) => (
  <article className="report-block rounded-[20px] border border-slate-200 bg-white p-4">
    <p className="text-sm font-bold text-violet-600">{insight.title}</p>
    <p className="mt-2 text-lg font-bold text-slate-950">{insight.result}</p>
    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
      {insight.explanation}
    </p>
  </article>
)

function ReportView({
  businessInsights,
  categoryColors,
  categorySales,
  categorySalesUnavailable,
  donutGradient,
  generatedAt,
  highestProductRevenue,
  kpiMetrics,
  metadata,
  onBack,
  revenueChart,
  revenueTrendMessage,
  revenueTrendUnavailable,
  topProducts,
  topProductsUnavailable,
  totalCategoryRevenue,
}) {
  const handlePrint = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print())
    })
  }

  const datasetQuality = businessInsights.find(
    (insight) => insight.title === 'Dataset Quality',
  )
  const paretoAnalysis = businessInsights.find(
    (insight) => insight.title === 'Pareto Analysis',
  )
  const longTailAnalysis = businessInsights.find(
    (insight) => insight.title === 'Long Tail Distribution',
  )
  const generalInsights = businessInsights.filter(
    (insight) =>
      !['Dataset Quality', 'Pareto Analysis', 'Long Tail Distribution'].includes(
        insight.title,
      ),
  )

  return (
    <main className="report-shell min-h-screen bg-slate-100 px-4 py-6 text-slate-800">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <div className="report-actions flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow-sm hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            onClick={onBack}
            type="button"
          >
            Back to Dashboard
          </button>
          <button
            className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            onClick={handlePrint}
            type="button"
          >
            Print / Export PDF
          </button>
        </div>

        <header className="report-block rounded-[24px] border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-500">
            Business Insight Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Business Analysis Report
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Read-only analysis generated {generatedAt}.
          </p>
        </header>

        <section className="report-block rounded-[24px] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-slate-950">Dataset Metadata</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metadata.map((item) => (
              <div className="rounded-2xl bg-slate-50 p-4" key={item.label}>
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  {item.label}
                </dt>
                <dd className="mt-1 break-words text-sm font-bold text-slate-800">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {datasetQuality && (
          <section className="report-block rounded-[24px] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold text-slate-950">Dataset Quality</h2>
            <div className="mt-4">
              <InsightCard insight={datasetQuality} />
            </div>
          </section>
        )}

        <section className="report-block rounded-[24px] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-slate-950">KPI Summary</h2>
            <div className="report-kpi-grid mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpiMetrics.map((metric) => (
              <article className="rounded-[20px] border border-slate-200 bg-white p-4" key={metric.label}>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  {metric.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="report-block rounded-[24px] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-slate-950">Dashboard Charts</h2>
          <div className="mt-4 space-y-4">
            <article className="report-block report-chart-card report-revenue-chart rounded-[20px] border border-slate-200 bg-white p-5">
              <h3 className="text-base font-bold text-slate-950">Revenue Over Time</h3>
              <div className="report-chart-surface mt-4 overflow-hidden rounded-2xl bg-slate-50 px-6 py-5">
                {revenueTrendUnavailable ? (
                  <div className="grid min-h-48 place-items-center text-sm font-bold text-slate-400">
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
                        <line stroke="#cbd5e1" x1="78" x2="872" y1={axis.y} y2={axis.y} />
                        <text fill="#64748b" fontSize="14" fontWeight="700" textAnchor="end" x="62" y={axis.y + 5}>
                          {axis.label}
                        </text>
                      </g>
                    ))}
                    <polyline fill="none" points={revenueChart.polyline} stroke="#8b5cf6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
                    {revenueChart.points.map((point) => (
                      <circle cx={point.x} cy={point.y} fill="#ffffff" key={point.month} r="6" stroke="#6366f1" strokeWidth="4" />
                    ))}
                    {revenueChart.xLabels.map((point) => (
                      <text fill="#475569" fontSize="13" fontWeight="800" key={point.month} textAnchor="middle" x={point.x} y="326">
                        {point.month.slice(5)}
                      </text>
                    ))}
                    {revenueChart.yearLabels.map((year) => (
                      <g key={year.year}>
                        <line stroke="#ddd6fe" strokeLinecap="round" strokeWidth="2" x1={year.firstX} x2={year.lastX} y1="344" y2="344" />
                        <text fill="#6d28d9" fontSize="14" fontWeight="800" textAnchor="middle" x={year.x} y="364">
                          {year.year}
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </article>

            <div className="report-chart-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="report-block report-chart-card rounded-[20px] border border-slate-200 bg-white p-5">
                <h3 className="text-base font-bold text-slate-950">Sales by Category</h3>
                {categorySalesUnavailable ? (
                  <div className="mt-4 grid min-h-48 place-items-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">
                    Category Analysis unavailable
                  </div>
                ) : (
                  <div className="mt-5 flex items-center gap-5">
                    <div className="report-donut relative size-36 shrink-0 rounded-full" style={{ background: donutGradient }}>
                      <div className="absolute inset-7 rounded-full bg-white"></div>
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                        Total Revenue
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }).format(totalCategoryRevenue)}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {categorySales.map((category, index) => (
                          <li className="flex items-center justify-between gap-3 text-sm" key={category.category}>
                            <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-600">
                              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }}></span>
                              <span>{category.category}</span>
                            </span>
                            <span className="font-bold tabular-nums text-slate-900">{category.percentage.toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </article>

              <article className="report-block report-chart-card rounded-[20px] border border-slate-200 bg-white p-5">
                <h3 className="text-base font-bold text-slate-950">Top 5 Products by Revenue</h3>
                {topProductsUnavailable ? (
                  <div className="mt-4 grid min-h-48 place-items-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-400">
                    Top Products unavailable
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {topProducts.map((product) => (
                      <div key={product.product_name}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-600">{product.product_name}</span>
                          <span className="font-bold tabular-nums text-slate-950">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(product.revenue)}
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div className="report-product-bar h-full rounded-full bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-400" style={{ width: `${Math.max((product.revenue / highestProductRevenue) * 100, 3)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </div>
        </section>

        <section className="report-block rounded-[24px] border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-slate-950">Business Insights</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {generalInsights.map((insight) => (
              <InsightCard insight={insight} key={insight.title} />
            ))}
          </div>
        </section>

        {(paretoAnalysis || longTailAnalysis) && (
          <section className="report-block rounded-[24px] border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold text-slate-950">Portfolio Analysis</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {paretoAnalysis && <InsightCard insight={paretoAnalysis} />}
              {longTailAnalysis && <InsightCard insight={longTailAnalysis} />}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default ReportView
