from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Enable CORS to allow requests from the PHP application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI!"}

@app.get("/basic-calculation/add/")
async def add(num1: int = Query(...), num2: int = Query(...)):
    return {"resultado": num1 + num2}

@app.get("/basic-calculation/subtract/")
async def subtract(num1: int = Query(...), num2: int = Query(...)):
    return {"resultado": num1 - num2}

@app.get("/basic-calculation/multiply/")
async def multiply(num1: int = Query(...), num2: int = Query(...)):
    return {"resultado": num1 * num2}

@app.get("/basic-calculation/divide/")
async def divide(num1: int = Query(...), num2: int = Query(...)):
    if num2 == 0:
        return {"error": "Division by zero is not allowed"}
    if num1 % num2 != 0:
        return {"error": "Result is not a whole number"}
    return {"resultado": num1 // num2}

@app.get("/basic-calculation/random/")
async def random_numbers():
    """
    Generate random numbers for operations that ensure whole number results.
    """
    num1 = random.randint(1, 100)
    num2 = random.randint(1, 100)
    while num2 == 0 or num1 % num2 != 0:  # Ensure num2 is not zero and num1 is divisible by num2
        num2 = random.randint(1, 100)
    return {"num1": num1, "num2": num2}
