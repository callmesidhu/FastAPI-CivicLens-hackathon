import asyncio
from datetime import datetime, timezone
import random
from app.db.database import connect_to_mongo, close_mongo_connection, db
from app.core.config import settings
from bson import ObjectId

async def seed_database():
    await connect_to_mongo()
    
    database = db.client[settings.MONGODB_DATABASE]
    
    # Clear existing data
    await database.facilities.delete_many({})
    await database.local_bodies.delete_many({})
    await database.reports.delete_many({})
    await database.tickets.delete_many({})
    
    print("Cleared existing data.")

    # Insert Local Bodies
    local_bodies = [
        {
            "_id": ObjectId(),
            "name": "Trivandrum Municipal Corporation",
            "ward": "Ward 12",
            "departments": [
                {
                    "name": "Public Health Department",
                    "handles": ["toilet", "no_water", "cleanliness"]
                },
                {
                    "name": "Public Works Department",
                    "handles": ["broken", "infrastructure"]
                },
                {
                    "name": "Facility Management",
                    "handles": ["locked", "access"]
                }
            ],
            "responseTimeHours": 24
        }
    ]
    
    await database.local_bodies.insert_many(local_bodies)
    print("Inserted Local Bodies.")
    
    local_body_id = str(local_bodies[0]["_id"])
    
    facilities = [
        {
            "name": "Central Public Toilet",
            "type": "toilet",
            "location": {
                "type": "Point",
                "coordinates": [76.9366, 8.5241]
            },
            "address": "MG Road, Trivandrum",
            "accessibility": {
                "wheelchairAccessible": True
            },
            "availability": "available",
            "condition": "usable",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "localBodyId": local_body_id
        },
        {
            "name": "Railway Station Drinking Water",
            "type": "drinking_water",
            "location": {
                "type": "Point",
                "coordinates": [76.9496, 8.4965]
            },
            "address": "Trivandrum Central Railway Station",
            "accessibility": {
                "wheelchairAccessible": True
            },
            "availability": "available",
            "condition": "usable",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "localBodyId": local_body_id
        },
        {
            "name": "Museum Park Toilet",
            "type": "toilet",
            "location": {
                "type": "Point",
                "coordinates": [76.9555, 8.5111]
            },
            "address": "Museum Junction, Trivandrum",
            "accessibility": {
                "wheelchairAccessible": False
            },
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": "2026-09-18T10:00:00Z",
            "localBodyId": local_body_id
        },
        {
            "name": "East Fort Bus Stand Water Point",
            "type": "drinking_water",
            "location": {
                "type": "Point",
                "coordinates": [76.9455, 8.4831]
            },
            "address": "East Fort, Trivandrum",
            "accessibility": {
                "wheelchairAccessible": True
            },
            "availability": "available",
            "condition": "usable",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "localBodyId": local_body_id
        },
        {
            "name": "Palayam Market Toilet",
            "type": "toilet",
            "location": {
                "type": "Point",
                "coordinates": [76.9431, 8.5034]
            },
            "address": "Palayam, Trivandrum",
            "accessibility": {
                "wheelchairAccessible": False
            },
            "availability": "available",
            "condition": "usable",
            "lastUpdated": "2026-09-21T10:00:00Z",
            "localBodyId": local_body_id
        }
    ]
    
    await database.facilities.insert_many(facilities)
    print(f"Inserted {len(facilities)} sample facilities.")
    
    await close_mongo_connection()
    print("Closed MongoDB connection.")

if __name__ == "__main__":
    asyncio.run(seed_database())
