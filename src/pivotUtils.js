const UNKNOWN_DIMENSION_VALUE = 'Unknown'
const MONTH_FIELD = '__month'

const isBlankValue = (value) =>
  value === null || value === undefined || String(value).trim() === ''

export const humanizeFieldName = (field) => {
  if (field === MONTH_FIELD) return 'Month'

  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getDimensionValue = (record, field) => {
  const rawValue = field === MONTH_FIELD
    ? String(record.order_date ?? '').slice(0, 7)
    : record[field]

  return isBlankValue(rawValue) ? UNKNOWN_DIMENSION_VALUE : String(rawValue)
}

const compareDimensionValues = (valueA, valueB, field) => {
  if (valueA === UNKNOWN_DIMENSION_VALUE) return 1
  if (valueB === UNKNOWN_DIMENSION_VALUE) return -1

  if (field === MONTH_FIELD || field === 'order_date') {
    return valueA.localeCompare(valueB)
  }

  return valueA.localeCompare(valueB, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export const getPivotFieldOptions = (records) => {
  const fields = [...new Set(records.flatMap((record) => Object.keys(record)))]
  const numericFields = fields.filter((field) => {
    if (field === 'order_date' || field.endsWith('_id')) return false

    const populatedValues = records
      .map((record) => record[field])
      .filter((value) => !isBlankValue(value))

    return (
      populatedValues.length > 0 &&
      populatedValues.every((value) => Number.isFinite(Number(value)))
    )
  })
  const numericFieldSet = new Set(numericFields)
  const dimensionFields = fields.filter(
    (field) =>
      !numericFieldSet.has(field) &&
      records.some((record) => !isBlankValue(record[field])),
  )

  if (
    fields.includes('order_date') &&
    records.some((record) => /^\d{4}-\d{2}/.test(String(record.order_date ?? '')))
  ) {
    dimensionFields.splice(
      Math.max(dimensionFields.indexOf('order_date'), 0),
      0,
      MONTH_FIELD,
    )
  }

  return {
    dimensions: [...new Set(dimensionFields)].map((field) => ({
      field,
      label: humanizeFieldName(field),
    })),
    values: numericFields.map((field) => ({
      field,
      label: humanizeFieldName(field),
    })),
  }
}

export const buildPivotTable = (records, rowField, columnField, valueField) => {
  if (!rowField || !valueField) return null

  const rowGroups = new Map()
  const columnValues = new Set()

  records.forEach((record) => {
    if (isBlankValue(record[valueField])) return

    const numericValue = Number(record[valueField])
    if (!Number.isFinite(numericValue)) return

    const rowValue = getDimensionValue(record, rowField)
    const columnValue = columnField
      ? getDimensionValue(record, columnField)
      : null
    const rowGroup = rowGroups.get(rowValue) ?? {
      cells: new Map(),
      total: 0,
    }

    rowGroup.total += numericValue

    if (columnValue !== null) {
      rowGroup.cells.set(
        columnValue,
        (rowGroup.cells.get(columnValue) ?? 0) + numericValue,
      )
      columnValues.add(columnValue)
    }

    rowGroups.set(rowValue, rowGroup)
  })

  const columns = [...columnValues].sort((valueA, valueB) =>
    compareDimensionValues(valueA, valueB, columnField),
  )
  const rows = [...rowGroups.entries()]
    .sort(([valueA], [valueB]) =>
      compareDimensionValues(valueA, valueB, rowField),
    )
    .map(([label, group]) => ({
      label,
      values: columns.map((column) => group.cells.get(column) ?? 0),
      total: group.total,
    }))
  const columnTotals = columns.map((column) =>
    rows.reduce(
      (total, row) => total + (rowGroups.get(row.label)?.cells.get(column) ?? 0),
      0,
    ),
  )
  const grandTotal = rows.reduce((total, row) => total + row.total, 0)

  return { columns, rows, columnTotals, grandTotal }
}

export const formatPivotValue = (value, valueField) => {
  const options = { maximumFractionDigits: 2 }

  if (valueField === 'revenue') {
    return new Intl.NumberFormat('en-US', {
      ...options,
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return new Intl.NumberFormat('en-US', options).format(value)
}
