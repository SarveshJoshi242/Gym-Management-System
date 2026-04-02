
// Configuration
const API_BASE = "http://localhost:3001/api";
// Global variables
let currentDate = new Date().toISOString().split('T')[0];
// --- TAB MANAGEMENT ---
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
  });
  // Remove active state from all tabs
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("tab-active");
    button.classList.add("text-slate-600", "hover:text-blue-600");
    button.classList.remove("text-blue-600");
  });
  // Show selected tab content
  document.getElementById(tabName).classList.remove("hidden");
  // Add active state to selected tab
  const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
  activeButton.classList.add("tab-active");
  activeButton.classList.remove("text-slate-600", "hover:text-blue-600");
  activeButton.classList.add("text-blue-600");
  // Load data for specific tabs
  if (tabName === 'attendance') {
    loadAttendance();
  } else if (tabName === 'overview') {
    loadOverviewStats();
  }
}
// Add click event listeners to tab buttons
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    const tabName = e.target.closest('.tab-button').dataset.tab;
    switchTab(tabName);
  });
});
// --- API FUNCTIONS ---
async function fetchMembers() {
  const response = await fetch(`${API_BASE}/members`);
  return await response.json();
}
async function fetchClasses() {
  const response = await fetch(`${API_BASE}/classes`);
  return await response.json();
}
async function fetchInquiries() {
  const response = await fetch(`${API_BASE}/inquiries`);
  return await response.json();
}
async function fetchAttendance(date = null) {
  const url = date ? `${API_BASE}/attendance?date=${date}` : `${API_BASE}/attendance`;
  const response = await fetch(url);
  return await response.json();
}
async function fetchAttendanceSummary(date = null) {
  const url = date ? `${API_BASE}/attendance/summary?date=${date}` : `${API_BASE}/attendance/summary`;
  const response = await fetch(url);
  return await response.json();
}
async function markAttendance(memberId, status = 'Present', date = null) {
  const response = await fetch(`${API_BASE}/attendance/mark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      memberId: memberId,
      status: status,
      date: date
    })
  });
  return await response.json();
}
// --- RENDER FUNCTIONS ---
async function renderMembers() {
  try {
    const members = await fetchMembers();
    const membersList = document.getElementById("members-list");
    membersList.innerHTML = members
      .map(
        (member) => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="py-3 px-4">${member.id}</td>
          <td class="py-3 px-4 font-medium">${member.name}</td>
          <td class="py-3 px-4">${member.email}</td>
          <td class="py-3 px-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold
              ${member.membership === 'VIP' ? 'bg-purple-100 text-purple-800' : 
                member.membership === 'Premium' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'}">
              ${member.membership}
            </span>
          </td>
          <td class="py-3 px-4">${member.joinDate}</td>
          <td class="py-3 px-4">
            <button
              onclick="deleteMember(${member.id})"
              class="text-red-600 hover:text-red-800 transition-colors"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching members:", error);
  }
}
async function renderAttendance(date = null) {
  try {
    const attendanceData = await fetchAttendance(date);
    const attendanceList = document.getElementById("attendance-list");
    const summary = await fetchAttendanceSummary(date);
    // Update summary stats
    document.getElementById("present-count").textContent = summary.present;
    document.getElementById("absent-count").textContent = summary.absent;
    document.getElementById("attendance-rate").textContent = `${summary.attendancePercentage}%`;
    attendanceList.innerHTML = attendanceData.attendance
      .map(
        (record) => `
        <tr class="border-b border-gray-100 hover:bg-gray-50 ${record.status === 'Present' ? 'attendance-present' : 'attendance-absent'}">
          <td class="py-3 px-4">${record.id}</td>
          <td class="py-3 px-4 font-medium">${record.name}</td>
          <td class="py-3 px-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold
              ${record.membership === 'VIP' ? 'bg-purple-100 text-purple-800' : 
                record.membership === 'Premium' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'}">
              ${record.membership}
            </span>
          </td>
          <td class="py-3 px-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold
              ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              <i class="fas ${record.status === 'Present' ? 'fa-check' : 'fa-times'} mr-1"></i>
              ${record.status}
            </span>
          </td>
          <td class="py-3 px-4">
            <button
              onclick="toggleAttendance(${record.id}, '${record.status === 'Present' ? 'Absent' : 'Present'}')"
              class="px-3 py-1 rounded text-xs font-medium transition-all
                ${record.status === 'Present' ? 
                  'bg-red-100 text-red-700 hover:bg-red-200' : 
                  'bg-green-100 text-green-700 hover:bg-green-200'}"
            >
              Mark ${record.status === 'Present' ? 'Absent' : 'Present'}
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching attendance:", error);
  }
}
async function renderClasses() {
  try {
    const classes = await fetchClasses();
    const classesList = document.getElementById("classes-list");
    classesList.innerHTML = classes
      .map(
        (cls) => `
        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-800">${cls.name}</h3>
            <i class="fas fa-dumbbell text-blue-600"></i>
          </div>
          <div class="space-y-2 text-sm text-slate-600">
            <div class="flex items-center">
              <i class="fas fa-user-tie w-4 mr-2"></i>
              <span>Trainer: <strong>${cls.trainer}</strong></span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-clock w-4 mr-2"></i>
              <span>${cls.schedule}</span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-users w-4 mr-2"></i>
              <span>Capacity: <strong>${cls.capacity}</strong></span>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching classes:", error);
  }
}
async function renderInquiries() {
  try {
    const inquiries = await fetchInquiries();
    const inquiriesList = document.getElementById("inquiries-list");
    inquiriesList.innerHTML = inquiries
      .map(
        (inquiry) => `
        <div class="bg-gradient-to-br from-orange-50 to-yellow-100 border border-orange-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-slate-800">${inquiry.name}</h3>
              <p class="text-sm text-slate-600">${inquiry.email}</p>
            </div>
            <i class="fas fa-envelope-open-text text-orange-600"></i>
          </div>
          <p class="text-slate-700 mb-3">${inquiry.message}</p>
          <p class="text-xs text-slate-500">Received: ${new Date(inquiry.receivedAt).toLocaleString()}</p>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching inquiries:", error);
  }
}
async function loadOverviewStats() {
  try {
    const members = await fetchMembers();
    const classes = await fetchClasses();
    const inquiries = await fetchInquiries();
    const attendanceSummary = await fetchAttendanceSummary();
    document.getElementById("total-members").textContent = members.length;
    document.getElementById("total-classes").textContent = classes.length;
    document.getElementById("total-inquiries").textContent = inquiries.length;
    document.getElementById("attendance-percentage").textContent = `${attendanceSummary.attendancePercentage}%`;
  } catch (error) {
    console.error("Error loading overview stats:", error);
  }
}
// --- EVENT HANDLERS ---
async function loadAttendance() {
  const dateInput = document.getElementById('attendance-date');
  const selectedDate = dateInput.value || currentDate;
  await renderAttendance(selectedDate);
}
async function toggleAttendance(memberId, newStatus) {
  try {
    const dateInput = document.getElementById('attendance-date');
    const selectedDate = dateInput.value || currentDate;
    
    const result = await markAttendance(memberId, newStatus, selectedDate);
    
    if (result.message) {
      // Refresh attendance display
      await renderAttendance(selectedDate);
      // Show success message
      alert(`${result.memberName} marked as ${result.status} successfully!`);
    }
  } catch (error) {
    console.error("Error toggling attendance:", error);
    alert("Failed to update attendance. Please try again.");
  }
}
// Member Management
document.getElementById("add-member-btn").addEventListener("click", () => {
  document.getElementById("add-member-form").classList.remove("hidden");
});
function cancelAddMember() {
  document.getElementById("add-member-form").classList.add("hidden");
  // Clear form fields
  document.getElementById("member-name").value = "";
  document.getElementById("member-email").value = "";
  document.getElementById("member-membership").value = "";
}
async function saveMember() {
  const name = document.getElementById("member-name").value;
  const email = document.getElementById("member-email").value;
  const membership = document.getElementById("member-membership").value;
  if (!name || !email || !membership) {
    alert("Please fill in all fields.");
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, membership }),
    });
    if (response.ok) {
      alert("Member added successfully!");
      cancelAddMember();
      renderMembers();
      loadOverviewStats(); // Refresh stats
    } else {
      alert("Failed to add member.");
    }
  } catch (error) {
    console.error("Error adding member:", error);
    alert("Error adding member.");
  }
}
async function deleteMember(memberId) {
  if (confirm("Are you sure you want to delete this member?")) {
    try {
      const response = await fetch(`${API_BASE}/members/${memberId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Member deleted successfully!");
        renderMembers();
        loadOverviewStats(); // Refresh stats
      } else {
        alert("Failed to delete member.");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member.");
    }
  }
}
// Display current date
document.getElementById("current-date").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
// Set today's date as default in attendance date input
document.getElementById('attendance-date').value = currentDate;
// --- INITIALIZATION ---
window.onload = function () {
  renderMembers();
  renderClasses();
  renderInquiries();
  loadOverviewStats();
};