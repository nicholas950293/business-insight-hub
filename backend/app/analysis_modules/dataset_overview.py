import pandas as pd


def analyze_dataset_overview(dataframe: pd.DataFrame) -> dict:
    total_rows = len(dataframe)
    total_columns = len(dataframe.columns)
    column_names = [str(column).strip() for column in dataframe.columns]
    missing_values_total = int(dataframe.isna().sum().sum())
    total_cells = total_rows * total_columns
    missing_values_rate = (
        round(missing_values_total / total_cells * 100, 2) if total_cells else 0.0
    )
    duplicate_rows = int(dataframe.duplicated().sum())

    start_date = None
    end_date = None
    if "order_date" in dataframe.columns:
        parsed_dates = pd.to_datetime(dataframe["order_date"], errors="coerce")
        valid_dates = parsed_dates.dropna()

        if not valid_dates.empty:
            start_date = valid_dates.min().date().isoformat()
            end_date = valid_dates.max().date().isoformat()

    return {
        "total_rows": total_rows,
        "total_columns": total_columns,
        "column_names": column_names,
        "missing_values_total": missing_values_total,
        "missing_values_rate": missing_values_rate,
        "duplicate_rows": duplicate_rows,
        "date_range": {
            "start_date": start_date,
            "end_date": end_date,
        },
    }
