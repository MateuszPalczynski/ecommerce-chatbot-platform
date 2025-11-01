# Full-Stack E-commerce Microservices Platform 🛍️

**Live Application:** 100.27.221.122 (Note: This is a volatile IP for a running AWS EC2 instance and may change upon restart.)

This repository contains the source code for a comprehensive, full-stack e-commerce application. The platform is built using a modern microservices architecture, featuring separate services for product management, user authentication, and an AI-powered chatbot.

The stack includes a Go (Echo) backend, a React frontend, a Python AI service, and a complete CI/CD pipeline deploying to AWS using Docker and GitHub Actions.

---

# 📋 Table of Contents

1. [High-Level Architecture](#high-level-architecture)  
   1.1 [frontend-client (React)](#frontend-client-react)  
   1.2 [products-service (Go)](#products-service-go)  
   1.3 [auth-service (Go)](#auth-service-go)  
   1.4 [chatbot-service (Python)](#chatbot-service-python)  
2. [✨ Core Features](#core-features)  
   2.1 [Backend: Products & Cart (Go)](#backend-products--cart-go)  
   2.2 [Frontend (React)](#frontend-react)  
   2.3 [Authentication (OAuth2 & Local)](#authentication-oauth2--local)  
   2.4 [AI Chatbot Service (Python)](#ai-chatbot-service-python)  
3. [🛠️ Technology Stack](#technology-stack)  
4. [🔑 Key System Design: Secure Auth Flow](#key-system-design-secure-auth-flow)  
5. [🚀 CI/CD Pipeline](#cicd-pipeline)  

---

# 🏛️ High-Level Architecture

The production architecture deployed to AWS consists of three core services and a database. The complete project stack, including the chatbot-service, is available for local development.

- **frontend-client (React):**
  - The main user-facing application. It provides the UI for browsing products, managing the cart, handling payments, and interacting with all backend services.

- **products-service (Go):**
  - A robust backend service built with the Echo framework. It handles all e-commerce logic, including:
    - Product catalog management (CRUD)
    - Product categories and relations
    - Shopping cart operations  
  - Uses GORM for ORM and database interaction.

- **auth-service (Go):**
  - A dedicated service for user identity. It manages:
    - Local user registration and login (email/password)
    - Server-side Google OAuth2 flow
    - JWT generation and token management.

- **chatbot-service (Python):**
  - An independent service that provides AI assistance to users
  - Features a Python backend that queries an LLM (tested with Ollama)
  - Filters LLM requests to stay on-topic (store inventory, clothing, etc.)
  - Deployment Note: This service is part of the local development stack but is intentionally excluded from the production (AWS) deployment due to the high memory/CPU requirements of LLMs,      which exceed the t3.micro free tier.

- **db (PostgreSQL):**
  - A containerized PostgreSQL database that serves as the persistent data store for both the products-service and auth-service, ensuring data is shared and durable via a Docker volume.

---

# ✨ Core Features

## Backend: Products & Cart (Go)

- RESTful API: A clean API built with the Echo framework.  
- Full CRUD Functionality: The products-service provides complete Create, Read, Update, and Delete operations for products.  
- Data Modeling: Uses GORM to map Go structs to database tables for Products, Categories, and Carts.  
- Relational Data: Manages the relationship between Products and Categories.  
- Cart Management: Dedicated models and API endpoints for adding/removing items from a user's cart.

## Frontend (React)

- Component-Based UI: Built with two primary components:
  - **Products:** Fetches and displays product data from the products-service.
  - **Payments:** A form component that submits payment and order data to the backend.  
- Client-Side Routing: Uses React Router to provide a seamless multi-page experience, including a dedicated view for the shopping cart.  
- Modern State Management: Leverages React Hooks (e.g., useState, useContext, useEffect) to manage and propagate state (like cart contents and user data) across all components.

## Authentication (OAuth2 & Local)

- Local Registration: Standard email and password registration handled by the auth-service.  
- Local Login: Secure session/token-based login for registered users.  
- Google OAuth2 (Server-Side): A secure, server-managed OAuth2 flow.
  - The auth-service acts as the OAuth2 client.
  - User data and provider tokens are stored securely in the server's database.
  - The server generates its own custom JWT, which is sent to the React client for session management.  
- Security: This flow explicitly avoids storing provider tokens or secrets on the client side.

## AI Chatbot Service (Python)

- Separate Service: A complete Python application for handling user chat.  
- Frontend Interface: A dedicated UI for users to interact with the bot.  
- LLM Integration: The Python backend service connects to an LLM (tested with local Ollama) to generate responses.
- Domain Filtering: Intelligently filters user queries to ensure the LLM only responds to questions related to the e-commerce store, its products (clothing), and general store information.  
- Natural Conversation: Includes a predefined list of 5 different conversation openers and closers to feel more natural.

> Note: This service is not deployed to production (AWS) as the resource requirements for running LLMs are unsuitable for the EC2 free tier. It is fully functional within the local development environment.

---

# 🛠️ Technology Stack

- **Frontend:** React, React Router  
- **Backend (services):** Go (Echo), Python  
- **ORM / DB:** GORM, relational database (PostgreSQL)  
- **Authorization:** OAuth2 (Google), JWT  
- **AI:** Local Ollama models for testing
- **Containerization / Deployment:** Docker, AWS (EC2, ECR, IAM)  
- **CI/CD:** GitHub Actions

---

# 🔑 Key System Design: Secure Auth Flow

A critical requirement of this project is the secure, server-side handling of OAuth2 authentication.

**Rule:** Direct client-side authentication with a provider (e.g., using a package like react-google-login that communicates directly with Google) is strictly forbidden. All communication must be proxied through the auth-service.

**Correct Authentication Flow:**

1. **React Client:** User clicks "Login with Google."  
2. **Request:** React client (via window.location.href) redirects the user's browser to the auth-service (e.g., `http://<IP>:8001/login/google`).  
3. **auth-service (Server):** Generates a state token and redirects the user's browser to the Google OAuth consent screen.  
4. **Google:** User authenticates and grants permission.  
5. **Redirect:** Google redirects the user back to the auth-service callback URI (e.g., `/api/auth/google/callback`) with an authorization code.  
6. **auth-service (Server):**
   - Verifies the state token.
   - Exchanges the authorization code with Google for an access token and user profile.
   - Saves/updates the user info and provider token in its own database.
   - Generates a new, internal JWT (or session) for the user.  
7. **React Client:** The server sends this internal JWT back to the React client, which stores it (e.g., in localStorage) to authenticate future API requests.

**Security Notes:**

- This flow explicitly avoids storing provider tokens or secrets on the client side.  
- The auth-service is responsible for token refresh and secure storage.

---

# 🚀 CI/CD Pipeline

The project is configured for Continuous Integration and Continuous Deployment using GitHub Actions and AWS.

- **Trigger:** A push or merge to the `master` branch initiates the GitHub Actions workflow defined in .github/workflows/deploy.yml.

**Job 1: build-and-push**
- Login: Authenticates with the AWS ECR service.
- Build: Builds Docker images for the three production services: frontend-client, products-service, and auth-service. (The chatbot-service is intentionally skipped).
- Push: Tags the newly built images with latest and pushes them to AWS ECR.

**Job 2: deploy**
- Trigger: Starts only after the build-and-push job succeeds.
- Connect: Uses SSH to securely connect to the AWS EC2 instance.
- Copy Files: Copies the latest production docker-compose.yml (the one without the chatbot) from the repository to the EC2 host.
- Execute Deployment: Runs a script on the EC2 host that:
   - Logs the Docker daemon into ECR (using the EC2's IAM Role).   
   - Pulls the new latest images from ECR (docker-compose pull).
   - Restarts all services with the new images (docker-compose up -d --force-recreate).
     
---
