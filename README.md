# EyeQ

EyeQ is a full-stack OCT scan demo application for AMD detection workflows.

It includes:

- A React frontend served by Nginx
- A FastAPI backend API for scan intake, orchestration, and history
- A dedicated mock inference FastAPI service
- SQLite for metadata
- MinIO for image object storage
- Docker Compose for one-command local deployment

This repository is structured for clean local development and easy deployment using containers.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [How the System Works](#how-the-system-works)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Run the Application](#run-the-application)
- [Validation and Troubleshooting](#validation-and-troubleshooting)
- [Frontend Notes](#frontend-notes)
- [Backend Notes](#backend-notes)
- [Inference Notes](#inference-notes)
- [Data and Storage](#data-and-storage)
- [Sample Images](#sample-images)
- [Production Considerations](#production-considerations)

---

## Architecture Overview

EyeQ runs as four main services plus a one-time setup helper:

1. `frontend` (Nginx + static React build)
   - Public UI entry point on `http://localhost:5173`
   - Proxies `/api/*` traffic to the backend service

2. `api` (FastAPI backend)
   - Handles scan creation, validation, listing, patient history, and deletion
   - Stores metadata in SQLite (`./data/eyeq.db`)
   - Stores original OCT image bytes in MinIO
   - Calls inference service with a resized image (224x224)

3. `inference` (FastAPI mock inference)
   - Receives image files and returns synthetic prediction probabilities
   - Currently mock-only mode for showcase/demo

4. `minio` (S3-compatible object storage)
   - Stores uploaded OCT images in bucket `eyeq-scans`

5. `minio-setup` (one-shot init)
   - Creates bucket if missing
   - Sets anonymous download access for image URLs

---

## Repository Structure

```text
eyeq/
├── frontend/                 # React + Vite + TanStack Router app
├── backend/                  # Main API server (FastAPI)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── storage.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   ├── scans.py
│   │   │   └── health.py
│   │   └── services/
│   │       ├── scan_service.py
│   │       └── inference_client.py
│   ├── Dockerfile
│   └── requirements.txt
├── inference/                # Dedicated inference service (mock)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── model.py
│   │   └── schemas.py
│   ├── weights/
│   │   └── .gitkeep
│   ├── Dockerfile
│   └── requirements.txt
├── data/                     # SQLite db directory
├── storage/                  # MinIO data directory
├── imgs/                     # sample OCT images committed in repo
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## How the System Works

### Scan creation flow

1. User submits form + image in frontend.
2. Frontend sends multipart request to `POST /api/v1/scans/`.
3. Backend validates:
   - image type (`jpeg/png`)
   - image size (<= 10MB)
   - form fields via Pydantic (`ScanCreate`)
4. Backend uploads original image to MinIO.
5. Backend resizes image to `224x224` and sends to inference service.
6. Inference returns:
   - `prediction`
   - `confidence`
   - `class_breakdown`
7. Backend stores metadata in SQLite.
8. Backend returns scan response to frontend.

### Scan history flow

1. Frontend requests `GET /api/v1/scans/`.
2. Backend returns paginated list sorted by newest.
3. Frontend renders cards and supports local sort UI options.

---

## API Endpoints

Base routes are mounted under `/api/v1` in backend.

### Health

- `GET /api/v1/health`
  - Checks database, MinIO, and inference connectivity.

### Scans

- `POST /api/v1/scans/`
  - Multipart form fields:
    - `patient_name`
    - `patient_id`
    - `age`
    - `gender` (`Male|Female|Other`)
    - `eye_examined` (`Left|Right|Both`)
    - `scan_date`
    - `oct_image` (jpeg/png)

- `GET /api/v1/scans/?page=1&page_size=20&prediction=Dry%20AMD`
  - Paginated list with optional prediction filter.

- `GET /api/v1/scans/{scan_id}`
  - Detailed scan by id.

- `DELETE /api/v1/scans/{scan_id}`
  - Deletes scan metadata + object from MinIO.

- `GET /api/v1/scans/patient/{patient_id}`
  - Returns all scans for a patient id.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Current supported variables:

- `APP_ENV`
- `DATABASE_URL`
- `INFERENCE_URL`
- `USE_MOCK_MODEL`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET_NAME`
- `MINIO_USE_SSL`

Default values are already suitable for local Docker Compose usage.

---

## Run the Application

### One-command startup

```bash
docker compose up --build
```

This command builds images and starts all required services.

### Service URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Inference service: `http://localhost:8001`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

MinIO default credentials (local demo):

- Username: `minioadmin`
- Password: `minioadmin`

### Run detached

```bash
docker compose up --build -d
```

### Stop services

```bash
docker compose down
```

---

## Validation and Troubleshooting

### Check running containers

```bash
docker compose ps
```

### Check service logs

```bash
docker compose logs --tail=200 frontend
docker compose logs --tail=200 api
docker compose logs --tail=200 inference
docker compose logs --tail=200 minio
```

### Health checks

```bash
curl http://localhost:8000/api/v1/health
curl http://localhost:8001/health
```

### Common issues

1. `502 Bad Gateway` from frontend
   - Usually frontend container cannot reach API container.
   - Check `frontend` logs and `api` status.

2. `500` during scan create
   - Check `api` logs for MinIO or inference connectivity issues.

3. MinIO object URL not loading
   - Ensure `minio-setup` has run and bucket policy is set to download.

---

## Frontend Notes

- Built with React + Vite.
- Served in production via Nginx container.
- Uses TanStack Router and TanStack Query.
- New scan submits to backend API (`/api/v1/scans/`).
- History page fetches records from backend.

Nginx handles:

- SPA fallback routing (`try_files ... /index.html`)
- Reverse proxy for `/api/` to backend container.

---

## Backend Notes

Backend is intentionally simple and readable:

- `routes/*` for request handling
- `services/*` for business logic and inference call
- `storage.py` for MinIO operations
- `database.py` for SQLAlchemy setup and dependency

Startup behavior in `main.py`:

- Creates DB tables
- Retries MinIO bucket check/creation before serving traffic

---

## Inference Notes

Inference service is mock-only in current codebase.

- `POST /predict` returns synthetic but realistic probabilities.
- Simulates model latency with `await asyncio.sleep(1.0)`.
- Labels:
  - `Normal`
  - `Dry AMD`
  - `Wet AMD`

This keeps architecture realistic while avoiding heavy model runtime dependencies.

---

## Data and Storage

- SQLite metadata file: `data/eyeq.db`
- MinIO objects stored under bucket: `eyeq-scans`
- Object keys are namespaced by scan id: `scans/<scan_id>/<filename>`

`class_breakdown` is stored in DB as JSON string and converted back in API responses.

---

## Sample Images

The repository includes sample files in `imgs/`:

- `imgs/cnv-test-1.jpeg`
- `imgs/dme-test-1.jpeg`
- `imgs/drusen-test-1.jpeg`
- `imgs/normal-test-1.jpeg`

These are useful for quick manual upload testing through the frontend.

---

## Production Considerations

For real deployment, consider these upgrades:

1. Replace mock inference with real model serving.
2. Move MinIO and DB credentials out of defaults.
3. Restrict MinIO bucket/object access instead of public downloads.
4. Add request auth and role-based access.
5. Add observability (structured logs, metrics, tracing).
6. Add migration tooling for schema evolution.

Current setup is optimized for local showcase/demo, fast iteration, and clear code readability.
