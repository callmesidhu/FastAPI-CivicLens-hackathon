import asyncio
from datetime import datetime, timezone, timedelta
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
            "name": "Kochi Municipal Corporation & Thrikkakara Municipality",
            "ward": "Kakkanad & Greater Kochi Civic Zone",
            "departments": [
                {
                    "name": "Public Health & Sanitation Department",
                    "handles": ["toilet", "no_water", "cleanliness"]
                },
                {
                    "name": "Kerala Water Authority (KWA)",
                    "handles": ["drinking_water", "no_water", "pipe_leak"]
                },
                {
                    "name": "Municipal Engineering & Works",
                    "handles": ["broken", "infrastructure", "locked"]
                }
            ],
            "responseTimeHours": 18
        }
    ]
    
    await database.local_bodies.insert_many(local_bodies)
    print("Inserted Local Bodies.")
    
    local_body_id = str(local_bodies[0]["_id"])
    now_iso = datetime.now(timezone.utc).isoformat()
    one_day_ago = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    two_days_ago = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    three_days_ago = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    five_days_ago = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    
    # Reference Center: Jain University, Kakkanad, Kochi [76.3656069, 10.0070408]
    # Facilities structured across 4 distinct radius zones:
    # Zone 1: < 1 km (7 facilities)
    # Zone 2: 1 km - 5 km (11 facilities -> 18 total within 5 km)
    # Zone 3: 5 km - 10 km (17 facilities -> 35 total within 10 km)
    # Zone 4: 10 km - 50 km (25 facilities -> 60 total within 50 km)

    facilities = [
        # =========================================================================
        # ZONE 1: IMMEDIATE WALKABLE (Within 1 km) — 7 Facilities
        # =========================================================================
        {
            "name": "Jain University Campus - Block A Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3657, 10.0071]},
            "address": "Knowledge Park, Jain University Campus, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Jain University Ground Floor Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3654, 10.0069]},
            "address": "Ground Floor Main Corridor, Jain University, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Jain University Main Gate Security Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3662, 10.0074]},
            "address": "Main Entrance Gate, Jain University, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Nirmal Infopark Public Sanitation Unit",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3648, 10.0065]},
            "address": "Nirmal Infopark Avenue, Kakkanad",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "available",
            "condition": "locked",
            "lastUpdated": two_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Infopark Expressway Water ATM Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3642, 10.0088]},
            "address": "Infopark Expressway, Near Cognizant Gate, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kuzhikkattumoola Bus Shelter Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3682, 10.0098]},
            "address": "Kuzhikkattumoola Junction, Infopark Road, Kakkanad",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Infopark Phase 1 - Vismaya Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3619, 10.0102]},
            "address": "Opposite Vismaya Building, Infopark Phase 1, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },

        # =========================================================================
        # ZONE 2: LOCAL KAKKANAD & SMARTCITY (1 km to 5 km) — +11 Facilities (18 within 5km)
        # =========================================================================
        {
            "name": "Edachira Junction Community e-Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3605, 10.0168]},
            "address": "Edachira Junction, Infopark Main Road, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "SmartCity Kochi Central Promenade Water Fountain",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3725, 10.0035]},
            "address": "SmartCity Kochi Central Walkway, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Athani Bus Stop Drinking Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3548, 10.0041]},
            "address": "Athani Junction, Seaport-Airport Road Link, Kakkanad",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "no_water",
            "lastUpdated": two_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Chittethukara She-Toilet & Sanitation Complex",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3582, 10.0019]},
            "address": "Chittethukara, Infopark South Gate Road, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Infopark Phase 2 Jyothirmaya Water Station",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3768, 10.0112]},
            "address": "Jyothirmaya Block, Infopark Phase 2, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Brahmapuram Riverbank Public Convenience",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3790, 10.0018]},
            "address": "Near Brahmapuram Bridge, Kakkanad Link Road",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Rajagiri Valley Public Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3525, 9.9962]},
            "address": "Rajagiri Valley, Kakkanad, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kakkanad Civil Station Collectorate Public Toilets",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3425, 10.0165]},
            "address": "District Collectorate Complex, Civil Station, Kakkanad",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kakkanad Private Bus Stand Drinking Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3400, 10.0180]},
            "address": "Private Bus Terminal, Kakkanad, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "locked",
            "lastUpdated": two_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Vazhakkala Junction Community Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3312, 10.0125]},
            "address": "Vazhakkala Junction, Kakkanad Main Road",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Padamugal Drinking Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3445, 10.0085]},
            "address": "Padamugal Jn, Kakkanad, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },

        # =========================================================================
        # ZONE 3: GREATER KOCHI METRO & SUBURBS (5 km to 10 km) — +17 Facilities (35 within 10km)
        # =========================================================================
        {
            "name": "Palarivattom Metro Station Public Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3095, 10.0042]},
            "address": "Palarivattom Metro Concourse, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Palarivattom Junction KWA Water Fountain",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3075, 10.0028]},
            "address": "Palarivattom Junction, Ernakulam",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Edappally Toll Public Toilet Complex",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3125, 10.0245]},
            "address": "Edappally Toll Jn, NH 66",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "available",
            "condition": "locked",
            "lastUpdated": two_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Lulu Mall North Gate Public Water Dispenser",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3148, 10.0275]},
            "address": "Near Lulu Mall North Entrance, Edappally",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kalamassery Municipal Restroom Complex",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3215, 10.0558]},
            "address": "Kalamassery Municipality Town Hall Road",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "CUSAT University Campus Drinking Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3285, 10.0442]},
            "address": "Administrative Block, CUSAT, Kalamassery",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kalamassery Premier Junction Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3180, 10.0620]},
            "address": "Premier Junction, Kalamassery, Kochi",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "no_water",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Kaloor Stadium Metro Public Convenience",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.2995, 9.9985]},
            "address": "JLN Stadium Metro Station, Kaloor",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kaloor Private Bus Stand Drinking Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.2965, 9.9950]},
            "address": "Kaloor Bus Stand, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": three_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Thammanam Junction Community Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3120, 9.9885]},
            "address": "Thammanam Junction, Ernakulam",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Vennala High School Road Drinking Water Dispenser",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3210, 9.9915]},
            "address": "Vennala Jn, Ernakulam",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Vyttila Mobility Hub Public Sanitation Terminal",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3195, 9.9685]},
            "address": "Platform 3, Vyttila Mobility Hub, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Vyttila Hub KSRTC Concourse Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3188, 9.9678]},
            "address": "KSRTC Waiting Hall, Vyttila Hub",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Tripunithura Statue Junction Public Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3475, 9.9485]},
            "address": "Statue Junction, Tripunithura",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Hill Palace Road Drinking Water Fountain",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3585, 9.9442]},
            "address": "Near Hill Palace Museum Gate, Tripunithura",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Thrikkakara Temple East Gate Public Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3325, 10.0385]},
            "address": "Temple East Nada, Thrikkakara, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Pipeline Junction Drinking Water Station",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3185, 10.0185]},
            "address": "Pipeline Junction, Palarivattom Byepass",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },

        # =========================================================================
        # ZONE 4: METROPOLITAN KOCHI & COASTAL BELT (10 km to 50 km) — +25 Facilities (60 total)
        # =========================================================================
        {
            "name": "MG Road Metro Station Sanitation Unit",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.2845, 9.9815]},
            "address": "MG Road Metro Concourse, Ernakulam",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Marine Drive Walkway Public Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.2755, 9.9795]},
            "address": "Rainbow Bridge Promenade, Marine Drive, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "High Court Junction Public Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.2768, 9.9862]},
            "address": "Near Kerala High Court Bus Stop, Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Menaka Bus Stop KWA Water Dispenser",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.2785, 9.9745]},
            "address": "Shanmugham Road, Menaka, Kochi",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Ernakulam South Railway Station Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.2885, 9.9685]},
            "address": "Platform 1, Ernakulam Junction Railway Station",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Ernakulam North Railway Station Water ATM",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.2865, 9.9925]},
            "address": "Ernakulam Town North Railway Station",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Fort Kochi Beach Walkway Public Toilets",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.2425, 9.9645]},
            "address": "Fort Kochi Beach Promenade",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Fort Kochi Vasco Da Gama Square Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.2415, 9.9658]},
            "address": "Vasco Da Gama Square, Fort Kochi",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Mattancherry Jew Town Public Restroom",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.2585, 9.9575]},
            "address": "Synagogue Lane, Mattancherry, Kochi",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "available",
            "condition": "locked",
            "lastUpdated": two_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Aluva Railway Station Public Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3565, 10.1085]},
            "address": "Aluva Railway Station Concourse",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Aluva Manappuram Shiva Temple Water Station",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3485, 10.1145]},
            "address": "Periyar Riverbank, Aluva Manappuram",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Aluva Private Bus Stand Toilet Complex",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3545, 10.1065]},
            "address": "Private Bus Terminal, Aluva",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Angamaly KSRTC Bus Station Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3865, 10.1885]},
            "address": "KSRTC Bus Depot, Angamaly",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Angamaly Municipal Park Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3885, 10.1925]},
            "address": "Municipal Children Park, Angamaly",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Cochin International Airport Canopy Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3985, 10.1555]},
            "address": "Domestic Departure Canopy, CIAL Nedumbassery",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "CIAL Terminal Public Restroom Annex",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3975, 10.1565]},
            "address": "Arrivals Hall Annex, CIAL Nedumbassery",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Cherai Beach Tourism Public Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.1795, 10.1415]},
            "address": "Cherai Beach Road, Vypin Island",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Cherai Beach Promenade Water Point",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.1785, 10.1425]},
            "address": "North Promenade, Cherai Beach",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "no_water",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Aroor Junction NH-66 Restroom Complex",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.3055, 9.8785]},
            "address": "Aroor Toll Bridge Junction, NH 66",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Aroor Industrial Area Drinking Water Dispenser",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.3025, 9.8715]},
            "address": "Keltron Road, Aroor Industrial Belt",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Perumbavoor Private Bus Stand Toilet",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.4785, 10.1145]},
            "address": "Private Bus Stand, Perumbavoor",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "unavailable",
            "condition": "broken",
            "lastUpdated": five_days_ago,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": False
        },
        {
            "name": "Perumbavoor Municipal Park Water Station",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.4815, 10.1165]},
            "address": "Gandhi Square Park, Perumbavoor",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Muvattupuzha KSRTC Stand Restrooms",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.5785, 9.9885]},
            "address": "KSRTC Station, Muvattupuzha",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Kothamangalam Municipal Bus Stand Water Kiosk",
            "type": "drinking_water",
            "location": {"type": "Point", "coordinates": [76.6285, 10.0615]},
            "address": "Municipal Bus Stand, Kothamangalam",
            "accessibility": {"wheelchairAccessible": True},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        },
        {
            "name": "Piravom Town Public Sanitation Block",
            "type": "toilet",
            "location": {"type": "Point", "coordinates": [76.4885, 9.8715]},
            "address": "Private Bus Stand, Piravom",
            "accessibility": {"wheelchairAccessible": False},
            "availability": "available",
            "condition": "usable",
            "lastUpdated": now_iso,
            "localBodyId": local_body_id,
            "verifiedByMunicipal": True
        }
    ]
    
    insert_res = await database.facilities.insert_many(facilities)
    inserted_ids = insert_res.inserted_ids
    print(f"Inserted {len(facilities)} sample facilities across 1km, 5km, 10km, and 50km radii around Jain University, Kakkanad.")
    
    # Add sample report & ticket for a broken facility
    sample_broken_id = str(inserted_ids[5])
    sample_report = {
        "facilityId": sample_broken_id,
        "condition": "broken",
        "description": "Tap broken and water flooding in the toilet area. Urgent municipal repair required.",
        "imageUrl": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80",
        "createdAt": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
        "idempotencyKey": "SEED-REP-001",
        "ticketNumber": "TCK-KAK-7821",
        "status": "in_progress"
    }
    await database.reports.insert_one(sample_report)
    
    sample_ticket = {
        "ticketNumber": "TCK-KAK-7821",
        "facilityId": sample_broken_id,
        "facilityName": "Kuzhikkattumoola Bus Shelter Toilet",
        "condition": "broken",
        "assignedDepartment": "Municipal Engineering & Works",
        "status": "IN_PROGRESS",
        "createdAt": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
        "expectedResolutionHours": 18,
        "notes": "Field response crew dispatched from Kakkanad Ward station."
    }
    await database.tickets.insert_one(sample_ticket)
    print("Inserted sample civic report and ticket.")
    
    # Clear and insert default users
    await database.users.delete_many({})
    await database.users.insert_many([
        {
            "email": "user@civiclens.com",
            "password": "password123",
            "name": "Citizen Reporter",
            "role": "citizen",
            "title": "Active Citizen Reporter",
            "ward": "Ward 14 (Fort Kochi)",
            "department": None
        },
        {
            "email": "admin@civiclens.com",
            "password": "admin123",
            "name": "Kochi Municipal Authority",
            "role": "admin",
            "title": "Municipal Sanitation Inspector",
            "ward": "Wards 1-25 (Central Zone)",
            "department": "Health & Municipal Sanitation Dept"
        }
    ])
    print("Inserted seed users (user@civiclens.com, admin@civiclens.com).")
    
    await close_mongo_connection()
    print("Closed MongoDB connection.")

if __name__ == "__main__":
    asyncio.run(seed_database())
