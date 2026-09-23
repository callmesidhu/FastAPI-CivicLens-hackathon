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
    await database.users.create_index("email", unique=True)
    await database.tickets.create_index("userEmail")

    # Seed default hackathon accounts if they do not exist
    user_account = await database.users.find_one({"email": "user@civiclens.com"})
    if not user_account:
        await database.users.insert_one({
            "email": "user@civiclens.com",
            "password": "password123",
            "name": "Citizen Reporter",
            "role": "citizen",
            "title": "Active Citizen Reporter",
            "ward": "Ward 14 (Fort Kochi)",
            "department": None
        })
        print("Seeded default citizen: user@civiclens.com / password123")

    admin_account = await database.users.find_one({"email": "admin@civiclens.com"})
    if not admin_account:
        await database.users.insert_one({
            "email": "admin@civiclens.com",
            "password": "admin123",
            "name": "Kochi Municipal Authority",
            "role": "admin",
            "title": "Municipal Sanitation Inspector",
            "ward": "Wards 1-25 (Central Zone)",
            "department": "Health & Municipal Sanitation Dept"
        })
        print("Seeded default admin: admin@civiclens.com / admin123")

    print("Connected to MongoDB and ensured indexes and default users.")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection.")
