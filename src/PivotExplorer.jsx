import { useEffect, useMemo, useState } from 'react'
import {
  buildPivotTable,
  formatPivotValue,
  getPivotFieldOptions,
  humanizeFieldName,
} from './pivotUtils'

function PivotExplorer({ fieldRecords, records }) {
  const [rowField, setRowField] = useState('')
  const [columnField, setColumnField] = useState('')
  const [valueField, setValueField] = useState('')
  const fieldOptions = useMemo(
    () => getPivotFieldOptions(fieldRecords),
    [fieldRecords],
  )
  const dimensionFieldSet = useMemo(
    () => new Set(fieldOptions.dimensions.map((option) => option.field)),
    [fieldOptions.dimensions],
  )
  const numericFieldSet = useMemo(
    () => new Set(fieldOptions.values.map((option) => option.field)),
    [fieldOptions.values],
  )

  useEffect(() => {
    if (rowField && !dimensionFieldSet.has(rowField)) setRowField('')
    if (columnField && !dimensionFieldSet.has(columnField)) setColumnField('')
    if (valueField && !numericFieldSet.has(valueField)) setValueField('')
  }, [columnField, dimensionFieldSet, numericFieldSet, rowField, valueField])

  const pivotTable = useMemo(
    () => buildPivotTable(records, rowField, columnField, valueField),
    [columnField, records, rowField, valueField],
  )
  const hasUsableFields =
    fieldOptions.dimensions.length > 0 && fieldOptions.values.length > 0
  const selectedValueLabel = fieldOptions.values.find(
    (option) => option.field === valueField,
  )?.label

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-500">
            Data Exploration
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Pivot Explorer
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Summarize the current date-range selection with a SUM pivot table.
          </p>
        </div>

        {hasUsableFields && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              Rows
              <select
                className="mt-1 block w-full min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                onChange={(event) => {
                  const nextRowField = event.target.value
                  setRowField(nextRowField)
                  if (columnField === nextRowField) setColumnField('')
                }}
                value={rowField}
              >
                <option value="">Select field</option>
                {fieldOptions.dimensions.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              Columns
              <select
                className="mt-1 block w-full min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                onChange={(event) => setColumnField(event.target.value)}
                value={columnField}
              >
                <option value="">None</option>
                {fieldOptions.dimensions
                  .filter((option) => option.field !== rowField)
                  .map((option) => (
                    <option key={option.field} value={option.field}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
              Values
              <select
                className="mt-1 block w-full min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                onChange={(event) => setValueField(event.target.value)}
                value={valueField}
              >
                <option value="">Select field</option>
                {fieldOptions.values.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {!hasUsableFields ? (
        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
          This dataset needs at least one usable dimension and one numeric field
          for pivot exploration.
        </div>
      ) : !pivotTable ? (
        <div className="mt-5 rounded-[20px] border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center text-sm font-semibold text-slate-500">
          Select a Rows field and a Values field to generate a pivot table.
        </div>
      ) : pivotTable.rows.length === 0 ? (
        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
          No valid numeric values are available for the current selection.
        </div>
      ) : (
        <div className="mt-5 max-w-full overflow-x-auto rounded-[20px] border border-slate-200 bg-white">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="sticky left-0 z-10 min-w-44 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  {humanizeFieldName(rowField)}
                </th>
                {pivotTable.columns.map((column) => (
                  <th
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-right"
                    key={column}
                  >
                    {column}
                  </th>
                ))}
                <th className="whitespace-nowrap border-b border-slate-200 bg-violet-50 px-4 py-3 text-right text-violet-700">
                  {pivotTable.columns.length ? 'Total' : `Sum of ${selectedValueLabel}`}
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {pivotTable.rows.map((row) => (
                <tr key={row.label}>
                  <th className="sticky left-0 z-10 border-b border-slate-100 bg-white px-4 py-3 font-bold text-slate-800">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-semibold tabular-nums"
                      key={pivotTable.columns[index]}
                    >
                      {formatPivotValue(value, valueField)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap border-b border-violet-100 bg-violet-50/40 px-4 py-3 text-right font-bold tabular-nums text-slate-900">
                    {formatPivotValue(row.total, valueField)}
                  </td>
                </tr>
              ))}
              <tr>
                <th className="sticky left-0 z-10 bg-violet-50 px-4 py-3 font-bold text-violet-800">
                  Grand Total
                </th>
                {pivotTable.columnTotals.map((total, index) => (
                  <td
                    className="whitespace-nowrap bg-violet-50 px-4 py-3 text-right font-bold tabular-nums text-violet-800"
                    key={pivotTable.columns[index]}
                  >
                    {formatPivotValue(total, valueField)}
                  </td>
                ))}
                <td className="whitespace-nowrap bg-violet-100 px-4 py-3 text-right font-bold tabular-nums text-violet-900">
                  {formatPivotValue(pivotTable.grandTotal, valueField)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default PivotExplorer
