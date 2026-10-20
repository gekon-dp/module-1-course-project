const eventsStore = [
  {
    title: "INFJ Personality Type - Coffee Shop Meet & Greet",
    description: "Being an INFJ",
    date: new Date(2024, 2, 23, 15),
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1037&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D%201037w ",
    type: "offline",
    attendees: 99,
    category: "Hobbies and Passions",
    distance: 50,
  },
  {
    title:
      "NYC AI Users - AI Tech Talks, Demo & Social: RAG Search and Customer Experience",
    description: "New York AI Users",
    date: new Date(2024, 2, 23, 11, 30),
    image:
      "https://images.unsplash.com/photo-1696258686454-60082b2c33e2?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D ",
    type: "offline",
    attendees: 43,
    category: "Technology",
    distance: 25,
  },
  {
    title: "Book 40+ Appointments Per Month Using AI and Automation",
    description: "New Jersey Business Network",
    date: new Date(2024, 2, 16, 14),
    image:
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "online",
    category: "Technology",
    distance: 10,
  },
  {
    title: "Dump writing group weekly meetup",
    description: "Dump writing group",
    date: new Date(2024, 2, 13, 11),
    image:
      "https://plus.unsplash.com/premium_photo-1678453146992-b80d66df9152?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "online",
    attendees: 77,
    category: "Business",
    distance: 100,
  },
  {
    title: "Over 40s, 50s, & 60s Senior Singles Chat, Meet & Dating Community",
    description: "Over 40s, 50s, 60s Singles Chat, Meet & Dating Community",
    date: new Date(2024, 2, 14, 11),
    image:
      "https://plus.unsplash.com/premium_photo-1706005542509-a460d6efecb0?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "online",
    attendees: 140,
    category: "Social Activities",
    distance: 75,
  },
  {
    title: "All Nations - Manhattan Missions Church Bible Study",
    description: "Manhattan Bible Study Meetup Group",
    date: new Date(2024, 2, 14, 11),
    image:
      "https://plus.unsplash.com/premium_photo-1679488248784-65a638a3d3fc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    type: "offline",
    category: "Health and Wellbeing",
    distance: 15,
  },
];

const typeSelect = document.getElementById("filter-type");
const distanceSelect = document.getElementById("filter-distance");
const timeSelect = document.getElementById("filter-time");
const categorySelect = document.getElementById("filter-category");
const eventsContainer = document.getElementById("events-container");

function formatDate(dateObj) {
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return dateObj.toLocaleDateString("en-US", options).toUpperCase();
}

function sortEvents(events) {
  const now = new Date();
  return [...events].sort((a, b) => {
    const aIsPast = a.date < now;
    const bIsPast = b.date < now;
    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;
    return a.date - b.date;
  });
}

function renderEvents(eventsToRender) {
  if (!eventsContainer) return;
  eventsContainer.innerHTML = "";
  const now = new Date();

  eventsToRender.forEach((event) => {
    const card = document.createElement("div");
    const isPast = event.date < now;
    card.className = isPast ? "event event-past" : "event";
    card.innerHTML = `
      <div class="event-image-wrapper">
        <img src="${event.image}" alt="${event.title}" />
      </div>
      <div class="event-date"><span>${formatDate(event.date)}</span></div>
      <h3 class="event-title">${event.title}</h3>
    `;
    eventsContainer.appendChild(card);
  });
}

function filterEvents() {
  const selectedType = typeSelect ? typeSelect.value : "";
  const selectedDistance =
    distanceSelect && distanceSelect.value
      ? Number(distanceSelect.value)
      : null;
  const selectedCategory = categorySelect ? categorySelect.value : "";

  const filtered = eventsStore.filter((event) => {
    if (selectedType && event.type !== selectedType) return false;
    if (selectedDistance !== null && event.distance > selectedDistance)
      return false;
    if (selectedCategory && event.category !== selectedCategory) return false;
    return true;
  });

  renderEvents(sortEvents(filtered));
}

[typeSelect, distanceSelect, timeSelect, categorySelect].forEach((select) => {
  if (select) {
    select.addEventListener("change", filterEvents);
  }
});

renderEvents(sortEvents(eventsStore));
