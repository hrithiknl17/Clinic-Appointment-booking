# 🩺 MediBook - Telehealth & Clinic Appointment Platform

A modern, full-stack Software-as-a-Service (SaaS) platform built to seamlessly connect patients with healthcare providers. MediBook handles secure user authentication, appointment scheduling, relational data management, and features a built-in virtual consultation room.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Key Features

* **Multi-Tenant Architecture:** Distinct routing and dashboards for both Patients (`/dashboard`) and Healthcare Providers (`/provider`).
* **Secure Authentication:** Bank-level security using Supabase Auth (Email/Password) to protect medical data and restrict routing.
* **Dynamic Scheduling System:** Patients can browse a live database of doctors, view specialties, and book or cancel appointments in real-time.
* **Virtual Consultations:** Fully integrated Video Call UI (`/video-call/:id`) simulating WebRTC camera/microphone connections for telehealth appointments.
* **Relational Data Mapping:** FastAPI backend utilizes complex database joins to instantly pair appointment UUIDs with corresponding doctor profiles and patient records.

## 🏗️ System Architecture

* **Frontend:** React 19 + TypeScript + Vite. Styled with Tailwind CSS and `shadcn/ui` components for a highly responsive, accessible user interface.
* **Backend:** Python 3 + FastAPI. Serves RESTful API endpoints with extreme speed and automatic OpenAPI documentation.
* **Database:** PostgreSQL (hosted on Supabase). Manages relational tables for `doctors`, `appointments`, `profiles`, and `articles`.

---

## 🚀 Local Setup & Installation

To run this project locally, you will need two terminal windows open—one for the Python backend, and one for the React frontend.

### 1. Database Setup (Supabase)
1. Create a project on [Supabase](https://supabase.com).
2. Create the following tables in the SQL Editor: `doctors`, `appointments`, `profiles`, and `articles`.
3. Grab your **Project URL** and **API Keys** from the Supabase settings.

### 2. Backend Setup (FastAPI)
Open a terminal and navigate to the `backend` folder:
```bash

###hello
