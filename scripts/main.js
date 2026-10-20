// 1. Массив данных ивентов (добавлено свойство spotsLeft у одного из событий)
const eventsStore = [
  {
    title: "INFJ Personality Type - Coffee Shop Meet & Greet",
    description: "Being an INFJ",
    date: new Date(2026, 2, 23, 15),
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1037&auto=format&fit=crop",
    type: "offline",
    attendees: 99,
    category: "Hobbies and Passions",
    distance: 50,
  },
  {
    title:
      "NYC AI Users - AI Tech Talks, Demo & Social: RAG Search and Customer Experience",
    description: "New York AI Users",
    date: new Date(2027, 2, 23, 11, 30),
    image:
      "https://images.unsplash.com/photo-1696258686454-60082b2c33e2?q=80&w=870&auto=format&fit=crop",
    type: "offline",
    attendees: 43,
    category: "Technology",
    distance: 25,
    spotsLeft: 2, // Дополнительное свойство для отображения оставшихся мест
  },
  {
    title: "Book 40+ Appointments Per Month Using AI and Automation",
    description: "New Jersey Business Network",
    date: new Date(2027, 2, 16, 14),
    image:
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=1032&auto=format&fit=crop",
    type: "online",
    category: "Technology",
    distance: 10,
  },
  {
    title: "Dump writing group weekly meetup",
    description: "Dump writing group",
    date: new Date(2026, 2, 13, 11),
    image:
      "https://plus.unsplash.com/premium_photo-1678453146992-b80d66df9152?q=80&w=870&auto=format&fit=crop",
    type: "online",
    attendees: 77,
    category: "Business",
    distance: 100,
  },
  {
    title: "Over 40s, 50s, & 60s Senior Singles Chat, Meet & Dating Community",
    description: "Over 40s, 50s, 60s Singles Chat, Meet & Dating Community",
    date: new Date(2026, 2, 14, 11),
    image:
      "https://plus.unsplash.com/premium_photo-1706005542509-a460d6efecb0?q=80&w=870&auto=format&fit=crop",
    type: "online",
    attendees: 140,
    category: "Social Activities",
    distance: 75,
  },
  {
    title: "All Nations - Manhattan Missions Church Bible Study",
    description: "Manhattan Bible Study Meetup Group",
    date: new Date(2026, 2, 14, 11),
    image:
      "https://plus.unsplash.com/premium_photo-1679488248784-65a638a3d3fc?q=80&w=870&auto=format&fit=crop",
    type: "offline",
    category: "Health and Wellbeing",
    distance: 15,
  },
];

// 2. Получение элементов DOM
const typeSelect = document.getElementById("filter-type");
const distanceSelect = document.getElementById("filter-distance");
const timeSelect = document.getElementById("filter-time");
const categorySelect = document.getElementById("filter-category");
const eventsContainer = document.getElementById("events-container");
const loadMoreBtn = document.getElementById("load-more-btn");

// Переменные состояния пагинации
let currentVisibleCount = 3;
let lastFilteredEvents = [];

// Форматирование даты
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

// 3. Функция сортировки: предстоящие сверху, прошедшие внизу
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

// 4. Динамический рендеринг карточек
function renderEvents(eventsToRender, resetLimit = false) {
  if (!eventsContainer) return;

  if (resetLimit) {
    currentVisibleCount = 3;
  }

  lastFilteredEvents = eventsToRender;
  eventsContainer.innerHTML = "";

  if (eventsToRender.length === 0) {
    eventsContainer.innerHTML =
      '<p class="no-results" style="padding: 20px; color: #757575;">No events found matching your criteria.</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const now = new Date();
  const eventsToShow = eventsToRender.slice(0, currentVisibleCount);

  eventsToShow.forEach((event) => {
    const card = document.createElement("div");
    const isPast = event.date < now;
    card.className = isPast ? "event event-past" : "event";

    // Формирование опциональных тегов (универсальный класс event-attendees)
    const attendeesHtml = event.attendees
      ? `<span class="event-attendees">${event.attendees} attendees</span>`
      : "";

    const separatorHtml =
      event.attendees && event.spotsLeft
        ? `<span class="footer-separator">·</span>`
        : "";

    const spotsHtml = event.spotsLeft
      ? `<span class="event-spots">${event.spotsLeft} spots left</span>`
      : "";

    const badgeHtml =
      event.type === "online"
        ? `<div class="badge-desktop"><i class="fa-solid fa-video"></i> Online Event</div>`
        : "";

    card.innerHTML = `
      <div class="event-image-wrapper">
        <img src="${event.image}" alt="${event.title}" />
        ${badgeHtml}
      </div>
      <div class="event-date">
        <span>${formatDate(event.date)}</span>
      </div>
      <h3 class="event-title">${event.title}</h3>
      <div class="event-theme">${event.category} (${event.distance} km)</div>
      <div class="event-footer">
        ${attendeesHtml}
        ${separatorHtml}
        ${spotsHtml}
      </div>
    `;
    eventsContainer.appendChild(card);
  });

  // Управление кнопкой «Load more»
  if (loadMoreBtn) {
    if (currentVisibleCount < eventsToRender.length) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

// 5. Логика фильтрации
function filterEvents() {
  const selectedType = typeSelect ? typeSelect.value : "";
  const selectedDistance =
    distanceSelect && distanceSelect.value
      ? Number(distanceSelect.value)
      : null;
  const selectedTime = timeSelect ? timeSelect.value : "";
  const selectedCategory = categorySelect ? categorySelect.value : "";

  const now = new Date();

  const filtered = eventsStore.filter((event) => {
    if (selectedType && event.type !== selectedType) return false;
    if (selectedDistance !== null && event.distance > selectedDistance)
      return false;
    if (selectedCategory && event.category !== selectedCategory) return false;

    if (selectedTime) {
      const eventDate = new Date(event.date);

      if (selectedTime === "today") {
        if (
          eventDate.getDate() !== now.getDate() ||
          eventDate.getMonth() !== now.getMonth() ||
          eventDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (selectedTime === "this-week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        if (eventDate < startOfWeek || eventDate > endOfWeek) {
          return false;
        }
      } else if (selectedTime === "this-month") {
        if (
          eventDate.getMonth() !== now.getMonth() ||
          eventDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (selectedTime === "this-year") {
        if (eventDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (selectedTime === "next-year") {
        if (eventDate.getFullYear() !== now.getFullYear() + 1) {
          return false;
        }
      } else if (selectedTime === "last-year") {
        if (eventDate.getFullYear() !== now.getFullYear() - 1) {
          return false;
        }
      }
    }

    return true;
  });

  renderEvents(sortEvents(filtered), true);
}

// 6. Обработчик клика по «Load more»
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    currentVisibleCount += 3;
    renderEvents(lastFilteredEvents, false);
  });
}

// 7. Подключение слушателей событий
[typeSelect, distanceSelect, timeSelect, categorySelect].forEach((select) => {
  if (select) {
    select.addEventListener("change", filterEvents);
  }
});

// 8. Стартовая инициализация с первой сортировкой
renderEvents(sortEvents(eventsStore), true);

// Логика переключения вкладок
const tabLinks = document.querySelectorAll(".tab-link");
const tabPanes = document.querySelectorAll(".tab-pane");

tabLinks.forEach((link) => {
  link.addEventListener("click", () => {
    // Убираем активный класс у всех кнопок
    tabLinks.forEach((item) => item.classList.remove("active"));
    // Скрываем все панели контента
    tabPanes.forEach((pane) => {
      pane.classList.remove("active");
      pane.style.display = "none";
    });

    // Активируем выбранную кнопку
    link.classList.add("active");

    // Находим и показываем соответствующую панель
    const targetId = link.getAttribute("data-target");
    const targetPane = document.getElementById(targetId);
    if (targetPane) {
      targetPane.classList.add("active");
      targetPane.style.display = "block";
    }
  });
});
