# G24SEC (Legacy Version)
> **⚠️ Legacy Code**  
> This is the very old codebase (pre-current version) for www.g24sec.space.  
> It is provided here for historical/reference purposes and may not receive updates.

---

## 🚀 Overview

A Node.js/Express web application powering g24sec.space.  
Handles user authentication (Google & GitHub), media uploads, news feeds, AI integrations, and more.

---

## 📦 Features

- OAuth login with **Google** & **GitHub**  
- Session management & JWT-based APIs  
- Image uploads & transformations via **ImageKit**  
- News aggregation via **NewsAPI**  
- Email/SMS notifications via **Brevo**  
- AI integrations via **Together API**

---

## 📋 Prerequisites

- **Node.js** (>= 18.x) & **npm**  
- **PostgreSQL**  
- OAuth apps registered for:
  - **Google** (CLIENT_ID & CLIENT_SECRET)  
  - **GitHub** (CLIENT_ID & CLIENT_SECRET)  
- Accounts / API keys for:
  - **Brevo** (SMTP & API)  
  - **ImageKit**  
  - **NewsAPI**  
  - **Together API**

---

## ⚙️ Setup & Deployment

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Kyle6012/g24sec-space-legacy.git
   cd g24sec-space-legacy
   ```
2. **Install dependecies**
   ```bash
   npm install
   ```
3. **Configure Environment**
   
4. **Start server**
   ```bash
   npm start
   ```
5. **Access**
   Open your browser at localhost:3000 (or your configured BASE_URL).

## ☁️ Deployment tips
   - Any Node-capable host (Heroku, Vercel, DigitalOcean, etc.) will work.

   - Push to your Git provider, connect the repo in your host dashboard, and mirror the same ENV variables in the host’s settings.

   - On deploy, the host will run npm install & npm start automatically.


## 🤝 Contributing

1. Fork & clone

2. Create a feature branch

3. Commit & push

4. Open a pull request

Please note this is legacy code; contributions may not be merged into the current mainline.

## 🔒 Security

- Do not commit your `.env` or any secret keys to GitHub.

- Rotate credentials regularly.

- Use strong, unique values for `SESSION_SECRET` & `JWT_SECRET`.

## 📑 License
This project is released under the Apache-2.0 license.

