// app.js
/**
 * Lightweight, dependency-free interactivity:
 * - Mobile nav toggle
 * - Before/After slider
 * - WhatsApp deep links (FAB + forms)
 * - Contact form -> mailto fallback + copy helper
 */

const CONFIG = {
  businessName: "Blitz Blank Gebäudetechnik",
  whatsappNumberE164: "+49XXXXXXXXXX", // TODO: replace (e.g. "+491701234567")
  phoneNumber: "+49XXXXXXXXXX", // TODO: replace
  emailTo: "info@beispiel.de", // TODO: replace
  emailSubject: "Anfrage Gebäudereinigung",
};

function normalizeE164(num) {
  return String(num || "").replace(/\s+/g, "").replace(/[^+\d]/g, "");
}

function waLink(message) {
  const phone = normalizeE164(CONFIG.whatsappNumberE164).replace(/^\+/, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

function buildMessage(data) {
  const lines = [
    `Hallo ${CONFIG.businessName},`,
    "",
    "ich möchte ein Angebot anfragen:",
    "",
    `Name: ${data.name || "-"}`,
    `Kontakt: ${data.contact || data.email || "-"}${data.phone ? ` | Telefon: ${data.phone}` : ""}`,
    `Leistung: ${data.service || "-"}`,
    "",
    `Nachricht: ${data.message || "-"}`,
  ];
  return lines.join("\n");
}

function mailtoLink(message) {
  const subject = encodeURIComponent(CONFIG.emailSubject);
  const body = encodeURIComponent(message);
  return `mailto:${encodeURIComponent(CONFIG.emailTo)}?subject=${subject}&body=${body}`;
}

function setLinks() {
  const waFab = document.getElementById("waFab");
  const waFooter = document.getElementById("whatsBtnFooter");
  const callBtn = document.getElementById("callNowBtn");

  const phone = normalizeE164(CONFIG.phoneNumber);
  if (callBtn && phone) callBtn.setAttribute("href", `tel:${phone}`);

  const baseMsg = `Hallo ${CONFIG.businessName}, ich habe eine Anfrage.`;
  const link = waLink(baseMsg);

  if (waFab) waFab.setAttribute("href", link);
  if (waFooter) {
    waFooter.setAttribute("href", link);
    waFooter.setAttribute("target", "_blank");
  }
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      if (menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

function initBeforeAfter() {
  document.querySelectorAll(".ba").forEach((el) => {
    const before = el.getAttribute("data-before");
    const after = el.getAttribute("data-after");
    el.style.setProperty("--before-img", `url("${before}")`);
    el.style.setProperty("--after-img", `url("${after}")`);

    const range = el.querySelector(".ba-range");
    const setReveal = (v) => el.style.setProperty("--reveal", `${Number(v)}%`);

    setReveal(range?.value ?? 50);
    range?.addEventListener("input", (e) => setReveal(e.target.value));
  });
}

function initQuickForm() {
  const form = document.getElementById("quickForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const message = buildMessage(data);
    window.open(waLink(message), "_blank", "noopener");
  });
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const copyBtn = document.getElementById("copyMessageBtn");

  if (!form) return;

  const setStatus = (msg) => {
    if (status) status.textContent = msg || "";
  };

  const collect = () => Object.fromEntries(new FormData(form).entries());

  const generate = () => {
    const data = collect();
    const message = buildMessage(data);
    return { data, message };
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { message } = generate();
    setStatus("Öffne E-Mail…");
    window.location.href = mailtoLink(message);
    setTimeout(() => setStatus("Falls kein Mailprogramm öffnet: Nachricht kopieren und per WhatsApp senden."), 600);
  });

  copyBtn?.addEventListener("click", async () => {
    const { message } = generate();
    try {
      await navigator.clipboard.writeText(message);
      setStatus("Nachricht kopiert ✅");
    } catch {
      setStatus("Kopieren nicht möglich – bitte manuell markieren.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setLinks();
  initNav();
  initBeforeAfter();
  initQuickForm();
  initContactForm();
});
