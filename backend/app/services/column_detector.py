import pandas as pd


def detect_columns(dataframe: pd.DataFrame) -> list[str]:
    return [str(column).strip() for column in dataframe.columns]
