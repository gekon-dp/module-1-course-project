// ==========================================
// 1. ХРАНИЛИЩЕ ДАННЫХ (БАЗА ИВЕНТОВ)
// ==========================================
// Создаем массив объектов. Каждый объект описывает отдельное событие со всеми его свойствами.
const eventsStore = [
  {
    title: "INFJ Personality Type - Coffee Shop Meet & Greet",
    description: "Being an INFJ",
    date: new Date(2026, 2, 23, 15), // Создаем объект даты (месяцы в JS считаются с 0: 2 = март)
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1037&auto=format&fit=crop",
    type: "offline", // Тип события для фильтрации (online / offline)
    attendees: 99, // Количество участников
    category: "Hobbies and Passions", // Категория мероприятия
    distance: 50, // Расстояние в км
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
    spotsLeft: 2, // Дополнительное свойство: осталось мест (опционально)
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

// ==========================================
// 2. ПОИСК ЭЛЕМЕНТОВ DOM (СВЯЗЬ С HTML)
// ==========================================
// Находим на странице элементы по их ID, чтобы управлять ими из скрипта
const typeSelect = document.querySelector("#filter-type"); // Выпадающий список типов
const distanceSelect = document.querySelector("#filter-distance"); // Выпадающий список расстояний
const timeSelect = document.querySelector("#filter-time"); // Выпадающий список времени
const categorySelect = document.querySelector("#filter-category"); // Выпадающий список категорий
const eventsContainer = document.querySelector("#events-container"); // Контейнер, куда будут добавляться карточки
const loadMoreBtn = document.querySelector("#load-more-btn"); // Кнопка пагинации «Load more»

// Переменные состояния для пагинации (постраничного вывода)
let currentVisibleCount = 2; // Сколько карточек отображается прямо сейчас (начинаем с 2)
let lastFilteredEvents = []; // Здесь сохраняем результаты последней фильтрации, чтобы знать, что подгружать по кнопке

// ==========================================
// 3. УТИЛИТА ФОРМАТИРОВАНИЯ ДАТЫ
// ==========================================
// Принимает объект даты и возвращает красивую строку вида: "FRI, MAR 23, 3:00 PM EST"
function formatDate(dateObj) {
  const options = {
    weekday: "short", // День недели коротко (Mon, Tue...)
    month: "short", // Месяц коротко (Jan, Feb...)
    day: "numeric", // Число месяца
    hour: "numeric", // Часы
    minute: "2-digit", // Минуты (всегда 2 знака)
    timeZoneName: "short", // Часовой пояс
  };
  // Превращаем дату в строку по стандарту США и делаем все буквы заглавными
  return dateObj.toLocaleDateString("en-US", options).toUpperCase();
}

// ==========================================
// 4. ФУНКЦИЯ СОРТИРОВКИ СОБЫТИЙ
// ==========================================
// Поднимает актуальные (предстоящие) события наверх, а прошедшие отправляет вниз
function sortEvents(events) {
  const now = new Date(); // Текущая дата и время на компьютере пользователя

  // Создаем копию массива через [...events], чтобы не портить оригинал, и сортируем методом .sort()
  return [...events].sort((a, b) => {
    const aIsPast = a.date < now; // Прошло ли событие 'a'? (true/false)
    const bIsPast = b.date < now; // Прошло ли событие 'b'? (true/false)

    // Если 'a' прошло, а 'b' нет — ставим 'a' ниже (возвращаем 1)
    if (aIsPast && !bIsPast) return 1;
    // Если 'b' прошло, а 'a' нет — ставим 'b' ниже (возвращаем -1)
    if (!aIsPast && bIsPast) return -1;

    // Если оба события в будущем или оба в прошлом — сортируем их по хронологии (ближайшие сверху)
    return a.date - b.date;
  });
}

// ==========================================
// 5. ДИНАМИЧЕСКИЙ РЕНДЕРИНГ (ОТРИСОВКА) КАРТОЧЕК
// ==========================================
// Принимает массив событий и флаг сброса лимита карточек
function renderEvents(eventsToRender, resetLimit = false) {
  if (!eventsContainer) return; // Если контейнера на странице нет — прерываем выполнение, чтобы не было ошибки

  // Если передан флаг сброса, возвращаем видимый лимит к исходным 2 карточкам
  if (resetLimit) {
    currentVisibleCount = 2;
  }

  // Запоминаем текущий отфильтрованный массив в глобальную переменную
  lastFilteredEvents = eventsToRender;
  // Очищаем контейнер перед отрисовкой новых карточек
  eventsContainer.innerHTML = "";

  // Если после фильтрации ничего не нашлось — показываем сообщение пользователю
  if (eventsToRender.length === 0) {
    eventsContainer.innerHTML =
      '<p class="no-results" style="padding: 20px; color: #757575;">No events found matching your criteria.</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = "none"; // Скрываем кнопку «Load more»
    return;
  }

  const now = new Date();
  // Берем из массива только то количество элементов, которое разрешено переменной currentVisibleCount
  const eventsToShow = eventsToRender.slice(0, currentVisibleCount);

  // Проходимся циклом по каждому событию из среза и создаем для него HTML-карточку
  eventsToShow.forEach((event) => {
    const card = document.createElement("div"); // Создаем пустой тег <div>
    const isPast = event.date < now; // Проверяем, прошло ли событие
    // Назначаем класс: если прошло — добавляем модификатор "event-past" (для серого стиля)
    card.className = isPast ? "event event-past" : "event";

    // Условие: если у объекта есть участники, формируем HTML-строку, иначе пустая строка
    const attendeesHtml = event.attendees
      ? `<span class="event-attendees">${event.attendees} attendees</span>`
      : "";

    // Условие: если указаны и участники, и оставшиеся места, добавляем разделитель "·"
    const separatorHtml =
      event.attendees && event.spotsLeft
        ? `<span class="footer-separator">·</span>`
        : "";

    // Условие: если есть свойство spotsLeft, выводим предупреждение об оставшихся местах
    const spotsHtml = event.spotsLeft
      ? `<span class="event-spots">${event.spotsLeft} spots left</span>`
      : "";

    // Условие: если событие онлайн, создаем бейдж с иконкой видео
    const badgeHtml =
      event.type === "online"
        ? `<div class="badge-desktop"><i class="fa-solid fa-video"></i> Online Event</div>`
        : "";

    // Заполняем созданный div готовой HTML-разметкой карточки с помощью шаблонных строк (бектиков)
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
    // Вставляем готовую карточку внутрь общего контейнера на странице
    eventsContainer.appendChild(card);
  });

  // Логика управления видимостью кнопки «Load more»:
  // Если показаны еще не все отфильтрованные карточки — показываем кнопку, иначе скрываем
  if (loadMoreBtn) {
    if (currentVisibleCount < eventsToRender.length) {
      loadMoreBtn.style.display = "block";
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

// ==========================================
// 6. ЛОГИКА МНОГОКРИТЕРИАЛЬНОЙ ФИЛЬТРАЦИИ
// ==========================================
// Срабатывает каждый раз, когда пользователь меняет значение в любом выпадающем списке
function filterEvents() {
  // Считываем выбранные значения из всех селекторов (если элемент существует)
  const selectedType = typeSelect ? typeSelect.value : "";
  const selectedDistance =
    distanceSelect && distanceSelect.value
      ? Number(distanceSelect.value) // Превращаем строку из селектора в число
      : null;
  const selectedTime = timeSelect ? timeSelect.value : "";
  const selectedCategory = categorySelect ? categorySelect.value : "";

  const now = new Date();

  // Метод .filter() создает новый массив, оставляя в нем только те элементы, которые прошли все проверки (вернули true)
  const filtered = eventsStore.filter((event) => {
    // 1. Проверка по типу (online / offline)
    if (selectedType && event.type !== selectedType) return false;

    // 2. Проверка по расстоянию (если событие дальше выбранного лимита — отсеиваем)
    if (selectedDistance !== null && event.distance > selectedDistance)
      return false;

    // 3. Проверка по категории
    if (selectedCategory && event.category !== selectedCategory) return false;

    // 4. Сложная проверка по временным интервалам (если выбран фильтр времени)
    if (selectedTime) {
      const eventDate = new Date(event.date);

      if (selectedTime === "today") {
        // Проверяем, совпадает ли день, месяц и год события с сегодняшним днем
        if (
          eventDate.getDate() !== now.getDate() ||
          eventDate.getMonth() !== now.getMonth() ||
          eventDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (selectedTime === "this-week") {
        // Вычисляем границы текущей недели (с воскресенья/понедельника по субботу)
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
        // Проверяем совпадение месяца и года
        if (
          eventDate.getMonth() !== now.getMonth() ||
          eventDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (selectedTime === "this-year") {
        // Проверяем текущий год
        if (eventDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (selectedTime === "next-year") {
        // Проверяем следующий год
        if (eventDate.getFullYear() !== now.getFullYear() + 1) {
          return false;
        }
      } else if (selectedTime === "last-year") {
        // Проверяем прошлый год
        if (eventDate.getFullYear() !== now.getFullYear() - 1) {
          return false;
        }
      }
    }

    return true; // Если событие прошло все проверки, оставляем его в массиве
  });

  // Сортируем отфильтрованный массив и заново отрисовываем карточки, сбрасывая лимит пагинации на 3
  renderEvents(sortEvents(filtered), true);
}

// ==========================================
// 7. ОБРАБОТЧИК КЛИКА ПО КНОПКЕ «LOAD MORE»
// ==========================================
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    currentVisibleCount += 2; // Увеличиваем лимит видимых карточек еще на 2
    renderEvents(lastFilteredEvents, false); // Перерисовываем карточки без сброса лимита
  });
}

// ==========================================
// 8. ПОДКЛЮЧЕНИЕ СЛУШАТЕЛЕЙ СОБЫТИЙ К СЕЛЕКТОРАМ
// ==========================================
// Проходим циклом по всем элементам фильтрации и вешаем событие "change" (изменение выбора)
[typeSelect, distanceSelect, timeSelect, categorySelect].forEach((select) => {
  if (select) {
    select.addEventListener("change", filterEvents); // При изменении вызываем функцию фильтрации
  }
});

// ==========================================
// 9. СТАРТОВАЯ ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ==========================================
// Сразу при открытии страницы сортируем исходный массив и отрисовываем первые 2 карточки
renderEvents(sortEvents(eventsStore), true);

// ==========================================
// 10. ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК (Events / Members)
// ==========================================
const tabLinks = document.querySelectorAll(".tab-link"); // Все кнопки вкладок
const tabPanes = document.querySelectorAll(".tab-pane"); // Все панели с контентом

// Вешаем клик на каждую кнопку вкладки
tabLinks.forEach((link) => {
  link.addEventListener("click", () => {
    // 1. Убираем активный класс у всех кнопок
    tabLinks.forEach((item) => item.classList.remove("active"));

    // 2. Скрываем все панели контента (делаем display: none)
    tabPanes.forEach((pane) => {
      pane.classList.remove("active");
      pane.style.display = "none";
    });

    // 3. Добавляем активный класс на ту кнопку, на которую кликнули
    link.classList.add("active");

    // 4. Считываем атрибут data-target с нужной вкладки и находим соответствующую панель
    const targetId = link.getAttribute("data-target");
    const targetPane = document.getElementById(targetId);

    // 5. Если панель найдена, активируем ее и показываем на экране
    if (targetPane) {
      targetPane.classList.add("active");
      targetPane.style.display = "block";
    }
  });
});
