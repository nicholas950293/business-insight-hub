# Business Insight Hub

## Project Overview

Business Insight Hub is a full-stack AI + Data + BI platform prototype. Users upload e-commerce CSV data and receive a polished dashboard with dataset quality signals, KPI metrics, and business visualizations.

This project is built as a portfolio-ready prototype focused on clean product thinking, modular backend analysis, and a modern SaaS dashboard experience.

## Features

- CSV upload from the React dashboard
- FastAPI CSV analysis endpoint
- Dataset overview and data quality metrics
- KPI summary cards
- Revenue trend line chart
- Category sales donut chart
- Top products horizontal bar chart
- Graceful fallback UI when required CSV columns are missing
- Realistic e-commerce sample data
- Automated test dataset generator for upload scenarios
- AI Business Summary placeholder for future expansion

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI, pandas, Pydantic
- Data: CSV upload via multipart form data
- Tooling: pnpm, Python, Uvicorn

## Architecture Summary

The frontend is responsible for presentation, upload interaction, loading states, error states, and rendering dashboard components.

The backend owns business logic. It reads CSV files with pandas, detects available columns, checks which analysis modules can run, calculates metrics, and returns structured JSON to the frontend.

Current backend modules include:

- Dataset Overview
- KPI Summary
- Revenue Trend
- Category Sales
- Top Products

For more detail, see [docs/ARCHITECTURE_V1.md](docs/ARCHITECTURE_V1.md).

## How To Run Frontend

Install dependencies:

```bash
pnpm install
```

Start the Vite dev server:

```bash
pnpm dev
```

Frontend URL:

```text
http://127.0.0.1:5173/
```

## How To Run Backend

From the `backend` folder, install Python dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000/
```

Main API endpoint:

```text
POST /api/analyze-csv
```

## Test Datasets

The project includes a realistic sample e-commerce dataset:

```text
backend/app/sample_data/ecommerce_sales.csv
```

Generate additional upload-testing datasets:

```bash
cd backend
python tools/generate_test_datasets.py
```

Generated files are written to:

```text
backend/test_data/
```

Included scenarios:

- Normal CSV
- Light missing values
- Heavy missing values
- Missing required columns
- Wrong column names

## Current Status

Completed:

- React + Vite + Tailwind dashboard prototype
- FastAPI backend foundation
- CSV upload endpoint
- Capability checker
- Dataset Overview analysis
- KPI Summary analysis
- Revenue Trend analysis
- Category Sales analysis
- Top Products analysis
- Frontend integration for uploaded CSV results
- Test dataset generator
- V1 architecture documentation

Not implemented yet:

- AI-generated business summary
- User authentication
- Database persistence
- Upload history
- Workflow automation
- Email automation

## Roadmap

- Add AI Business Summary generation
- Add richer data validation feedback
- Add exportable reports
- Add upload history with persistence
- Add workflow recommendations
- Add polished final responsive QA pass
- Prepare deployment configuration

## Project Philosophy

Business Insight Hub prioritizes a working product loop over unnecessary complexity:

1. Upload data.
2. Detect what can be analyzed.
3. Return useful business metrics.
4. Render a clean dashboard.
5. Fail gracefully when data is incomplete.

Prototype first. Polish with intent.
