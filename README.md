# StoryForge: The Collaborative Story Platform

StoryForge is a full-stack web application that allows users to collaboratively write stories. One user starts a story, and the community submits and votes on the next "canon" chapter. It also features a "multiverse" mode to explore all the "paths not taken."



---

## 🚀 Core Features

* **User Authentication:** Secure registration and login using JWT and bcrypt password hashing.
* **Create Stories:** Logged-in users can start new stories by writing the first chapter.
* **Collaborative Submissions:** Any user can read a story and submit their idea for the *next* chapter.
* **Community Voting:** Users can vote on their favorite pending submissions.
* **Canonization:** The original story author has "Author Controls" to end voting, count the results, and promote the winning chapter to the official "canon."
* **The Multiverse:** Don't let good writing go to waste! Users can explore all the non-canon (losing) submissions for every chapter to see "what could have been."
* **Real-time Polling:** The story page automatically polls for updates, so users see new submissions and chapter advances without reloading.

---

## 🛠️ Tech Stack

### Frontend
* **React:** A component-based UI library.
* **React Router:** For client-side routing and navigation.
* **React Context API:** For global state management (user auth, etc.).
* **Tailwind CSS:** For a utility-first, modular, and responsive theme.

### Backend
* **Node.js:** A JavaScript runtime environment.
* **Express.js:** A minimal and flexible Node.js web application framework.
* **PostgreSQL:** A powerful, open-source object-relational database system.
* **JSON Web Tokens (JWT):** For stateless user authentication.
* **bcrypt.js:** For secure password hashing.
* **cors:** To enable cross-origin requests from the frontend.

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* [Node.js](https://nodejs.org/) (which includes `npm`)
* A running [PostgreSQL](https://www.postgresql.org/download/) database

### 1. Backend Setup

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/your-project-name.git](https://github.com/your-username/your-project-name.git)
    cd your-project-name/backend
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` folder and add your environment variables:
    ```.env
    # Your PostgreSQL connection string
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/YOUR_DB_NAME"
    
    # A long, random string for signing tokens
    JWT_SECRET="YOUR_SUPER_SECRET_RANDOM_STRING"
    ```
4.  Run the server:
    ```bash
    npm run dev
    ```
    The backend will start (by default on `http://localhost:3001`).

### 2. Frontend Setup

1.  In a **new terminal**, navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Run the React development server:
    ```bash
    npm start
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📋 API Endpoints

### Auth
* `POST /auth/register`: Creates a new user.
* `POST /auth/login`: Logs in a user and returns a JWT.

### Stories
* `GET /api/stories`: Returns a list of all stories.
* `POST /api/stories`: (Protected) Creates a new story and its first chapter.
* `GET /api/stories/:storyId/canon`: Returns the full data for a single story, including all its canon chapters and author details.
* `POST /api/stories/:storyId/advance`: (Protected) Ends voting for the last canon chapter, counts votes, and promotes the winner to canon.

### Chapters
* `POST /api/chapters`: (Protected) Submits a new, non-canon chapter.
* `GET /api/chapters/pending/:parentChapterId`: Returns all non-canon submissions for a specific parent chapter.

### Votes
* `POST /api/chapters/:chapterId/vote`: (Protected) Casts a vote for a specific chapter submission.

---

## 📜 License

This project is licensed under the MIT License.