# Smart Eye Care: Project Information

## Overview
Smart Eye Care is an advanced telemedicine platform designed to bridge the gap between patients, ophthalmologists, and diagnostic labs. It leverages **Ensemble Deep Learning** to detect key retinal conditions (Diabetic Retinopathy, Glaucoma, Cataracts) from fundus images with high accuracy.

## Key Features
- **Instant AI Analysis**: Get results in seconds using an ensemble of deep learning models (ResNet-50 and AlexNet).
- **Medically Verified**: Critical results are flagged for doctor review and lab verification.
- **3D & AR Visualization**: Interactive demos and AR filters to help patients visualize how different conditions affect vision (Privacy-focused).
- **Secure Storage**: Medical data is encrypted with AES-256 and is HIPAA compliant.
- **Smart History**: Automated trend analysis to track eye health progression over time.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS v4, Framer Motion.
- **Backend API**: Flask (Python).
- **Database**: SQLite with SQLAlchemy ORM.
- **AI/ML Engine**: PyTorch, torchvision, Grad-CAM (XAI).
- **Security**: AES-256 Encryption, HIPAA compliance.

## The Team
- **Jayaharini**: Lead AI Architect & Backend Specialist. Expert in Deep Learning ensembles and Python microservices.
- **Kailash**: Lead Automation & Prompt Engineer. Architect of autonomous agentic workflows and LLM orchestration.
- **Jerlin John**: Principal Frontend & UI/UX Engineer. Expert in Next.js architecture and high-fidelity UI design.

## Technical Highlights
- **C3-RAG (Clinically-Constrained, Confidence-Aware RAG)**: This is the system's core intelligence layer. It prioritizes medical guidelines and AI confidence over generic LLM knowledge. In this project, **RAG** stands for **Retrieval-Augmented Generation**, NOT a color-coded status system.
- **Ensemble Learning**: Aggregates predictions from ResNet-50 (deep features) and AlexNet (structural patterns) for robust results (98% accuracy).
- **Explorable AI (XAI)**: Generates Grad-CAM heatmaps to highlight diagnostic "hotspots" for doctors.
- **CACS Design System**: Clinical Adaptive Color System for role-specific accessibility.
