// booking.js

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Define your availability ranges
const availability = {
  monday: { start: "15:00", end: "19:00" },
  wednesday: { start: "14:00", end: "18:00" }
};

const daySelect = document.getElementById('day');
const startTimeSelect = document.getElementById('start-time');
const form = document.getElementById('booking-form');
const messageDiv = document.getElementById('message');

// Populate days
Object.keys(availability).forEach(day => {
  const opt = document.createElement('option');
  opt.value = day;
  opt.textContent = day.charAt(0).toUpperCase() + day.slice(1);
  daySelect.appendChild(opt);
});

// Update start times when day changes
daySelect.addEventListener('change', updateStartTimes);

function updateStartTimes() {
  startTimeSelect.innerHTML = '';
  const day = daySelect.value;
  const start = availability[day].start;
  const end = availability[day].end;

  let startHour = parseInt(start.split(':')[0]);
  let startMin = parseInt(start.split(':')[1]);
  const endHour = parseInt(end.split(':')[0]);
  const endMin = parseInt(end.split(':')[1]);

  while(startHour < endHour || (startHour === endHour && startMin <= endMin)) {
    const timeStr = `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')}`;
    const opt = document.createElement('option');
    opt.value = timeStr;
    opt.textContent = timeStr;
    startTimeSelect.appendChild(opt);

    // Increment by 30 min
    startMin += 30;
    if(startMin >= 60) { startMin = 0; startHour++; }
  }

  filterBookedSlots();
}

// Disable already booked times
async function filterBookedSlots() {
  const day = daySelect.value;
  const snapshot = await db.collection('bookings').where('day','==',day).get();
  const booked = snapshot.docs.map(doc => doc.data());

  for(const option of startTimeSelect.options) {
    option.disabled = booked.some(b => b.start === option.value);
  }
}

// Handle booking submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const booking = {
    day: daySelect.value,
    start: startTimeSelect.value,
    duration: parseInt(document.getElementById('duration').value),
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    notes: document.getElementById('notes').value
  };

  try {
    await db.collection('bookings').add(booking);
    messageDiv.textContent = "Booking successful!";
    updateStartTimes(); // refresh slots
    form.reset();
  } catch(err) {
    messageDiv.textContent = "Error: " + err.message;
  }
});

// Initialize first load
updateStartTimes();
