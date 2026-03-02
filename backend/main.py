from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load variables from the .env file
load_dotenv()

app = FastAPI()

# Allow your React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:8080",     # Added your actual port!
        "http://127.0.0.1:8080"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to your Supabase database
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

@app.get("/")
def read_root():
    return {"status": "Backend is running and connected!"}

@app.get("/api/doctors")
def get_doctors():
    # Fetch all doctors from your new Supabase table
    response = supabase.table("doctors").select("*").execute()
    return {"doctors": response.data}

@app.get("/api/doctors/{doctor_id}")
def get_doctor(doctor_id: str):
    # Fetch a single doctor by their ID
    response = supabase.table("doctors").select("*").eq("id", doctor_id).execute()
    
    # Check if the doctor exists
    if len(response.data) == 0:
        return {"error": "Doctor not found"}
        
    return {"doctor": response.data[0]}

# Define the shape of the data we expect from React
class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_email: str
    appointment_date: str
    appointment_time: str
    appointment_type: str

@app.post("/api/appointments")
def create_appointment(appointment: AppointmentCreate):
    # Package the data for Supabase
    data = {
        "doctor_id": appointment.doctor_id,
        "patient_email": appointment.patient_email,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "appointment_type": appointment.appointment_type,
        "status": "upcoming"
    }
    
    # Insert into the database
    response = supabase.table("appointments").insert(data).execute()
    return {"message": "Success!", "appointment": response.data[0]}

@app.get("/api/appointments/{patient_email}")
def get_user_appointments(patient_email: str):
    # Fetch appointments AND join the doctor's details in one single query!
    response = supabase.table("appointments") \
        .select("*, doctors(*)") \
        .eq("patient_email", patient_email) \
        .order("appointment_date", desc=True) \
        .execute()
        
    return {"appointments": response.data}

@app.patch("/api/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str):
    # Update the status to 'cancelled' in Supabase
    response = supabase.table("appointments").update({"status": "cancelled"}).eq("id", appointment_id).execute()
    
    if len(response.data) == 0:
        return {"error": "Appointment not found"}
        
    return {"message": "Appointment cancelled successfully", "appointment": response.data[0]}

@app.get("/api/articles")
def get_articles():
    # Fetch all articles for the home page list
    response = supabase.table("articles").select("*").execute()
    return {"articles": response.data}

@app.get("/api/articles/{article_id}")
def get_article_detail(article_id: str):
    # Fetch a single article when a user clicks "Read More"
    response = supabase.table("articles").select("*").eq("id", article_id).single().execute()
    return response.data