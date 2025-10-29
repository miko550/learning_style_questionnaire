# Honey and Mumford Learning Styles Assessment

A modern web application for conducting the Honey and Mumford Learning Styles Questionnaire. This application allows students to take the 80-question assessment and view their learning style results, while administrators can monitor all participants and view detailed responses.

## Features

- **Student Features:**
  - User registration and authentication
  - 80-question Honey and Mumford Learning Styles Questionnaire
  - Binary response system (Agree/Disagree)
  - Personal results dashboard with visual charts
  - Learning style recommendations
  - Retake assessment option

- **Admin Features:**
  - View all student results and analytics
  - Access detailed participant responses
  - Learning style distribution charts
  - Completion rate tracking
  - Export capabilities

## Learning Styles Assessed

The questionnaire measures four learning styles (20 questions each):

1. **Activist** - Learn through active participation and hands-on experience
2. **Reflector** - Learn by observing and thinking about experiences  
3. **Theorist** - Learn through logical, systematic approaches
4. **Pragmatist** - Learn when they can see practical applications

## Technology Stack

- **Backend:** FastAPI (Python)
- **Frontend:** React (JavaScript)
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose
- **Charts:** Recharts

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/miko550/learning_style_questionnaire.git
   cd learning_style_questionnaire
   ```

2. **Start the application:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **Web App:** http://localhost:3000
   - **API Documentation:** http://localhost:8000/docs

### Default Admin Account

- **Username:** `admin`
- **Password:** `admin`

## Usage

### For Students

1. **Register:** Create a new account using the "Register" button
2. **Login:** Sign in with your credentials
3. **Take Assessment:** Complete the 80-question questionnaire
4. **View Results:** See your learning style profile with charts and recommendations

### For Administrators

1. **Login:** Use the admin credentials (admin/admin)
2. **Dashboard:** View overview statistics and charts
3. **Student Results:** See all completed assessments in a table
4. **View Answers:** Click "View answers" to see detailed participant responses

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user info

### Assessment
- `GET /questions` - Get all questions
- `POST /responses` - Submit responses
- `GET /my-result` - Get personal results

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/all-results` - Get all results
- `GET /admin/user/{user_id}/responses` - Get user's detailed responses

## Project Structure

```
learn_style/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── models.py           # Pydantic models
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json        # Node dependencies
│   └── Dockerfile          # Frontend container
├── docker-compose.yml      # Docker services
├── score.csv              # Question categorization
└── README.md              # This file
```

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## Database Schema

- **Users:** User accounts and authentication
- **Questions:** 80 questionnaire items with categories
- **Responses:** User answers to questions
- **LearningStyleResults:** Calculated scores and dominant style

## Scoring Algorithm

- Each question has a binary response: 1 (Agree) or 0 (Disagree)
- Scores are calculated by summing responses for each learning style category
- Maximum possible score per style: 20 points
- Dominant style is determined by the highest score

## Customization

### Adding Questions

1. Update `SAMPLE_QUESTIONS` in `backend/main.py`
2. Update `score.csv` with correct categorization
3. Restart the application

### Styling

- Frontend styles: `frontend/src/index.css`
- Component styles: Individual component files

## Troubleshooting

### Common Issues

1. **Port conflicts:** Ensure ports 3000 and 8000 are available
2. **Database issues:** Run `docker compose down -v` to reset
3. **Build errors:** Check Docker and Docker Compose versions

### Reset Everything

```bash
docker compose down -v
docker system prune -f
docker compose up --build
```

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.
