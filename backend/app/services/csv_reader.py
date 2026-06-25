from io import BytesIO

import pandas as pd
from fastapi import HTTPException, UploadFile


async def read_csv_upload(file: UploadFile) -> pd.DataFrame:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")

    try:
        return pd.read_csv(BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the uploaded CSV file.",
        ) from exc
