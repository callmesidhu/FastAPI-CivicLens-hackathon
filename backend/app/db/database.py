from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    # Create indexes if they don't exist
    database = db.client[settings.MONGODB_DATABASE]
    await database.facilities.create_index([("location", "2dsphere")])
    await database.facilities.create_index([("name", "text"), ("address", "text")])
    await database.reports.create_index("idempotencyKey", unique=True, sparse=True)
    print("Connected to MongoDB and ensured indexes.")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection.")
