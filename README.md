[Project Name]: Full-Stack E-commerce Microservices Platform 🛍️
This repository contains the source code for a comprehensive, full-stack e-commerce application. The platform is built using a modern microservices architecture, featuring separate services for product management, user authentication, and an AI-powered chatbot.

The stack includes a Go (Echo) backend, a React frontend, a Python AI service, and a complete CI/CD pipeline deploying to AWS using Docker and GitHub Actions.

📋 Table of Contents
High-Level Architecture











🏛️ High-Level Architecture
The application is decomposed into distinct microservices to ensure scalability, separation of concerns, and independent deployment.

frontend-client (React): The main user-facing application. It provides the UI for browsing products, managing the cart, handling payments, and interacting with all backend services.

products-service (Go): A robust backend service built with the Echo framework. It handles all e-commerce logic, including:

Product catalog management (CRUD)

Product categories and relations

Shopping cart operations

Uses GORM for ORM and database interaction.

auth-service (Go): A dedicated service for user identity. It manages:

Local user registration and login (email/password)

Server-side Google OAuth2 flow

JWT generation and token management.

chatbot-service (Python): An independent service that provides AI assistance to users.

Includes its own frontend interface (or is integrated into the main React app).

A Python backend service queries an LLM (e.g., ChatGPT).

Filters LLM requests to stay on-topic (store inventory, clothing, etc.).

✨ Core Features
Backend: Products & Cart (Go)
RESTful API: A clean API built with the Echo framework.

Full CRUD Functionality: The products-service provides complete Create, Read, Update, and Delete operations for products.

Data Modeling: Uses GORM to map Go structs to database tables for Products, Categories, and Carts.

Relational Data: Manages the relationship between Products and Categories (e.g., one-to-many or many-to-many).

Cart Management: Dedicated models and API endpoints for adding/removing items from a user's cart.

Frontend (React)
Component-Based UI: Built with two primary components:

Products: Fetches and displays product data from the products-service.

Payments: A form component that submits payment and order data to the backend.

Client-Side Routing: Uses React Router to provide a seamless multi-page experience, including a dedicated view for the shopping cart.

Modern State Management: Leverages React Hooks (e.g., useState, useContext, useEffect) to manage and propagate state (like cart contents and user data) across all components.

Authentication (OAuth2 & Local)
Local Registration: Standard email and password registration handled by the auth-service.

Local Login: Secure session/token-based login for registered users.

Google OAuth2 (Server-Side): A secure, server-managed OAuth2 flow.

The auth-service acts as the OAuth2 client.

User data and provider tokens are stored securely in the server's database.

The server generates its own custom JWT, which is sent to the React client for session management.

Security: This flow explicitly avoids storing provider tokens or secrets on the client side.

AI Chatbot Service (Python)
Separate Service: A complete Python application for handling user chat.

Frontend Interface: A dedicated UI for users to interact with the bot.

LLM Integration: The Python backend service connects to ChatGPT to generate responses.

Domain Filtering: Intelligently filters user queries to ensure the LLM only responds to questions related to the e-commerce store, its products (clothing), and general store information.

Natural Conversation: Includes a predefined list of 5 different conversation openers and closers to feel more natural.

Note: A local Ollama model was tested during development, but the production service is designed to target the ChatGPT API.

🛠️ Technology Stack
🔑 Key System Design: Secure Auth Flow
A critical requirement of this project is the secure, server-side handling of OAuth2 authentication.

Rule: Direct client-side authentication with a provider (e.g., using a package like react-google-login that communicates directly with Google) is strictly forbidden. All communication must be proxied through the auth-service.

Correct Authentication Flow:

React Client: User clicks "Login with Google."

Request: React client sends a request to the auth-service (e.g., /api/auth/google/login).

auth-service (Server): Generates a state token and redirects the user's browser to the Google OAuth consent screen.

Google: User authenticates and grants permission.

Redirect: Google redirects the user back to the auth-service callback URI (e.g., /api/auth/google/callback) with an authorization code.

auth-service (Server):

Verifies the state token.

Exchanges the authorization code with Google for an access token and user profile.

Saves/updates the user info and provider token in its own database.

Generates a new, internal JWT (or session) for the user.

React Client: The server sends this internal JWT back to the React client, which stores it (e.g., in localStorage or a cookie) to authenticate future API requests.

🚀 CI/CD Pipeline
The project is configured for Continuous Integration and Continuous Deployment using GitHub Actions and AWS.

Trigger: A push or merge to the main branch initiates the GitHub Actions workflow.

Build:

The workflow builds the Go applications (compiling binaries).

It builds the React application (static assets).

It prepares the Python service.

Dockerize: A separate Docker image is built for each service (frontend, products-service, auth-service, chatbot-service).

Push: The newly built Docker images are tagged and pushed to a container registry (e.g., AWS ECR).

Notify: Upon a successful build, a notification is sent via email.

Deploy:

The workflow triggers a deployment on AWS.

This instructs the AWS instances (e.g., ECS tasks, EC2 instances) to pull the new Docker images from ECR and restart the containers, completing the deployment.

⚙️ Setup and Installation
[TODO]

Detailed instructions on setting up the local development environment will be added here. This will include:

Cloning the repository

Setting up environment variables (.env files)

Running database migrations

Using docker-compose to launch all services locally

📄 License
This project is licensed under the MIT License. See the file for details.
