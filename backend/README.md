# Business Insight Hub Backend

FastAPI backend skeleton for Business Insight Hub V1.5 CSV analysis.

## Setup

```bash
pip install -r requirements.txt
```

## Run

From inside the `backend` folder:

```bash
uvicorn app.main:app --reload
```

## Endpoint

`POST /api/analyze-csv`

Accepts a CSV file upload and returns:

- filename
- detected columns
- total rows
- available analysis modules
- skipped analysis modules with missing-column reasons

## Sample Data

Sample e-commerce CSV:

```text
app/sample_data/ecommerce_sales.csv
```
