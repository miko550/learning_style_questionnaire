from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from database import get_db, create_tables, User, Question, Response, LearningStyleResult
from models import (
    UserCreate,
    UserLogin,
    User as UserModel,
    Question as QuestionModel,
    ResponseCreate,
    Response as ResponseModel,
    LearningStyleResult as LearningStyleResultModel,
    ResponseWithQuestion,
    Token,
)
from auth import authenticate_user, create_access_token, get_current_user, get_current_admin_user, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES

app = FastAPI(title="Learning Style Questionnaire API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

# Honey and Mumford Learning Styles Questionnaire (80 questions)
SAMPLE_QUESTIONS = [
    {"text": "I have strong beliefs about what is right and wrong, good and bad.", "category": "theorist"},
    {"text": "I often act without considering the possible consequences.", "category": "activist"},
    {"text": "I tend to solve problems using a step-by-step approach.", "category": "reflector"},
    {"text": "I believe that formal procedures and policies restrict people.", "category": "pragmatist"},
    {"text": "I have a reputation for saying what I think, simply and directly.", "category": "activist"},
    {"text": "I often find that actions based on feelings are as sound as those based on careful thought and analysis.", "category": "pragmatist"},
    {"text": "I like the sort of work where I have time for thorough preparation and implementation.", "category": "reflector"},
    {"text": "I regularly question people about their basic assumptions.", "category": "theorist"},
    {"text": "What matters most is whether something works in practice.", "category": "pragmatist"},
    {"text": "I actively seek out new experiences.", "category": "activist"},
    {"text": "When I hear about a new idea or approach I immediately start working out how to apply it in practice.", "category": "pragmatist"},
    {"text": "I am keen on self-discipline such as watching my diet, taking regular exercise, sticking to a fixed routine etc.", "category": "reflector"},
    {"text": "I take pride in doing a thorough job.", "category": "reflector"},
    {"text": "I get on best with logical, analytical people and less well with spontaneous, \"irrational\" people.", "category": "theorist"},
    {"text": "I take care over the interpretation of data available to me and avoid jumping to conclusions.", "category": "reflector"},
    {"text": "I like to reach a decision carefully after weighing up many alternatives.", "category": "reflector"},
    {"text": "I'm attracted more to novel, unusual ideas than to practical ones.", "category": "theorist"},
    {"text": "I don't like disorganised things and prefer to fit things into a coherent pattern.", "category": "theorist"},
    {"text": "I accept and stick to laid down procedures and policies so long as I regard them as an efficient way of getting the job done.", "category": "pragmatist"},
    {"text": "I like to relate my actions to a general principle.", "category": "theorist"},
    {"text": "In discussions I like to get straight to the point.", "category": "activist"},
    {"text": "I tend to have distant, rather formal relationships with people at work.", "category": "theorist"},
    {"text": "I thrive on the challenge of tackling something new and different.", "category": "activist"},
    {"text": "I enjoy fun-loving, spontaneous people.", "category": "activist"},
    {"text": "I pay meticulous attention to detail before coming to a conclusion.", "category": "reflector"},
    {"text": "I find it difficult to produce ideas on impulse.", "category": "reflector"},
    {"text": "I believe in coming to the point immediately.", "category": "activist"},
    {"text": "I am careful not to jump to conclusions too quickly.", "category": "reflector"},
    {"text": "I prefer to have as many sources of information as possible -the more data to mull over the better.", "category": "reflector"},
    {"text": "Flippant people who don't take things seriously enough usually irritate me.", "category": "theorist"},
    {"text": "I listen to other people's point of view before putting my own forward.", "category": "reflector"},
    {"text": "I tend to be open about how I'm feeling.", "category": "activist"},
    {"text": "In discussions I enjoy watching the manoeuvrings of the other participants.", "category": "reflector"},
    {"text": "I prefer to respond to events on a spontaneous, flexible basis rather than plan things out in advance.", "category": "activist"},
    {"text": "I tend to be attracted to techniques such as network analysis, flow charts, branching programmes, contingency planning, etc.", "category": "theorist"},
    {"text": "It worries me if I have to rush out a piece of work to meet a tight deadline.", "category": "reflector"},
    {"text": "I tend to judge people's ideas on their practical merits.", "category": "pragmatist"},
    {"text": "Quiet, thoughtful people tend to make me feel uneasy.", "category": "activist"},
    {"text": "I often get irritated by people who want to rush things.", "category": "reflector"},
    {"text": "It is more important to enjoy the present moment than to think about the past or future.", "category": "activist"},
    {"text": "I think that decisions based on a thorough analysis of all the information are sounder than those based on intuition.", "category": "theorist"},
    {"text": "I tend to be a perfectionist.", "category": "reflector"},
    {"text": "In discussions I usually produce lots of spontaneous ideas.", "category": "activist"},
    {"text": "In meetings I put forward practical realistic ideas.", "category": "pragmatist"},
    {"text": "More often than not, rules are there to be broken.", "category": "activist"},
    {"text": "I prefer to stand back from a situation and consider all the perspectives.", "category": "reflector"},
    {"text": "I can often see inconsistencies and weaknesses in other people's arguments.", "category": "theorist"},
    {"text": "On balance I talk more than I listen.", "category": "activist"},
    {"text": "I can often see better, more practical ways to get things done.", "category": "pragmatist"},
    {"text": "I think written reports should be short and to the point.", "category": "activist"},
    {"text": "I believe that rational, logical thinking should win the day.", "category": "theorist"},
    {"text": "I tend to discuss specific things with people rather than engaging in social discussion.", "category": "pragmatist"},
    {"text": "I like people who approach things realistically rather than theoretically.", "category": "pragmatist"},
    {"text": "In discussions I get impatient with irrelevancies and digressions.", "category": "activist"},
    {"text": "If I have a report to write I tend to produce lots of drafts before settling on the final version.", "category": "reflector"},
    {"text": "I am keen to try things out to see if they work in practice.", "category": "pragmatist"},
    {"text": "I am keen to reach answers via a logical approach.", "category": "theorist"},
    {"text": "I enjoy being the one that talks a lot.", "category": "activist"},
    {"text": "In discussions I often find I am the realist, keeping people to the point and avoiding wild speculations.", "category": "pragmatist"},
    {"text": "I like to ponder many alternatives before making up my mind.", "category": "reflector"},
    {"text": "In discussions with people I often find I am the most dispassionate and objective.", "category": "theorist"},
    {"text": "In discussions I'm more likely to adopt a \"low profile\" than to take the lead and do most of the talking.", "category": "reflector"},
    {"text": "I like to be able to relate current actions to a longer-term bigger picture.", "category": "theorist"},
    {"text": "When things go wrong I am happy to shrug it off and \"put it down to experience\".", "category": "activist"},
    {"text": "I tend to reject wild, spontaneous ideas as being impractical.", "category": "pragmatist"},
    {"text": "It's best to think carefully before taking action.", "category": "reflector"},
    {"text": "On balance I do the listening rather than the talking.", "category": "reflector"},
    {"text": "I tend to be tough on people who find it difficult to adopt a logical approach.", "category": "theorist"},
    {"text": "Most times I believe the end justifies the means.", "category": "activist"},
    {"text": "I don't mind hurting people's feelings so long as the job gets done.", "category": "activist"},
    {"text": "I find the formality of having specific objectives and plans stifling.", "category": "activist"},
    {"text": "I'm usually one of the people who puts life into a party.", "category": "activist"},
    {"text": "I do whatever is expedient to get the job done.", "category": "pragmatist"},
    {"text": "I quickly get bored with methodical, detailed work.", "category": "activist"},
    {"text": "I am keen on exploring the basic assumptions, principles and theories underpinning things and events.", "category": "theorist"},
    {"text": "I'm always interested to find out what people think.", "category": "reflector"},
    {"text": "I like meetings to be run on methodical lines, sticking to laid down agenda, etc.", "category": "theorist"},
    {"text": "I steer clear of subjective or ambiguous topics.", "category": "theorist"},
    {"text": "I enjoy the drama and excitement of a crisis situation.", "category": "activist"},
    {"text": "People often find me insensitive to their feelings.", "category": "activist"}
]

@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    # Check if questions exist, if not create them
    if db.query(Question).count() == 0:
        for q in SAMPLE_QUESTIONS:
            question = Question(text=q["text"], category=q["category"])
            db.add(question)
        db.commit()
    
    # Create admin user if it doesn't exist
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            email="admin@example.com",
            username="admin",
            hashed_password=get_password_hash("admin"),
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
    db.close()

@app.post("/register", response_model=UserModel)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/questions", response_model=List[QuestionModel])
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return questions

@app.post("/responses", response_model=List[ResponseModel])
def submit_responses(
    responses: List[ResponseCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Delete existing responses for this user
    db.query(Response).filter(Response.user_id == current_user.id).delete()
    
    # Add new responses
    new_responses = []
    for response in responses:
        db_response = Response(
            user_id=current_user.id,
            question_id=response.question_id,
            answer=response.answer
        )
        db.add(db_response)
        new_responses.append(db_response)
    
    db.commit()
    
    # Calculate learning style scores
    calculate_learning_style(current_user.id, db)
    
    return new_responses

def calculate_learning_style(user_id: int, db: Session):
    # Get all responses for the user
    responses = db.query(Response).filter(Response.user_id == user_id).all()
    
    # Initialize scores for Honey and Mumford learning styles
    scores = {"activist": 0, "reflector": 0, "theorist": 0, "pragmatist": 0}
    
    # Calculate scores based on responses (1 = tick/agree, 0 = cross/disagree)
    for response in responses:
        question = db.query(Question).filter(Question.id == response.question_id).first()
        if question:
            # Direct binary scoring: 1 = agree (add 1 point), 0 = disagree (add 0 points)
            scores[question.category] += response.answer
    
    # Find dominant style
    dominant_style = max(scores, key=scores.get)
    
    # Check if result already exists
    existing_result = db.query(LearningStyleResult).filter(LearningStyleResult.user_id == user_id).first()
    
    if existing_result:
        # Update existing result
        existing_result.visual_score = scores["activist"]
        existing_result.auditory_score = scores["reflector"]
        existing_result.reading_score = scores["theorist"]
        existing_result.kinesthetic_score = scores["pragmatist"]
        existing_result.dominant_style = dominant_style
    else:
        # Create new result
        result = LearningStyleResult(
            user_id=user_id,
            visual_score=scores["activist"],
            auditory_score=scores["reflector"],
            reading_score=scores["theorist"],
            kinesthetic_score=scores["pragmatist"],
            dominant_style=dominant_style
        )
        db.add(result)
    
    db.commit()

@app.get("/my-result", response_model=LearningStyleResultModel)
def get_my_result(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = db.query(LearningStyleResult).filter(LearningStyleResult.user_id == current_user.id).first()
    if not result:
        raise HTTPException(status_code=404, detail="No learning style result found")
    return result

@app.get("/admin/all-results", response_model=List[LearningStyleResultModel])
def get_all_results(current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    results = db.query(LearningStyleResult).all()
    return results

@app.get("/admin/users", response_model=List[UserModel])
def get_all_users(current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@app.get("/me", response_model=UserModel)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Admin: get a specific user's raw responses with question details
@app.get("/admin/user/{user_id}/responses", response_model=List[ResponseWithQuestion])
def get_user_responses(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Response, Question)
        .join(Question, Question.id == Response.question_id)
        .filter(Response.user_id == user_id)
        .order_by(Response.question_id.asc())
        .all()
    )
    return [
        ResponseWithQuestion(
            question_id=q.id,
            question_text=q.text,
            category=q.category,
            answer=r.answer,
            created_at=r.created_at,
        )
        for (r, q) in records
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
