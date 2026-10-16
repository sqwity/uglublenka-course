/* ============================================
   УГЛУБЛЁННЫЙ КУРС ДЛЯ НОВИЧКОВ — ОБЩИЕ СКРИПТЫ
   ============================================ */

(function () {
  "use strict";

  // ============================================
  // КОНСТАНТЫ
  // ============================================

  const STORAGE_KEYS = {
    progress: "advanced-course-progress-v1",
    achievements: "advanced-course-achievements-v1",
    theme: "advanced-course-theme-v1",
    userName: "advanced-course-username-v1"
  };

  const TOTAL_LESSONS = 10;

  // Список достижений
  const ACHIEVEMENTS = [
    {
      id: "first_step",
      icon: "🌱",
      title: "Первый шаг",
      desc: "Пройден 1 урок"
    },
    {
      id: "half_way",
      icon: "🔥",
      title: "Половина пути",
      desc: "Пройдено 5 уроков"
    },
    {
      id: "almost_there",
      icon: "⚡",
      title: "Почти у цели",
      desc: "Пройдено 8 уроков"
    },
    {
      id: "graduate",
      icon: "🎓",
      title: "Выпускник",
      desc: "Пройдены все 10 уроков"
    },
    {
      id: "perfectionist",
      icon: "💎",
      title: "Перфекционист",
      desc: "Все тесты с первой попытки"
    },
    {
      id: "reader",
      icon: "📖",
      title: "Внимательный читатель",
      desc: "Открыты все уроки"
    }
  ];

  // ============================================
  // УТИЛИТЫ
  // ============================================

  function getStorage(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Игнорируем ошибки записи
    }
  }

  // ============================================
  // ТЕМА (ТЁМНАЯ / СВЕТЛАЯ)
  // ============================================

  function getTheme() {
    return getStorage(STORAGE_KEYS.theme, "light");
  }

  function setTheme(theme) {
    setStorage(STORAGE_KEYS.theme, theme);
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtons(theme);
  }

  function updateThemeButtons(theme) {
    const buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
      );
    });
  }

  function initTheme() {
    const savedTheme = getTheme();
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButtons(savedTheme);

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = getTheme();
        const next = current === "dark" ? "light" : "dark";
        setTheme(next);
      });
    });
  }

  // ============================================
  // ПРОГРЕСС (ПРОЙДЕННЫЕ УРОКИ)
  // ============================================

  function getCompletedLessons() {
    return getStorage(STORAGE_KEYS.progress, []);
  }

  function isLessonCompleted(lessonNumber) {
    return getCompletedLessons().includes(Number(lessonNumber));
  }

  function markLessonCompleted(lessonNumber) {
    const completed = getCompletedLessons();
    const num = Number(lessonNumber);
    if (!completed.includes(num)) {
      completed.push(num);
      setStorage(STORAGE_KEYS.progress, completed);
      checkAchievements();
    }
  }

  function unmarkLessonCompleted(lessonNumber) {
    const num = Number(lessonNumber);
    const completed = getCompletedLessons().filter((n) => n !== num);
    setStorage(STORAGE_KEYS.progress, completed);
  }

  // ============================================
  // БЛОКИРОВКА УРОКОВ
  // ============================================

  /**
   * Урок доступен, если:
   * - Это урок 1
   * - Или предыдущий урок пройден
   */
  function isLessonUnlocked(lessonNumber) {
    const num = Number(lessonNumber);
    if (num === 1) return true;
    return isLessonCompleted(num - 1);
  }

  // ============================================
  // ДОСТИЖЕНИЯ
  // ============================================

  function getUnlockedAchievements() {
    return getStorage(STORAGE_KEYS.achievements, []);
  }

  function unlockAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      setStorage(STORAGE_KEYS.achievements, unlocked);

      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        showToast(
          `${achievement.icon} ${achievement.title}`,
          achievement.desc
        );
      }
    }
  }

  function checkAchievements() {
    const completed = getCompletedLessons().length;

    if (completed >= 1) unlockAchievement("first_step");
    if (completed >= 5) unlockAchievement("half_way");
    if (completed >= 8) unlockAchievement("almost_there");
    if (completed >= TOTAL_LESSONS) unlockAchievement("graduate");
  }

  // ============================================
   // TOAST-УВЕДОМЛЕНИЯ
  // ============================================

  let toastTimeout = null;

  function showToast(title, message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.innerHTML = `
        <span class="toast-title"></span>
        <span class="toast-message"></span>
      `;
      document.body.appendChild(toast);
    }

    toast.querySelector(".toast-title").textContent = title;
    toast.querySelector(".toast-message").textContent = message;

    toast.classList.add("show");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  // ============================================
  // ГЛАВНАЯ СТРАНИЦА — РЕНДЕР 10 УРОКОВ
  // ============================================

  function renderLessonsGrid() {
    const grid = document.getElementById("lessonsGrid");
    if (!grid) return;

    const lessonsData = window.LESSONS_DATA || [];

    grid.innerHTML = lessonsData
      .map((lesson) => {
        const num = lesson.number;
        const isUnlocked = isLessonUnlocked(num);
        const isCompleted = isLessonCompleted(num);

        let classes = "lesson-card";
        if (!isUnlocked) classes += " locked";
        if (isCompleted) classes += " completed";

        const href = isUnlocked ? `lesson-${num}.html` : "#";
        const lockAttr = isUnlocked ? "" : 'aria-disabled="true"';

        return `
          <a href="${href}" class="${classes}" ${lockAttr} data-lesson="${num}">
            <div class="lesson-card-icon">${lesson.icon}</div>
            <div class="lesson-card-number">Урок ${num}</div>
            <h3>${lesson.title}</h3>
            <p>${lesson.subtitle}</p>
            ${isUnlocked
              ? `<span class="lesson-card-arrow">Открыть урок →</span>`
              : `<span class="lesson-card-arrow" style="color:var(--muted)">🔒 Заблокировано</span>`
            }
          </a>
        `;
      })
      .join("");

    // Предотвращаем переход по заблокированным урокам
    grid.querySelectorAll(".lesson-card.locked").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const num = card.dataset.lesson;
        showToast(
          "🔒 Урок заблокирован",
          `Сначала пройдите урок ${Number(num) - 1}`
        );
      });
    });
  }

  // ============================================
  // ПРОГРЕСС НА ГЛАВНОЙ СТРАНИЦЕ
  // ============================================

  function updateMainProgress() {
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    if (!progressText || !progressFill) return;

    const completed = getCompletedLessons().length;
    progressText.textContent = `${completed} из ${TOTAL_LESSONS} уроков`;
    progressFill.style.width = `${(completed / TOTAL_LESSONS) * 100}%`;
  }

  // ============================================
  // ДОСТИЖЕНИЯ НА ГЛАВНОЙ
  // ============================================

  function renderAchievements() {
    const grid = document.getElementById("achievementsGrid");
    if (!grid) return;

    const unlocked = getUnlockedAchievements();

    grid.innerHTML = ACHIEVEMENTS.map((a) => {
      const isUnlocked = unlocked.includes(a.id);
      return `
        <div class="achievement ${isUnlocked ? "unlocked" : ""}" title="${a.desc}">
          <div class="achievement-icon">${a.icon}</div>
          <div class="achievement-title">${a.title}</div>
          <div class="achievement-desc">${a.desc}</div>
        </div>
      `;
    }).join("");
  }

  // ============================================
  // СТРАНИЦА УРОКА — КНОПКА "ПРОЙДЕН"
  // ============================================

  function initLessonPage() {
    const lessonContainer = document.querySelector("[data-lesson-number]");
    if (!lessonContainer) return;

    const lessonNumber = Number(lessonContainer.dataset.lessonNumber);

    // Проверка блокировки
    if (!isLessonUnlocked(lessonNumber)) {
      showToast(
        "🔒 Урок заблокирован",
        `Сначала пройдите урок ${lessonNumber - 1}`
      );
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
      return;
    }

    // Кнопка "Отметить пройденным"
    const completeBtn = document.getElementById("completeBtn");
    if (completeBtn) {
      updateCompleteButton(completeBtn, lessonNumber);

      completeBtn.addEventListener("click", () => {
        if (isLessonCompleted(lessonNumber)) {
          unmarkLessonCompleted(lessonNumber);
        } else {
          markLessonCompleted(lessonNumber);
        }
        updateCompleteButton(completeBtn, lessonNumber);

        // Если урок 10 пройден — предложить сертификат
        if (
          lessonNumber === TOTAL_LESSONS &&
          isLessonCompleted(TOTAL_LESSONS)
        ) {
          showToast(
            "🎉 Курс завершён!",
            "Получите свой сертификат на главной странице"
          );
        }
      });
    }

    // Обновление прогресса в верхней панели
    updateTopBarProgress();
  }

  function updateCompleteButton(btn, lessonNumber) {
    const isCompleted = isLessonCompleted(lessonNumber);
    if (isCompleted) {
      btn.classList.add("active");
      btn.innerHTML = "✓ Урок пройден · нажмите, чтобы отменить";
    } else {
      btn.classList.remove("active");
      btn.innerHTML = "Отметить урок пройденным";
    }
  }

  // ============================================
  // ПРОГРЕСС В ВЕРХНЕЙ ПАНЕЛИ
  // ============================================

  function updateTopBarProgress() {
    const el = document.getElementById("topBarProgress");
    if (!el) return;
    const completed = getCompletedLessons().length;
    el.textContent = `${completed}/${TOTAL_LESSONS}`;
  }

  // ============================================
  // МИНИ-ТЕСТ В УРОКЕ
  // ============================================

  function initQuiz() {
    const form = document.getElementById("quizForm");
    if (!form) return;

    const resultEl = document.getElementById("quizResult");
    const retryBtn = document.getElementById("retryQuizBtn");
    const lessonNumber = Number(
      document.querySelector("[data-lesson-number]")?.dataset.lessonNumber
    );

    const correctAnswers = window.QUIZ_ANSWERS || {};

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let score = 0;
      let unanswered = 0;
      const total = Object.keys(correctAnswers).length;

      for (const [q, correct] of Object.entries(correctAnswers)) {
        const selected = form.querySelector(`input[name="${q}"]:checked`);
        if (!selected) unanswered++;
        else if (selected.value === correct) score++;
      }

      resultEl.className = "quiz-result visible";
      if (retryBtn) retryBtn.style.display = "none";

      if (unanswered > 0) {
        resultEl.classList.add("again");
        resultEl.innerHTML = `Ответьте на все вопросы, чтобы увидеть результат. Осталось: <b>${unanswered}</b>`;
        return;
      }

      if (score === total) {
        resultEl.classList.add("success");
        resultEl.innerHTML = `🏆 <b>Отлично!</b> Все ${total} ответов верны. Вы отлично усвоили урок ${lessonNumber}.`;

        // Достижение "Перфекционист" (упрощённая версия — за идеальный тест)
        if (lessonNumber === TOTAL_LESSONS) {
          unlockAchievement("perfectionist");
        }
      } else if (score >= Math.ceil(total * 0.7)) {
        resultEl.classList.add("success");
        resultEl.innerHTML = `👍 <b>Хороший результат!</b> Правильных ответов: <b>${score}</b> из ${total}. Можно двигаться дальше.`;
      } else {
        resultEl.classList.add("again");
        resultEl.innerHTML = `Правильных ответов: <b>${score}</b> из ${total}. Рекомендуем перечитать урок и попробовать снова.`;
        if (retryBtn) retryBtn.style.display = "inline-flex";
      }
    });

    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        form.reset();
        resultEl.className = "quiz-result";
        resultEl.innerHTML = "";
        retryBtn.style.display = "none";
      });
    }
  }

  // ============================================
  // КНОПКА "НАВЕРХ"
  // ============================================

  function initScrollTop() {
    const btn = document.getElementById("scrollTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 400) btn.classList.add("visible");
        else btn.classList.remove("visible");
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ============================================
  // АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
  // ============================================

  function initReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ============================================
  // СЕРТИФИКАТ
  // ============================================

  function initCertificate() {
    const wrap = document.getElementById("certificateWrap");
    if (!wrap) return;

    const completed = getCompletedLessons().length;
    const isCompleted = completed >= TOTAL_LESSONS;

    if (!isCompleted) {
      // Показываем сообщение, что курс не пройден
      wrap.innerHTML = `
        <div class="completion-card">
          <div class="completion-icon">🔒</div>
          <h2>Сертификат пока недоступен</h2>
          <p>Пройдите все ${TOTAL_LESSONS} уроков, чтобы получить сертификат.</p>
          <p style="margin-top:8px">Ваш прогресс: <b>${completed} из ${TOTAL_LESSONS}</b></p>
          <a href="index.html" class="btn btn-primary" style="margin-top:16px">← Вернуться к урокам</a>
        </div>
      `;
      return;
    }

    // Спрашиваем имя (если ещё нет)
    let userName = getStorage(STORAGE_KEYS.userName, "");
    if (!userName) {
      userName = prompt("Как вас зовут? (Имя для сертификата)") || "Студент";
      userName = userName.trim().substring(0, 40) || "Студент";
      setStorage(STORAGE_KEYS.userName, userName);
    }

    // Обновляем данные на сертификате
    const nameEl = document.getElementById("certName");
    const dateEl = document.getElementById("certDate");
    if (nameEl) nameEl.textContent = userName;
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }

  // ============================================
  // ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
  // ============================================

  function init() {
    initTheme();
    renderLessonsGrid();
    updateMainProgress();
    renderAchievements();
    initLessonPage();
    initQuiz();
    initScrollTop();
    initReveal();
    initCertificate();
    updateTopBarProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();