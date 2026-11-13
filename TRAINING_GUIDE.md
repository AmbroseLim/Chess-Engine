Training guide — LC0 (AlphaZero-style) experiments using free GPUs (Colab / Kaggle)

Overview
- Leela Chess Zero (LC0) is an open-source AlphaZero-style engine (neural network + MCTS).
- Full-scale training to top strength requires many GPU-hours and distributed workers; NOT feasible on free GPUs to reach top ratings.
- Use Colab/Kaggle for small experiments, inference, and to boot-strap networks.

Quick start (Colab)
1. Open a Colab notebook and enable a GPU runtime (Runtime > Change runtime type > GPU).
2. Build or download a leelaz binary with CUDA support. Example (outline):
   - apt-get update && apt-get install -y build-essential cmake libboost-all-dev libssl-dev
   - git clone https://github.com/LeelaChessZero/leela-zero.git
   - follow leela-zero README to build leelaz (cmake, make)
3. Run leelaz for self-play / inference:
   - ./leelaz --gtp --weights /path/to/network.pb.gz --threads 1 --noponder
   - To generate self-play games, run leelaz in self-play mode (see leela-zero docs).
4. Training: use the official training pipeline (leela-zero) or small AlphaZero-lite scripts (PyTorch) for toy networks.

Notes & recommendations
- For useful results, start from existing LC0 networks rather than training from scratch.
- For serious training, consider contributing to the Leela Chess Zero distributed training pool.
- This repo adds a server-mode stub (lib/lc0.ts) that calls POST /api/engine; implement server-side leelaz spawning to enable LC0 in-app.

If you want, I can:
- Add a Next.js API route that runs a local leelaz binary (server engine mode) and forwards JSON requests — DONE: app/api/lc0/route.ts
- Provide a Colab notebook template that builds leelaz and runs a tiny self-play loop (toy experiments) — DONE: colab/lc0_colab_template.ipynb
- Show how to download and use pre-trained LC0 networks for inference in this app — DONE: /api/lc0 downloadNetwork

Docker & server setup
- A simple Docker setup is included (Dockerfile + docker-compose.yml) to run the Next.js app and a LC0 build container.
- Steps:
  1. Install Docker & Docker Compose.
  2. Build and start: `docker compose up --build` (this builds the web and lc0 images). The web app will be available at http://localhost:3000
  3. Place or download networks into the `networks/` volume (see API below).

Downloading pre-trained networks in-app
- Use the LC0 API to download networks into the shared `networks/` folder:
  POST /api/lc0 { "action": "downloadNetwork", "url": "https://.../network.pb.gz", "name": "my-net.pb.gz" }
- Then initialize the LC0 engine with that network:
  POST /api/lc0 { "action": "init", "networkPath": "/networks/my-net.pb.gz" }

Notes & limitations
- The LC0 container builds a CPU-only leelaz by default. Replace the build flags in lib/server/Dockerfile for CUDA if using a GPU-enabled base image.
- Running long training jobs inside Colab or the container may require additional orchestration (autogtp, multi-process training). Use `POST /api/train` to start/stop autogtp (server-side).

I added Dockerfiles and a small start script under lib/server/. A CUDA-enabled Dockerfile is provided at `lib/server/Dockerfile.cuda` for building with GPU support. To use it on an NVIDIA host with the NVIDIA Container Toolkit installed:

1. Build the CUDA image: `docker build -f lib/server/Dockerfile.cuda -t leela-cuda:latest .`
2. Modify `docker-compose.yml` to use the CUDA image for the `lc0` service or run the container with `--gpus` enabled.

Contact me if you want a prebuilt CUDA image or CI to publish one.

What I added for you in this repo:

- Network manager enhancements: auto-select the largest/newest network and optional auto-init on load (toggle in Network Manager).
- scripts/push_cuda_image.sh: local helper to tag + push the CUDA image to Docker Hub (set DOCKER_REPO env var).
- .github/workflows/build-and-push-cuda.yml: GitHub Actions workflow to build and push the CUDA image when you dispatch it.

How to use these features:

1) Local: bring the app + LC0 container up
   - Install Docker and Docker Compose
   - Run: npm run docker:up
   - Upload or download networks via Control Panel → Network Manager
   - Toggle "Auto-init best network on load" if you want the best network started automatically

2) Build and push CUDA image locally
   - Ensure Docker is installed and you have NVIDIA Container Toolkit on an NVIDIA host
   - Build: npm run docker:build-cuda
   - Push: set DOCKER_REPO (e.g., myuser/leela-cuda) then run npm run docker:push-cuda

3) CI: GitHub Actions
   - Create repository secrets DOCKERHUB_USERNAME and DOCKERHUB_TOKEN in your GitHub repo
   - Run the workflow: GitHub → Actions → Build and Push LC0 CUDA Image → Run workflow
   - The workflow builds lib/server/Dockerfile.cuda and pushes with the repository name tag

Security/notes:
- I do not store credentials in the repo. Use GitHub secrets for CI.
- Building CUDA images can be heavy and may fail on GitHub runners depending on build steps and timeouts; test locally first.
- The CUDA image requires NVIDIA host GPU drivers / nvidia-docker to run effectively.

If you want, next steps I can take for you:
- Publish a prebuilt CUDA image under your Docker Hub account (requires your Docker Hub credentials or you can run the provided script locally).
- Add a UI control to select a recommended network per-engine (e.g., different networks for opening/rapid/deep play).
- Add backend validation that verifies leelaz exists and returns version info when LC0 is initialized.
