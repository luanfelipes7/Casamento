document.addEventListener('DOMContentLoaded', () => {
  const locale = 'pt-BR';
  const t = {
    copy: 'Copiar chave Pix',
    copied: 'Copiado! ✓',
    choose: 'Você escolheu:',
    now_copy: 'Agora é só copiar a chave abaixo!'
  };

  // --- AUTH LOGIC ---
  const loginOverlay = document.getElementById('login-overlay');
  const passwordInput = document.getElementById('password-input');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');

  const encodedPass = 'bm9pdm9z';

  function authenticate() {
    // btoa converte a entrada para Base64 para comparar com o segredo
    if (btoa(passwordInput.value) === encodedPass) {
      sessionStorage.setItem('authenticated', 'true');
      document.documentElement.classList.add('is-authenticated');
      loginOverlay.style.display = 'none';
    } else {
      loginError.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', authenticate);
  }

  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        authenticate();
      }
    });
  }

  // --- PIX COPY LOGIC ---
  const copyBtn = document.querySelector('.copy-btn');

  // Chave Pix decomposta para evitar detecção por robôs de spam
  const partA = '38652b38';
  const partB = 'ca28';
  const partC = '40f9';
  const partD = 'bd42';
  const partE = 'f27f8184bb10';
  const pixKey = `${partA}-${partB}-${partC}-${partD}-${partE}`;

  if (copyBtn) {
    // inicializa com texto traduzível
    copyBtn.textContent = t.copy;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pixKey).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = t.copied;
        copyBtn.classList.add('copied');

        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // --- ADDRESS COPY LOGIC ---
  const copyAddressBtn = document.querySelector('.copy-address-btn');
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const addressText = copyAddressBtn.getAttribute('data-address');
      navigator.clipboard.writeText(addressText).then(() => {
        const originalHTML = copyAddressBtn.innerHTML;
        copyAddressBtn.innerHTML = '<span class="link-icon">✓</span> Copiado!';
        copyAddressBtn.classList.add('copied');

        setTimeout(() => {
          copyAddressBtn.innerHTML = originalHTML;
          copyAddressBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // --- GIFT SELECTION LOGIC ---
  const giftItems = document.querySelectorAll('.gift-item');
  const pixLabelParagraph = document.querySelector('.pix-label p');
  const eventDateEl = document.getElementById('event-date');

  // Formata e aplica a data do evento via Intl
  if (eventDateEl && eventDateEl.dataset.date) {
    const d = new Date(eventDateEl.dataset.date);
    eventDateEl.textContent = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  }

  // Formata preços e configura seleção
  giftItems.forEach(item => {
    const priceEl = item.querySelector('.gift-price');
    if (priceEl && item.dataset.value) {
      priceEl.textContent = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(Number(item.dataset.value));
    }

    item.addEventListener('click', () => {
      // Remove selection from others
      giftItems.forEach(i => i.classList.remove('selected'));

      // Add selection to clicked item
      item.classList.add('selected');

      // Update Pix Label to show what was selected
      const giftName = item.querySelector('.gift-name').textContent;
      const giftPrice = item.querySelector('.gift-price').textContent;

      if (pixLabelParagraph) {
        pixLabelParagraph.innerHTML = `${t.choose} <strong>${giftName} (${giftPrice})</strong><br><small>${t.now_copy}</small>`;

        // Scroll to pix section
        document.querySelector('.pix-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
});

function setupSideCarousel(trackId, totalSlides, startIndex, interval) {
  const track = document.getElementById(trackId);
  const clone = track.children[0].cloneNode(true);
  track.appendChild(clone);

  let current = startIndex;
  let timer = null;

  function getSlideWidth() {
    return track.children[0].getBoundingClientRect().width;
  }

  function goTo(idx, animate = true) {
    track.style.transition = animate
      ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none';
    current = idx;
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
  }

  goTo(current, false);

  track.addEventListener('transitionend', () => {
    if (current === totalSlides) {
      goTo(0, false);
    }
  });

  function start() {
    if (timer) return;
    timer = setInterval(() => goTo(current + 1), interval);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  start();

  // Pausa quando a aba vai pra segundo plano, corrige e retoma quando volta
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      current = current > totalSlides ? 0 : current;
      goTo(current, false);
      start();
    }
  });

  window.addEventListener('resize', () => goTo(current, false));
}

setupSideCarousel('left-track', 4, 0, 3000);
setupSideCarousel('right-track', 4, 0, 3700);

// --- WHATSAPP RSVP LINK ---
const whatsappBtn = document.getElementById('whatsapp-rsvp-btn');
if (whatsappBtn) {
  const numero = '5511966467047'; // seu número com DDI + DDD, sem espaços ou símbolos
  const mensagem = 'Olá, Luan e Jéssica! Gostaria de confirmar minha presença no casamento de vocês.';
  whatsappBtn.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
