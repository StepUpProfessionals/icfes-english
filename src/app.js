(async function () {
  const cfg = window.QUIZ_CONFIG;
  if (!cfg?.source) {
    console.error("Falta QUIZ_CONFIG.source");
    return;
  }

  // Elements
  const promptEl = document.getElementById("prompt");
  const optionsEl = document.getElementById("options");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("title");

  // Load JSON
  const res = await fetch(cfg.source);
  if (!res.ok) throw new Error("No se pudo cargar: " + cfg.source);
  const quiz = await res.json();

  if (titleEl && quiz.title) titleEl.textContent = quiz.title;

  // State
  let index = 0;
  let correct = 0;
  const perSkill = { reading: { t: 0, c: 0 }, grammar: { t: 0, c: 0 }, vocab: { t: 0, c: 0 } };

  function render() {
    const q = quiz.questions[index];
    promptEl.textContent = q.prompt;

    optionsEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = opt;
      btn.className = "optionBtn";
      btn.onclick = () => select(i);
      optionsEl.appendChild(btn);
    });

    nextBtn.disabled = true;
  }

  let selected = null;

  function select(i) {
    selected = i;
    nextBtn.disabled = false;

    // UI simple: marca seleccionado
    [...optionsEl.querySelectorAll("button")].forEach((b, idx) => {
      b.classList.toggle("selected", idx === i);
    });
  }

  nextBtn.addEventListener("click", () => {
    const q = quiz.questions[index];
    const skill = q.skill || "reading";

    perSkill[skill] = perSkill[skill] || { t: 0, c: 0 };
    perSkill[skill].t += 1;

    if (selected === q.answer) {
      correct += 1;
      perSkill[skill].c += 1;
    }

    selected = null;
    index += 1;

    if (index >= quiz.questions.length) {
      // ✅ Guardar resultado
      const payload = {
        mode: cfg.mode,
        quizId: cfg.quizId || quiz.id,
        correct,
        total: quiz.questions.length,
        perSkill,
        finishedAt: new Date().toISOString()
      };
      localStorage.setItem("lastResult", JSON.stringify(payload));

      // ✅ Ir a resultados
      location.href = "./resultado.html";
      return;
    }

    render();
  });

  render();
})().catch(err => console.error(err));

