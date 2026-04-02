/*
* Enhanced Gym Management System Backend Server
* This file provides APIs for member management, classes, inquiries, and attendance tracking
* Uses Express.js to create a REST API with attendance functionality
*/

// server.js
// Import required modules
const express = require('express');
const cors = require('cors');

// Create an Express application
const app = express();
const PORT = 3001; // The port the server will run on

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
// Enable JSON parsing for request bodies
app.use(express.json());

// --- In-Memory Database ---
let members = [
    { id: 1, name: 'Sarvesh Joshi', email: 'sarvesh@example.com', membership: 'Premium', joinDate: '2025-01-15' },
    { id: 2, name: 'Pinak Adnure', email: 'pinak@example.com', membership: 'Basic', joinDate: '2024-02-20' },
    { id: 3, name: 'Abhijay Tendolkar', email: 'abhijay@example.com', membership: 'VIP', joinDate: '2023-03-10' },
    { id: 4, name: 'Saksham Bhosale', email: 'saksham@example.com', membership: 'VIP', joinDate: '2025-03-10' },
    { id: 5, name: 'Rahul Sharma', email: 'rahul@example.com', membership: 'Basic', joinDate: '2024-01-10' },
    { id: 6, name: 'Sneha Patil', email: 'sneha@example.com', membership: 'Premium', joinDate: '2024-02-15' },
    { id: 7, name: 'Amit Kulkarni', email: 'amit@example.com', membership: 'VIP', joinDate: '2024-03-20' },
    { id: 8, name: 'Priya Patel', email: 'priya@example.com', membership: 'Basic', joinDate: '2024-04-25' }
];

let memberIdCounter = members.length + 1;

const classes = [
    { id: 1, name: 'Yoga Flow', trainer: 'Neil Salvi', schedule: 'Mon, Wed, Fri at 9:00 AM', capacity: 20 },
    { id: 2, name: 'HIIT Blast', trainer: 'Nitin Kapoor', schedule: 'Tue, Thu at 6:00 PM', capacity: 15 },
    { id: 3, name: 'Power Lifting', trainer: 'Mukesh Ambani', schedule: 'Mon, Fri at 7:00 PM', capacity: 10 },
    { id: 4, name: 'Zumba Dance', trainer: 'Prakash Kaur', schedule: 'Sat at 7:00 PM', capacity: 50 }
];

const inquiries = [
    { id: 1, name: 'Ram Shetty', email: 'ram@example.com', message: 'What are your opening hours on week Ends?', receivedAt: new Date() },
    { id: 2, name: 'Anvi Reddy', email: 'anvi@example.com', message: 'What are your opening hours for Classes on week Days?', receivedAt: new Date() },
    { id: 3, name: 'Nikhil Gupta', email: 'nikhil@example.com', message: 'What is the price of 3 months Package?', receivedAt: new Date() }
];

// --- NEW: Attendance Management ---
// In-memory attendance storage: { date: { memberId: status } }
let attendance = {};

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// --- API Endpoints ---

// --- Members API ---
// GET /api/members - Fetches all members
app.get('/api/members', (req, res) => {
    console.log('GET /api/members - Responding with all members');
    res.json(members);
});

// POST /api/members - Adds a new member
app.post('/api/members', (req, res) => {
    const { name, email, membership } = req.body;
    
    // Basic validation
    if (!name || !email || !membership) {
        return res.status(400).json({ error: 'Name, email, and membership are required.' });
    }

    const newMember = {
        id: memberIdCounter++,
        name,
        email,
        membership,
        joinDate: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
    };

    members.push(newMember);
    console.log('POST /api/members - Added new member:', newMember);
    res.status(201).json(newMember); // 201 Created
});

// DELETE /api/members/:id - Deletes a member by ID
app.delete('/api/members/:id', (req, res) => {
    const memberId = parseInt(req.params.id, 10);
    const initialLength = members.length;
    members = members.filter(m => m.id !== memberId);

    if (members.length < initialLength) {
        console.log(`DELETE /api/members/${memberId} - Member deleted successfully`);
        res.status(204).send(); // 204 No Content
    } else {
        console.log(`DELETE /api/members/${memberId} - Member not found`);
        res.status(404).json({ error: 'Member not found' });
    }
});

// --- Classes API ---
// GET /api/classes - Fetches all classes
app.get('/api/classes', (req, res) => {
    console.log('GET /api/classes - Responding with all classes');
    res.json(classes);
});

// --- Inquiries API ---
// GET /api/inquiries - Fetches all inquiries
app.get('/api/inquiries', (req, res) => {
    console.log('GET /api/inquiries - Responding with all inquiries');
    res.json(inquiries);
});

// --- NEW: Attendance API ---

// GET /api/attendance - Get attendance for today or specific date
app.get('/api/attendance', (req, res) => {
    const date = req.query.date || getTodayDate();
    const todayAttendance = attendance[date] || {};
    
    // Create attendance record with member details
    const attendanceWithMembers = members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        membership: member.membership,
        status: todayAttendance[member.id] || 'Absent',
        date: date
    }));

    console.log(`GET /api/attendance - Responding with attendance for ${date}`);
    res.json({
        date: date,
        attendance: attendanceWithMembers
    });
});

// POST /api/attendance/mark - Mark attendance for a member
app.post('/api/attendance/mark', (req, res) => {
    const { memberId, status = 'Present', date } = req.body;
    const attendanceDate = date || getTodayDate();
    
    // Validate member exists
    const member = members.find(m => m.id === parseInt(memberId));
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    // Initialize attendance for the date if it doesn't exist
    if (!attendance[attendanceDate]) {
        attendance[attendanceDate] = {};
    }

    // Mark attendance
    attendance[attendanceDate][memberId] = status;
    
    console.log(`POST /api/attendance/mark - Marked ${member.name} as ${status} for ${attendanceDate}`);
    res.json({
        message: `${member.name} marked as ${status}`,
        memberId: memberId,
        memberName: member.name,
        status: status,
        date: attendanceDate
    });
});

// GET /api/attendance/summary - Get attendance summary/statistics
app.get('/api/attendance/summary', (req, res) => {
    const date = req.query.date || getTodayDate();
    const todayAttendance = attendance[date] || {};
    
    const totalMembers = members.length;
    const presentCount = Object.values(todayAttendance).filter(status => status === 'Present').length;
    const absentCount = totalMembers - presentCount;
    const attendancePercentage = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;

    const summary = {
        date: date,
        totalMembers: totalMembers,
        present: presentCount,
        absent: absentCount,
        attendancePercentage: attendancePercentage
    };

    console.log(`GET /api/attendance/summary - Responding with summary for ${date}`);
    res.json(summary);
});

// GET /api/attendance/history - Get attendance history for multiple dates
app.get('/api/attendance/history', (req, res) => {
    const { startDate, endDate, memberId } = req.query;
    
    let history = [];
    
    if (memberId) {
        // Get history for specific member
        const member = members.find(m => m.id === parseInt(memberId));
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        for (const [date, dateAttendance] of Object.entries(attendance)) {
            if (dateAttendance[memberId]) {
                history.push({
                    date: date,
                    memberId: parseInt(memberId),
                    memberName: member.name,
                    status: dateAttendance[memberId]
                });
            }
        }
    } else {
        // Get overall attendance history
        for (const [date, dateAttendance] of Object.entries(attendance)) {
            const presentCount = Object.values(dateAttendance).filter(status => status === 'Present').length;
            const totalMembers = members.length;
            const attendancePercentage = totalMembers > 0 ? Math.round((presentCount / totalMembers) * 100) : 0;
            
            history.push({
                date: date,
                present: presentCount,
                total: totalMembers,
                attendancePercentage: attendancePercentage
            });
        }
    }

    console.log('GET /api/attendance/history - Responding with attendance history');
    res.json(history);
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Enhanced GymPro backend with attendance tracking is ready!');
    
    // Initialize some sample attendance data for demonstration
    const today = getTodayDate();
    attendance[today] = {
        1: 'Present',
        2: 'Present', 
        3: 'Absent',
        4: 'Present',
        5: 'Present',
        6: 'Absent',
        7: 'Present',
        8: 'Present'
    };
    
    console.log(`Sample attendance data initialized for ${today}`);
});