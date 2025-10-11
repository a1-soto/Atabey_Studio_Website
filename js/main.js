/**
 * ============================================
 * JS Modular para Scroll, Offcanvas y Modals
 * ============================================
 */
// Selecciona todos los modales
document.querySelectorAll('.modal').forEach(modal => {

    // Cuando el modal se abre
    modal.addEventListener('shown.bs.modal', () => {
        // Opcional: enfocar un input dentro del modal
        const inputFocus = modal.querySelector('input, textarea, button');
        if(inputFocus) inputFocus.focus();

        // Evitar scroll del body
        document.body.style.overflow = 'hidden';
    });

    // Cuando el modal se cierra
    modal.addEventListener('hidden.bs.modal', () => {
        // Restaurar scroll del body
        document.body.style.overflow = '';
    });

});

/* ======================
   SCROLL SUAVE PARA MENÚ OFFCANVAS
====================== */
const initOffcanvasScroll = () => {
    const offcanvasLinks = document.querySelectorAll('.offcanvas a.nav-link[href^="#"]');

    offcanvasLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            const offcanvasEl = document.getElementById('offcanvasMenu');
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);

            if (bsOffcanvas && targetElement) {
                offcanvasEl.addEventListener('hidden.bs.offcanvas', function handler() {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    offcanvasEl.removeEventListener('hidden.bs.offcanvas', handler);
                });
                bsOffcanvas.hide();
            } else if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
};

/* ======================
   BOTÓN "SERVICES" PARA SCROLL
====================== */
const initBtnServices = () => {
    const button = document.getElementById('btnServices');
    if (!button) return;

    const mq = window.matchMedia('(max-width: 991.98px)');

    button.addEventListener('click', () => {
        const isMobile = mq.matches;
        const section = isMobile ? document.getElementById('services_others') : document.getElementById('services_desktop');
        if (!section) return;
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        section.scrollIntoView({ behavior: 'smooth' });
    });
};

/* ======================
   SCROLL DOTS PARA UN CONTENEDOR DE CARDS
   Reusable function
====================== */
const initScrollDots = (containerSelector, dotContainerSelector, cardSelector) => {
    const scrollContainer = document.querySelector(containerSelector);
    const dotsContainer = document.querySelector(dotContainerSelector);
    if (!scrollContainer || !dotsContainer) return;

    const cards = Array.from(scrollContainer.querySelectorAll(cardSelector));
    if (!cards.length) return;

    let cardsPerView = 1;
    let pages = 1;
    let currentPage = 0;
    let resizeTimer;

    // Calcular cuántas cards caben en la vista
    const calculateCardsPerView = () => {
        const gap = parseFloat(getComputedStyle(scrollContainer).gap) || 20;
        const cardW = cards[0].getBoundingClientRect().width;
        let perView = Math.floor((scrollContainer.clientWidth + gap) / (cardW + gap));
        return Math.max(1, Math.min(perView, cards.length));
    };

    const updateDots = () => {
        const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
        dots.forEach((dot, idx) => dot.setAttribute('aria-selected', idx === currentPage ? 'true' : 'false'));
    };

    const goToPage = (pageIndex) => {
        const targetCard = cards[pageIndex * cardsPerView];
        if (!targetCard) return;
        scrollContainer.scrollTo({ left: targetCard.offsetLeft, behavior: 'smooth' });
        currentPage = pageIndex;
        updateDots();
    };

    const createDots = () => {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < pages; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dot btn-sm rounded-circle me-2';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', `Slide ${i + 1}`);
            btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            btn.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(btn);
        }
    };

    const updateFromScroll = () => {
        const center = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
        let closestIdx = 0;
        let closestDistance = Infinity;
        cards.forEach((card, i) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(center - cardCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIdx = i;
            }
        });
        currentPage = Math.floor(closestIdx / cardsPerView);
        updateDots();
    };

    const snapToNearestPage = () => {
        cardsPerView = calculateCardsPerView();
        pages = Math.ceil(cards.length / cardsPerView);
        goToPage(currentPage);
    };

    // Inicialización
    const init = () => {
        cardsPerView = calculateCardsPerView();
        pages = Math.ceil(cards.length / cardsPerView);
        createDots();
        goToPage(0);
    };

    // Eventos
    scrollContainer.addEventListener('scroll', () => requestAnimationFrame(updateFromScroll));
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(snapToNearestPage, 120);
    });

    // Swipe táctil
    let startX = 0, startScroll = 0, isDragging = false;
    scrollContainer.addEventListener('touchstart', e => { isDragging = true; startX = e.touches[0].pageX; startScroll = scrollContainer.scrollLeft; });
    scrollContainer.addEventListener('touchmove', e => { if (!isDragging) return; scrollContainer.scrollLeft = startScroll + (startX - e.touches[0].pageX); });
    scrollContainer.addEventListener('touchend', () => { isDragging = false; snapToNearestPage(); });

    // Drag con mouse
    scrollContainer.addEventListener('mousedown', e => { isDragging = true; startX = e.pageX; startScroll = scrollContainer.scrollLeft; scrollContainer.classList.add('is-dragging'); });
    window.addEventListener('mousemove', e => { if (!isDragging) return; scrollContainer.scrollLeft = startScroll + (startX - e.pageX); });
    window.addEventListener('mouseup', () => { if (!isDragging) return; isDragging = false; scrollContainer.classList.remove('is-dragging'); snapToNearestPage(); });

    init();
};

/* ======================
   INICIALIZACIÓN GENERAL
====================== */
document.addEventListener('DOMContentLoaded', () => {
    initOffcanvasScroll();
    initBtnServices();
    // Services
    initScrollDots('#services_others .scroll', '#services_others .scroll-dots-services', '.card');
    // Reviews
    initScrollDots('.scroll_reviews', '.scroll-dots', '.card_reviews');
});
