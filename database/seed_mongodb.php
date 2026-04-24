<?php
require_once __DIR__ . '/../config/db.php';

echo "🌱 Starting MongoDB Seeding...\n";

try {
    $db = getDBConnection();

    // 1. Clear existing collections
    $db->drop();
    echo "✅ Database dropped (clean start)\n";

    // 2. Seed Departments
    $departmentsCol = $db->departments;
    $deptResult = $departmentsCol->insertMany([
        ['department_name' => 'Computer Science', 'description' => 'CS department handling tech events', 'created_at' => new MongoDB\BSON\UTCDateTime()],
        ['department_name' => 'Management Studies', 'description' => 'Business and management department', 'created_at' => new MongoDB\BSON\UTCDateTime()],
        ['department_name' => 'Arts & Design', 'description' => 'Creative arts and design department', 'created_at' => new MongoDB\BSON\UTCDateTime()],
        ['department_name' => 'Civil Engineering', 'description' => 'Infrastructure and engineering department', 'created_at' => new MongoDB\BSON\UTCDateTime()],
        ['department_name' => 'Electronics', 'description' => 'Electronics and communication department', 'created_at' => new MongoDB\BSON\UTCDateTime()]
    ]);

    $deptIds = $deptResult->getInsertedIds();
    echo "✅ Seeded " . count($deptIds) . " departments\n";

    // 3. Seed Users
    $usersCol = $db->users;
    $hash = password_hash('password', PASSWORD_DEFAULT);

    $usersData = [
        ['name' => 'Super Admin',   'email' => 'admin@ems.com',     'username' => 'admin',  'password' => $hash, 'role' => 'admin',       'department_id' => null],
        ['name' => 'John Staff',    'email' => 'staff@ems.com',     'username' => 'staff1', 'password' => $hash, 'role' => 'staff',       'department_id' => $deptIds[0]],
        ['name' => 'Jane Staff',    'email' => 'jane@ems.com',      'username' => 'staff2', 'password' => $hash, 'role' => 'staff',       'department_id' => $deptIds[1]],
        ['name' => 'Alice Student', 'email' => 'alice@ems.com',     'username' => 'alice',  'password' => $hash, 'role' => 'student',     'department_id' => $deptIds[0]],
        ['name' => 'Bob Student',   'email' => 'bob@ems.com',       'username' => 'bob',    'password' => $hash, 'role' => 'student',     'department_id' => $deptIds[1]],
        ['name' => 'Carol Student', 'email' => 'carol@ems.com',     'username' => 'carol',  'password' => $hash, 'role' => 'student',     'department_id' => $deptIds[0]],
        ['name' => 'Dave Extern',   'email' => 'dave@external.com', 'username' => 'dave',   'password' => $hash, 'role' => 'participant', 'department_id' => null],
        ['name' => 'Eva Extern',    'email' => 'eva@external.com',  'username' => 'eva',    'password' => $hash, 'role' => 'participant', 'department_id' => null],
    ];

    foreach ($usersData as &$u) { $u['created_at'] = new MongoDB\BSON\UTCDateTime(); }
    $userResult = $usersCol->insertMany($usersData);
    $userIds = $userResult->getInsertedIds();
    echo "✅ Seeded " . count($userIds) . " users\n";

    // 4. Seed Events
    $eventsCol = $db->events;
    $eventsData = [
        [
            'event_name' => 'Tech Symposium 2026',
            'description' => 'Annual technology conference',
            'event_date' => new MongoDB\BSON\UTCDateTime(strtotime('2026-03-15') * 1000),
            'location' => 'Main Auditorium',
            'department_id' => $deptIds[0],
            'staff_id' => $userIds[1],
            'capacity' => 200,
            'registration_deadline' => new MongoDB\BSON\UTCDateTime(strtotime('2026-03-10') * 1000),
            'status' => 'upcoming'
        ],
        [
            'event_name' => 'Business Case Study',
            'description' => 'MBA case study competition',
            'event_date' => new MongoDB\BSON\UTCDateTime(strtotime('2026-03-20') * 1000),
            'location' => 'Seminar Hall B',
            'department_id' => $deptIds[1],
            'staff_id' => $userIds[2],
            'capacity' => 80,
            'registration_deadline' => new MongoDB\BSON\UTCDateTime(strtotime('2026-03-18') * 1000),
            'status' => 'upcoming'
        ],
        [
            'event_name' => 'Design Hackathon',
            'description' => '24-hour design sprint competition',
            'event_date' => new MongoDB\BSON\UTCDateTime(strtotime('2026-04-05') * 1000),
            'location' => 'Innovation Lab',
            'department_id' => $deptIds[2],
            'staff_id' => $userIds[1],
            'capacity' => 60,
            'registration_deadline' => new MongoDB\BSON\UTCDateTime(strtotime('2026-04-01') * 1000),
            'status' => 'upcoming'
        ],
        [
            'event_name' => 'Civil Expo 2026',
            'description' => 'Infrastructure project exhibition',
            'event_date' => new MongoDB\BSON\UTCDateTime(strtotime('2026-04-12') * 1000),
            'location' => 'Exhibition Ground',
            'department_id' => $deptIds[3],
            'staff_id' => $userIds[2],
            'capacity' => 150,
            'registration_deadline' => new MongoDB\BSON\UTCDateTime(strtotime('2026-04-08') * 1000),
            'status' => 'upcoming'
        ],
        [
            'event_name' => 'Electronics Workshop',
            'description' => 'IoT and embedded systems workshop',
            'event_date' => new MongoDB\BSON\UTCDateTime(strtotime('2026-02-28') * 1000),
            'location' => 'Lab 201',
            'department_id' => $deptIds[4],
            'staff_id' => $userIds[1],
            'capacity' => 40,
            'registration_deadline' => new MongoDB\BSON\UTCDateTime(strtotime('2026-02-25') * 1000),
            'status' => 'ongoing'
        ],
        [
            'event_name' => 'AI & ML Summit',
            'description' => 'Artificial Intelligence summit',
            'event_date' => new MongoDB\BSON\UTCDateTime(strtotime('2026-01-20') * 1000),
            'location' => 'Conference Hall',
            'department_id' => $deptIds[0],
            'staff_id' => $userIds[1],
            'capacity' => 120,
            'registration_deadline' => new MongoDB\BSON\UTCDateTime(strtotime('2026-01-15') * 1000),
            'status' => 'completed'
        ]
    ];

    foreach ($eventsData as &$e) { $e['created_at'] = new MongoDB\BSON\UTCDateTime(); }
    $eventResult = $eventsCol->insertMany($eventsData);
    $eventIds = $eventResult->getInsertedIds();
    echo "✅ Seeded " . count($eventIds) . " events\n";

    // 5. Seed Registrations
    $regsCol = $db->event_registrations;
    $regsData = [
        ['user_id' => $userIds[3], 'event_id' => $eventIds[0], 'registration_status' => 'confirmed', 'attendance_status' => 'not_marked'],
        ['user_id' => $userIds[4], 'event_id' => $eventIds[0], 'registration_status' => 'confirmed', 'attendance_status' => 'not_marked'],
        ['user_id' => $userIds[3], 'event_id' => $eventIds[2], 'registration_status' => 'confirmed', 'attendance_status' => 'not_marked'],
        ['user_id' => $userIds[5], 'event_id' => $eventIds[1], 'registration_status' => 'confirmed', 'attendance_status' => 'not_marked'],
        ['user_id' => $userIds[6], 'event_id' => $eventIds[0], 'registration_status' => 'confirmed', 'attendance_status' => 'not_marked'],
        ['user_id' => $userIds[7], 'event_id' => $eventIds[1], 'registration_status' => 'confirmed', 'attendance_status' => 'not_marked'],
        ['user_id' => $userIds[3], 'event_id' => $eventIds[5], 'registration_status' => 'confirmed', 'attendance_status' => 'present'],
        ['user_id' => $userIds[4], 'event_id' => $eventIds[5], 'registration_status' => 'confirmed', 'attendance_status' => 'absent'],
        ['user_id' => $userIds[5], 'event_id' => $eventIds[5], 'registration_status' => 'confirmed', 'attendance_status' => 'present'],
        ['user_id' => $userIds[6], 'event_id' => $eventIds[5], 'registration_status' => 'confirmed', 'attendance_status' => 'present'],
    ];

    foreach ($regsData as &$r) { $r['created_at'] = new MongoDB\BSON\UTCDateTime(); }
    $regsCol->insertMany($regsData);
    echo "✅ Seeded 10 registrations\n";

    echo "🎉 Seeding Completed Successfully!\n";

} catch (Exception $e) {
    echo "❌ Error during seeding: " . $e->getMessage() . "\n";
}
