(() => {
  const nav = document.querySelector(".nav-links");
  const navToggle = document.querySelector(".nav-toggle");

  const closeMobileNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  const heroVideo = document.querySelector(".hero-video");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const syncHeroPlayback = () => {
    if (!heroVideo) return;

    if (reducedMotion.matches || document.hidden) {
      heroVideo.pause();
      return;
    }

    heroVideo.play().catch(() => {});
  };

  reducedMotion.addEventListener?.("change", syncHeroPlayback);
  document.addEventListener("visibilitychange", syncHeroPlayback);
  syncHeroPlayback();

  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-status");
  const submitButton = document.querySelector("#contact-submit");

  if (!form || !status || !submitButton) return;

  const showStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
    status.classList.add("is-visible");
  };

  const buildEmailFallback = (formData) => {
    const subject = encodeURIComponent(`Nova conversa - ${formData.get("empresa")}`);
    const body = encodeURIComponent(
      [
        `Nome: ${formData.get("nome")}`,
        `Empresa ou projeto: ${formData.get("empresa")}`,
        `Área prioritária: ${formData.get("prioridade")}`,
        `WhatsApp: ${formData.get("telefone")}`,
        `E-mail: ${formData.get("email")}`,
        `Prazo importante: ${formData.get("prazo")}`,
        "",
        "O que podemos construir juntos:",
        formData.get("mensagem"),
      ].join("\n")
    );

    return `mailto:contato@souluc.com.br?subject=${subject}&body=${body}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    if (formData.get("website")) {
      form.reset();
      showStatus("Conversa iniciada. Em breve entraremos em contato.", "success");
      return;
    }

    formData.delete("website");
    const endpoint = form.dataset.endpoint.trim();

    submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("Iniciando conversa...", "loading");

    if (!endpoint) {
      window.location.href = buildEmailFallback(formData);
      showStatus("Seu aplicativo de e-mail foi aberto com a mensagem preenchida.", "success");
      submitButton.disabled = false;
      form.removeAttribute("aria-busy");
      return;
    }

    let requestTimeout;

    try {
      const controller = new AbortController();
      requestTimeout = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Falha no envio");

      form.reset();
      showStatus("Conversa iniciada. Em breve entraremos em contato.", "success");
    } catch {
      showStatus(
        "Não foi possível enviar agora. Escreva para contato@souluc.com.br.",
        "error"
      );
    } finally {
      window.clearTimeout(requestTimeout);
      submitButton.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
})();
