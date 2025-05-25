// Global data storage
let appointments = [];
let settings = {
  reminder1: 1440,
  reminder2: 60,
  channels: ["sms", "email"],
  patientTemplate:
    "Hi {patientName}, this is a reminder that you have an appointment with Dr. {doctorName} on {date} at {time}. Please reply CONFIRM to confirm your attendance.",
  doctorTemplate:
    "Dr. {doctorName}, you have an upcoming appointment with {patientName} on {date} at {time} for {appointmentType}.",
};
let activityLog = [];

// Tab switching functionality
function switchTab(tabName) {
  // Remove active class from all tabs and content
  document
    .querySelectorAll(".nav-tab")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to selected tab and content
  event.target.classList.add("active");
  document.getElementById(tabName).classList.add("active");

  // Update dashboard when switching to it
  if (tabName === "dashboard") {
    updateDashboard();
  }
}

// Schedule new appointment
function scheduleAppointment(event) {
  event.preventDefault();

  const appointment = {
    id: Date.now(),
    patientName: document.getElementById("patientName").value,
    doctorName: document.getElementById("doctorName").value,
    date: document.getElementById("appointmentDate").value,
    time: document.getElementById("appointmentTime").value,
    patientPhone: document.getElementById("patientPhone").value,
    patientEmail: document.getElementById("patientEmail").value,
    doctorPhone: document.getElementById("doctorPhone").value,
    appointmentType: document.getElementById("appointmentType").value,
    notes: document.getElementById("notes").value,
    status: "scheduled",
    reminders: [],
    confirmed: false,
    createdAt: new Date(),
  };

  appointments.push(appointment);

  // Schedule automatic reminders
  scheduleReminders(appointment);

  // Log activity
  logActivity(
    `New appointment scheduled for ${appointment.patientName} with Dr. ${appointment.doctorName}`
  );

  // Reset form
  event.target.reset();

  // Show success message
  showToast("Appointment scheduled successfully!");
}

// Schedule automatic reminders
function scheduleReminders(appointment) {
  const appointmentDateTime = new Date(
    `${appointment.date}T${appointment.time}`
  );
  const now = new Date();

  // First reminder
  const firstReminderTime = new Date(
    appointmentDateTime.getTime() - settings.reminder1 * 60000
  );
  if (firstReminderTime > now) {
    setTimeout(() => {
      sendReminder(appointment, "first");
    }, firstReminderTime.getTime() - now.getTime());
  }

  // Second reminder
  const secondReminderTime = new Date(
    appointmentDateTime.getTime() - settings.reminder2 * 60000
  );
  if (secondReminderTime > now) {
    setTimeout(() => {
      sendReminder(appointment, "second");
    }, secondReminderTime.getTime() - now.getTime());
  }
}

// Send reminder (simulated)
function sendReminder(appointment, reminderType) {
  const channels = settings.channels;
  let remindersSent = 0;

  channels.forEach((channel) => {
    // Simulate sending reminder
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        remindersSent++;
        logActivity(
          `${reminderType} reminder sent via ${channel.toUpperCase()} to ${
            appointment.patientName
          }`
        );

        // Also send to doctor
        logActivity(
          `${reminderType} reminder sent via ${channel.toUpperCase()} to Dr. ${
            appointment.doctorName
          }`
        );
      } else {
        logActivity(
          `Failed to send ${reminderType} reminder via ${channel.toUpperCase()} to ${
            appointment.patientName
          }`
        );
      }

      // Update appointment status
      const apt = appointments.find((a) => a.id === appointment.id);
      if (apt) {
        apt.reminders.push({
          type: reminderType,
          channel: channel,
          sent: success,
          timestamp: new Date(),
        });
        apt.status = "reminded";
        updateAppointmentsList();
      }
    }, Math.random() * 2000); // Random delay up to 2 seconds
  });
}

// Manual reminder sending
function sendManualReminder(appointmentId) {
  const appointment = appointments.find((a) => a.id === appointmentId);
  if (appointment) {
    sendReminder(appointment, "manual");
    showToast("Manual reminder sent!");
  }
}

// Confirm appointment
function confirmAppointment(appointmentId) {
  const appointment = appointments.find((a) => a.id === appointmentId);
  if (appointment) {
    appointment.confirmed = true;
    appointment.status = "confirmed";
    logActivity(`Appointment confirmed by ${appointment.patientName}`);
    updateAppointmentsList();
    showToast("Appointment confirmed!");
  }
}

// Cancel appointment
function cancelAppointment(appointmentId) {
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index > -1) {
    const appointment = appointments[index];
    logActivity(`Appointment cancelled for ${appointment.patientName}`);
    appointments.splice(index, 1);
    updateAppointmentsList();
    showToast("Appointment cancelled");
  }
}

// Update appointments list display
function updateAppointmentsList() {
  const container = document.getElementById("appointmentsList");

  if (appointments.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #6c757d; padding: 40px;">No appointments scheduled</p>';
    return;
  }

  // Sort appointments by date
  const sortedAppointments = appointments.sort(
    (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );

  container.innerHTML = sortedAppointments
    .map(
      (appointment) => `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <div class="patient-name">${
                          appointment.patientName
                        }</div>
                        <div class="appointment-status status-${
                          appointment.status
                        }">${appointment.status.toUpperCase()}</div>
                    </div>
                    
                    <div class="appointment-details">
                        <div class="detail-item">
                            <span class="detail-icon">👨‍⚕️</span>
                            <span>Dr. ${appointment.doctorName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">📅</span>
                            <span>${new Date(
                              appointment.date
                            ).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🕐</span>
                            <span>${appointment.time}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🏥</span>
                            <span>${appointment.appointmentType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">📱</span>
                            <span>${appointment.patientPhone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">✉️</span>
                            <span>${appointment.patientEmail}</span>
                        </div>
                    </div>
                    
                    ${
                      appointment.notes
                        ? `<p style="margin-bottom: 15px; color: #6c757d;"><strong>Notes:</strong> ${appointment.notes}</p>`
                        : ""
                    }
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" onclick="sendManualReminder(${
                          appointment.id
                        })">📤 Send Reminder</button>
                        ${
                          !appointment.confirmed
                            ? `<button class="btn" onclick="confirmAppointment(${appointment.id})">✅ Confirm</button>`
                            : ""
                        }
                        <button class="btn btn-danger" onclick="cancelAppointment(${
                          appointment.id
                        })">❌ Cancel</button>
                    </div>
                    
                    ${
                      appointment.reminders.length > 0
                        ? `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                            <small style="color: #6c757d;">
                                <strong>Reminders sent:</strong> ${
                                  appointment.reminders.filter((r) => r.sent)
                                    .length
                                }/${appointment.reminders.length}
                            </small>
                        </div>
                    `
                        : ""
                    }
                </div>
            `
    )
    .join("");
}

// Channel selection
function toggleChannel(element) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  element.classList.toggle("selected", checkbox.checked);
}

// Save settings
function saveSettings() {
  settings.reminder1 = parseInt(document.getElementById("reminder1").value);
  settings.reminder2 = parseInt(document.getElementById("reminder2").value);
  settings.patientTemplate = document.getElementById("patientTemplate").value;
  settings.doctorTemplate = document.getElementById("doctorTemplate").value;

  // Update channels
  settings.channels = [];
  document
    .querySelectorAll(".channel-option input:checked")
    .forEach((checkbox) => {
      const channelText = checkbox.parentElement.textContent
        .trim()
        .toLowerCase();
      if (channelText.includes("sms")) settings.channels.push("sms");
      else if (channelText.includes("email")) settings.channels.push("email");
      else if (channelText.includes("whatsapp"))
        settings.channels.push("whatsapp");
      else if (channelText.includes("push")) settings.channels.push("push");
    });

  logActivity("System settings updated");
  showToast("Settings saved successfully!");
}

// Update dashboard
function updateDashboard() {
  // Calculate statistics
  const total = appointments.length;
  const confirmed = appointments.filter((a) => a.confirmed).length;
  const thisWeek = appointments.filter((a) => {
    const appointmentDate = new Date(a.date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return appointmentDate >= now && appointmentDate <= weekFromNow;
  }).length;

  const totalReminders = appointments.reduce(
    (sum, a) => sum + a.reminders.length,
    0
  );
  const successfulReminders = appointments.reduce(
    (sum, a) => sum + a.reminders.filter((r) => r.sent).length,
    0
  );
  const reminderSuccessRate =
    totalReminders > 0
      ? Math.round((successfulReminders / totalReminders) * 100)
      : 0;
  const confirmationRate =
    total > 0 ? Math.round((confirmed / total) * 100) : 0;

  // Update stats
  document.getElementById("totalAppointments").textContent = total;
  document.getElementById("remindersSuccess").textContent =
    reminderSuccessRate + "%";
  document.getElementById("upcomingAppointments").textContent = thisWeek;
  document.getElementById("confirmedRate").textContent = confirmationRate + "%";

  // Update activity log
  const logContainer = document.getElementById("activityLog");
  if (activityLog.length === 0) {
    logContainer.innerHTML =
      '<p style="text-align: center; color: #6c757d;">No recent activity</p>';
  } else {
    logContainer.innerHTML = activityLog
      .slice(-20)
      .reverse()
      .map(
        (entry) => `
                    <div class="log-entry">
                        <div class="log-time">${entry.timestamp.toLocaleTimeString()}</div>
                        <div>${entry.message}</div>
                    </div>
                `
      )
      .join("");
  }
}

// Log activity
function logActivity(message) {
  activityLog.push({
    timestamp: new Date(),
    message: message,
  });

  // Keep only last 100 entries
  if (activityLog.length > 100) {
    activityLog = activityLog.slice(-100);
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Initialize the application
function initializeApp() {
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("appointmentDate").min = today;

  // Load initial data (demo data)
  setTimeout(() => {
    logActivity("System initialized");
    updateAppointmentsList();
    updateDashboard();
  }, 100);
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeApp);
