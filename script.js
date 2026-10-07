const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function setNav(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  nav.classList.toggle("is-open", open);
}

toggle.addEventListener("click", () => {
  setNav(toggle.getAttribute("aria-expanded") !== "true");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setNav(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNav(false);
});

const RECOMMENDATIONS = {
  brakes: {
    title: "Brake Inspection & Service",
    blurb:
      "We measure pad and rotor wear on camera, test brake fluid moisture, and send the photo report to your phone before anything is quoted.",
    time: "Same day",
    includes: [
      "Pad and rotor thickness measured",
      "Brake fluid moisture test",
      "Photo inspection report on your phone",
      "Written estimate before any work",
    ],
  },
  engine: {
    title: "Check-Engine Diagnostics",
    blurb:
      "A proper scan with live sensor data — no guessing and no parts thrown at the problem. We explain what the codes mean before recommending a repair.",
    time: "Same day",
    includes: [
      "OBD-II scan with live sensor data",
      "Visual and road-test inspection",
      "Fault codes explained in plain English",
      "No parts replaced without your go-ahead",
    ],
  },
  maintenance: {
    title: "Scheduled Maintenance Service",
    blurb:
      "Factory-interval service done to your make's schedule, so your service records hold up when it's time to sell.",
    time: "~60 min",
    includes: [
      "Synthetic oil and OEM-spec filter",
      "Fluids topped off, belts checked",
      "20-point digital checklist",
      "Service interval reset",
    ],
  },
  tires: {
    title: "Tire Service & Repair",
    blurb:
      "Tread depth recorded at every visit, punctures checked, and a road-force balance if you feel a wobble at speed.",
    time: "~40 min",
    includes: [
      "Tread depth measured and logged",
      "Puncture and sidewall check",
      "Rotation, mount, or balance",
      "TPMS reset and pressure set",
    ],
  },
  other: {
    title: "General Diagnosis & Walk-Around",
    blurb:
      "Not sure what the noise is? Bring it in for a road test and under-car inspection — we call you with findings before touching anything.",
    time: "By appointment",
    includes: [
      "Road test with a technician",
      "Under-car visual inspection",
      "Photo report sent to your phone",
      "Call before any work starts",
    ],
  },
};

const resultEl = document.querySelector("#finder-result");
const problemInputs = document.querySelectorAll('input[name="car-problem"]');

function renderRecommendation(key) {
  const item = RECOMMENDATIONS[key];
  if (!item || !resultEl) return;

  resultEl.classList.remove("is-active");
  void resultEl.offsetWidth;
  resultEl.classList.add("is-active");
  resultEl.innerHTML = `
    <p class="result-kicker">Recommended service</p>
    <h3 class="result-title">${item.title}</h3>
    <p class="result-blurb">${item.blurb}</p>
    <ul class="result-meta">
      <li><span>Typical time</span><strong>${item.time}</strong></li>
      <li><span>Written estimate</span><strong>Before work starts</strong></li>
      <li><span>Photo report</span><strong>To your phone</strong></li>
    </ul>
    <ul class="result-includes">
      ${item.includes.map((entry) => `<li>${entry}</li>`).join("")}
    </ul>
    <div class="result-actions">
      <a class="btn btn-primary" href="#book">Book this service</a>
      <a class="btn btn-ghost" href="tel:+12065550142">Call (206) 555-0142</a>
    </div>`;

  localStorage.setItem("northstar:selected-service", key);

  const rect = resultEl.getBoundingClientRect();
  if (rect.bottom > window.innerHeight) {
    resultEl.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
    });
  }
}

problemInputs.forEach((input) => {
  input.addEventListener("change", () => renderRecommendation(input.value));
});

const serviceSelect = document.querySelector("#f-service");
const appointmentForm = document.querySelector("#appointment-form");
const successPanel = document.querySelector("#form-success");
const successTitle = document.querySelector("#form-success-title");

function savedService() {
  const value = localStorage.getItem("northstar:selected-service");
  if (!value || !serviceSelect) return null;
  const hasOption = [...serviceSelect.options].some((option) => option.value === value);
  return hasOption ? value : null;
}

if (serviceSelect && savedService()) {
  serviceSelect.value = savedService();
}

if (appointmentForm) {
  window.formspree =
    window.formspree ||
    function () {
      (formspree.q = formspree.q || []).push(arguments);
    };

  let pendingSubmission = null;

  formspree("initForm", {
    formElement: "#appointment-form",
    formId: "xwlvvanq",
    useDefaultStyles: false,
    data: { source: "northstar-auto-care-site" },
    disable: ({ form }) => {
      form.setAttribute("aria-busy", "true");
      form.querySelectorAll("[type='submit']:enabled").forEach((btn) => {
        btn.dataset.originalLabel = btn.textContent;
        btn.textContent = "Sending…";
        btn.disabled = true;
      });
    },
    enable: ({ form }) => {
      form.removeAttribute("aria-busy");
      form.querySelectorAll("[type='submit']:disabled").forEach((btn) => {
        if (btn.dataset.originalLabel) {
          btn.textContent = btn.dataset.originalLabel;
          delete btn.dataset.originalLabel;
        }
        btn.disabled = false;
      });
    },
    onSubmit: ({ form }) => {
      pendingSubmission = new FormData(form);
    },
    onSuccess: () => {
      const data = pendingSubmission || new FormData(appointmentForm);
      document.querySelector("#sum-name").textContent = data.get("name") || "—";
      document.querySelector("#sum-phone").textContent = data.get("phone") || "—";
      const chosen = [...serviceSelect.options].find(
        (option) => option.value === data.get("service")
      );
      document.querySelector("#sum-service").textContent = chosen
        ? chosen.textContent
        : "—";
      appointmentForm.hidden = true;
      successPanel.hidden = false;
      successTitle.focus();
      pendingSubmission = null;
    },
  });

  document.querySelector("#form-reset").addEventListener("click", () => {
    successPanel.hidden = true;
    appointmentForm.hidden = false;
    appointmentForm.reset();
    const prefill = savedService();
    if (prefill) serviceSelect.value = prefill;
    document.querySelector("#f-name").focus();
  });
}
