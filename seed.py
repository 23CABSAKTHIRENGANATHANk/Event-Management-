import bcrypt
from datetime import datetime, timedelta
from database import get_db
from bson import ObjectId

db = get_db()

def seed_data():
    # Clear existing
    db.departments.delete_many({})
    db.users.delete_many({})
    db.events.delete_many({})
    db.event_registrations.delete_many({})

    print("Seeding Departments...")
    depts = [
        {"_id": ObjectId(), "department_name": "Computer Science", "description": "AI, Web, and Software Engineering"},
        {"_id": ObjectId(), "department_name": "Mechanical Engineering", "description": "Automobiles and Robotics"},
        {"_id": ObjectId(), "department_name": "Business Admin", "description": "Management and Marketing"},
        {"_id": ObjectId(), "department_name": "Electrical Engineering", "description": "Power Systems and Electronics"},
        {"_id": ObjectId(), "department_name": "Sports & Arts", "description": "Extra-curricular activities"}
    ]
    db.departments.insert_many(depts)

    print("Seeding Users...")
    pw = bcrypt.hashpw("password".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    users = [
        # Admins
        {"_id": ObjectId(), "name": "System Administrator", "email": "admin@ems.com", "username": "admin", "password": pw, "role": "admin", "department_id": None},
        {"_id": ObjectId(), "name": "Sakthi Admin", "email": "sakthi@ems.com", "username": "sakthi", "password": pw, "role": "admin", "department_id": None},
        
        # Staff
        {"_id": ObjectId(), "name": "Prof. Alan Turing", "email": "alan@ems.com", "username": "alan", "password": pw, "role": "staff", "department_id": depts[0]["_id"]},
        {"_id": ObjectId(), "name": "Dr. Sarah Connor", "email": "sarah@ems.com", "username": "sarah", "password": pw, "role": "staff", "department_id": depts[1]["_id"]},
        {"_id": ObjectId(), "name": "Mr. Jordan Belfort", "email": "jordan@ems.com", "username": "jordan", "password": pw, "role": "staff", "department_id": depts[2]["_id"]},
        {"_id": ObjectId(), "name": "Dr. Nikola Tesla", "email": "tesla@ems.com", "username": "tesla", "password": pw, "role": "staff", "department_id": depts[3]["_id"]},
        {"_id": ObjectId(), "name": "Coach Phil Jackson", "email": "phil@ems.com", "username": "phil", "password": pw, "role": "staff", "department_id": depts[4]["_id"]},
    ]

    # Generating 15 Students
    student_names = [
        "John Doe", "Jane Smith", "Michael Ross", "Rachel Zane", "Harvey Specter",
        "Donna Paulsen", "Louis Litt", "Peter Parker", "Tony Stark", "Bruce Wayne",
        "Clark Kent", "Diana Prince", "Barry Allen", "Wanda Maximoff", "Natasha Romanoff"
    ]
    
    for i, name in enumerate(student_names):
        uname = name.lower().replace(" ", "")
        dept = depts[i % len(depts)]
        users.append({
            "_id": ObjectId(),
            "name": name,
            "email": f"{uname}@ems.com",
            "username": uname,
            "password": pw,
            "role": "student",
            "department_id": dept["_id"],
            "created_at": datetime.utcnow() - timedelta(days=i*5)
        })

    db.users.insert_many(users)

    print("Seeding Events...")
    now = datetime.utcnow()
    events = [
        {"_id": ObjectId(), "event_name": "Global AI Summit", "description": "Future of Artificial Intelligence", "event_date": now + timedelta(days=5), "location": "Main Hall", "capacity": 300, "status": "upcoming", "department_id": depts[0]["_id"], "staff_id": users[2]["_id"]},
        {"_id": ObjectId(), "event_name": "Robo-Wars 2026", "description": "Combat robotics competition", "event_date": now + timedelta(days=12), "location": "Workshop B", "capacity": 100, "status": "upcoming", "department_id": depts[1]["_id"], "staff_id": users[3]["_id"]},
        {"_id": ObjectId(), "event_name": "Marketing Masterclass", "description": "Sales strategies for 2026", "event_date": now + timedelta(days=20), "location": "Seminar Room 1", "capacity": 150, "status": "upcoming", "department_id": depts[2]["_id"], "staff_id": users[4]["_id"]},
        {"_id": ObjectId(), "event_name": "Energy Conservation Workshop", "description": "Sustainable power systems", "event_date": now - timedelta(days=1), "location": "Lab 404", "capacity": 80, "status": "ongoing", "department_id": depts[3]["_id"], "staff_id": users[5]["_id"]},
        {"_id": ObjectId(), "event_name": "Annual Sports Meet", "description": "Athletics and Indoor games", "event_date": now - timedelta(days=15), "location": "University Stadium", "capacity": 500, "status": "completed", "department_id": depts[4]["_id"], "staff_id": users[6]["_id"]},
        {"_id": ObjectId(), "event_name": "Cyber Security Bootcamp", "description": "Ethical hacking workshop", "event_date": now - timedelta(days=30), "location": "CS Lab 1", "capacity": 50, "status": "completed", "department_id": depts[0]["_id"], "staff_id": users[2]["_id"]},
        {"_id": ObjectId(), "event_name": "F1 Design Challenge", "description": "Aero-design for students", "event_date": now - timedelta(days=45), "location": "Auditorium", "capacity": 120, "status": "completed", "department_id": depts[1]["_id"], "staff_id": users[3]["_id"]},
    ]
    db.events.insert_many(events)

    print("Seeding Registrations...")
    regs = []
    # Mix of registrations for various events
    students = [u for u in users if u["role"] == "student"]
    
    for i, s in enumerate(students):
        # Every student registers for at least 2 events
        ev1 = events[i % len(events)]
        ev2 = events[(i + 2) % len(events)]
        
        regs.append({
            "user_id": s["_id"],
            "event_id": ev1["_id"],
            "registration_status": "confirmed",
            "attendance_status": "present" if ev1["status"] == "completed" else "not_marked",
            "created_at": now - timedelta(days=i + 5)
        })
        
        regs.append({
            "user_id": s["_id"],
            "event_id": ev2["_id"],
            "registration_status": "confirmed",
            "attendance_status": "absent" if ev2["status"] == "completed" and i % 3 == 0 else ("present" if ev2["status"] == "completed" else "not_marked"),
            "created_at": now - timedelta(days=i + 2)
        })

    db.event_registrations.insert_many(regs)
    print("Seeding complete! 🚀")

if __name__ == "__main__":
    seed_data()
