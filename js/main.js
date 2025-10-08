
document.querySelectorAll('.offcanvas a.nav-link[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault(); // 🔴 previene que el navegador haga el scroll “por defecto”

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        const offcanvasEl = document.getElementById('offcanvasMenu');
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);

        if (bsOffcanvas) {
            bsOffcanvas.hide(); // 🟢 cierra el menú
        }

        // Espera a que el offcanvas se cierre antes de hacer scroll
        setTimeout(() => {
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' }); // 🟢 scroll suave hacia sección
            }
        }, 300); // 🔴 300ms coincide con la duración de la animación de cierre
    });
});





document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('btnServices');
    if (button) {
        const mq = window.matchMedia('(max-width: 991.98px)');
        button.addEventListener('click', () => {
            const isMobile = mq.matches;
            const section = isMobile ? document.getElementById('services_others') : document.getElementById('services_desktop');
            if (!section) return;
            section.setAttribute('tabindex', '-1');
            section.focus({ preventScroll: true });
            section.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// JS específico para #services_others (usa .scroll-dots-services)

document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('services_others');
    if (!section) return;

    const scrollContainer = section.querySelector('.scroll');
    if (!scrollContainer) return;

    // Busca o crea el container de dots con la clase .scroll-dots-services
    let dotsContainer = section.querySelector('.scroll-dots-services');
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'scroll-dots-services d-flex justify-content-center mt-3';
        dotsContainer.setAttribute('role', 'tablist');
        dotsContainer.setAttribute('aria-label', 'Servicios navegación');
        section.appendChild(dotsContainer);
    }

    const cards = Array.from(scrollContainer.querySelectorAll('.card'));
    if (!cards.length) return;

    let cardsPerView = 1;
    let pages = 1;
    let currentPage = 0;
    let resizeTimer = null;

    const getGap = () => {
        const csScroll = getComputedStyle(scrollContainer);
        const gapStr = csScroll.gap || csScroll.columnGap || csScroll['-webkit-column-gap'] || '';
        const gap = parseFloat(gapStr) || 20;
        return gap;
    };

    const calculateCardsPerView = () => {
        const containerW = scrollContainer.clientWidth;
        const gap = getGap();
        const cardRect = cards[0].getBoundingClientRect();
        const cardW = cardRect.width;
        let perView = Math.floor((containerW + gap) / (cardW + gap));
        if (perView < 1) perView = 1;
        if (perView > cards.length) perView = cards.length;
        return perView;
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
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => goToPage(i));
            btn.addEventListener('keydown', (ev) => {
                if (ev.key === 'ArrowRight') goToPage(Math.min(i + 1, pages - 1));
                else if (ev.key === 'ArrowLeft') goToPage(Math.max(i - 1, 0));
            });
            dotsContainer.appendChild(btn);
        }
    };

    const setActiveDot = (pageIndex) => {
        const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
        dots.forEach((d, idx) => {
            const active = idx === pageIndex;
            d.classList.toggle('active', active);
            d.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        currentPage = pageIndex;
    };

    const goToPage = (pageIndex) => {
        const targetCardIndex = pageIndex * cardsPerView;
        const targetCard = cards[targetCardIndex];
        if (!targetCard) return;
        scrollContainer.scrollTo({
            left: Math.max(0, targetCard.offsetLeft),
            behavior: 'smooth'
        });
        setActiveDot(pageIndex);
    };

    const updateActiveFromScroll = () => {
        const containerCenter = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
        let closestIdx = 0;
        let closestDistance = Infinity;
        cards.forEach((card, i) => {
            const center = card.offsetLeft + card.offsetWidth / 2;
            const dist = Math.abs(center - containerCenter);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestIdx = i;
            }
        });
        const pageIndex = Math.floor(closestIdx / cardsPerView);
        setActiveDot(Math.min(pageIndex, pages - 1));
    };

    const snapToNearestPage = () => {
        cardsPerView = calculateCardsPerView();
        pages = Math.ceil(cards.length / cardsPerView);
        const containerCenter = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
        let closestIdx = 0;
        let closestDistance = Infinity;
        cards.forEach((card, i) => {
            const center = card.offsetLeft + card.offsetWidth / 2;
            const dist = Math.abs(center - containerCenter);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestIdx = i;
            }
        });
        const pageIndex = Math.floor(closestIdx / cardsPerView);
        goToPage(Math.min(pageIndex, pages - 1));
    };

    const init = () => {
        cardsPerView = calculateCardsPerView();
        pages = Math.ceil(cards.length / cardsPerView);
        createDots();
        setActiveDot(0);
    };

    let isTouching = false;
    let startX = 0;
    let startScroll = 0;

    scrollContainer.addEventListener('touchstart', (e) => {
        isTouching = true;
        startX = e.touches[0].pageX;
        startScroll = scrollContainer.scrollLeft;
    }, { passive: true });

    scrollContainer.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const x = e.touches[0].pageX;
        const walk = startX - x;
        scrollContainer.scrollLeft = startScroll + walk;
    }, { passive: true });

    scrollContainer.addEventListener('touchend', () => {
        isTouching = false;
        snapToNearestPage();
    });

    let isDown = false;
    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX;
        startScroll = scrollContainer.scrollLeft;
        scrollContainer.classList.add('is-dragging');
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const walk = startX - e.pageX;
        scrollContainer.scrollLeft = startScroll + walk;
    });
    window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        scrollContainer.classList.remove('is-dragging');
        snapToNearestPage();
    });

    let rafId = null;
    const onScroll = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updateActiveFromScroll);
    };
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const prevPage = currentPage || 0;
            init();
            goToPage(Math.min(prevPage, pages - 1));
        }, 120);
    });

    init();
});

// JS específico para #reviews (usa .scroll-dots)
document.addEventListener("DOMContentLoaded", () => {
    const scrollContainer = document.querySelector('.scroll_reviews');
    const dotsContainer = document.querySelector('.scroll-dots');

    if (scrollContainer && dotsContainer) {
        const cards = Array.from(scrollContainer.querySelectorAll('.card_reviews'));
        let index = 0;
        let cardsPerView = 1;
        scrollContainer.setAttribute("tabindex", "0");
        dotsContainer.setAttribute("aria-live", "polite");

        function adjustCardWidth() {
            const containerWidth = scrollContainer.offsetWidth;
            cardsPerView = containerWidth < 600 ? 1 :
                containerWidth < 900 ? 2 : 3;
            const newWidth = (containerWidth - (cardsPerView - 1) * 20) / cardsPerView;
            cards.forEach(card => card.style.width = `${newWidth}px`);
        }

        function calculateCardsPerView() {
            const containerWidth = scrollContainer.offsetWidth;
            const cardWidth = cards[0].offsetWidth + 20;
            cardsPerView = Math.max(1, Math.floor(containerWidth / cardWidth));
        }

        function createDots() {
            dotsContainer.innerHTML = '';
            const totalDots = Math.ceil(cards.length / cardsPerView);
            for (let i = 0; i < totalDots; i++) {
                const btn = document.createElement('button');
                btn.classList.add('dot');
                btn.setAttribute('aria-label', `Slide ${i + 1}`);
                btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                btn.addEventListener('click', () => scrollToIndex(i));
                dotsContainer.appendChild(btn);
            }
        }

        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => dot.setAttribute('aria-selected', i === index ? 'true' : 'false'));
        }

        function scrollToIndex(i) {
            const target = i * cardsPerView;
            const targetCard = cards[target];
            if (!targetCard) return;
            scrollContainer.scrollTo({ left: targetCard.offsetLeft, behavior: 'smooth' });
            index = i;
            updateDots();
        }

        // Actualiza dots al hacer scroll manual
        scrollContainer.addEventListener("scroll", () => {
            const containerCenter = scrollContainer.scrollLeft + scrollContainer.offsetWidth / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;
            cards.forEach((card, i) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(cardCenter - containerCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            });
            index = Math.floor(closestIndex / cardsPerView);
            updateDots();
        });

        // Swipe táctil
        let startX = 0;
        let scrollStart = 0;
        let isDragging = false;

        scrollContainer.addEventListener('touchstart', e => {
            startX = e.touches[0].pageX;
            scrollStart = scrollContainer.scrollLeft;
            isDragging = true;
        });

        scrollContainer.addEventListener('touchmove', e => {
            if (!isDragging) return;
            const x = e.touches[0].pageX;
            const walk = startX - x;
            scrollContainer.scrollLeft = scrollStart + walk;
        });

        scrollContainer.addEventListener('touchend', () => { isDragging = false; });

        // Flechas de teclado
        scrollContainer.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight' && index < Math.ceil(cards.length / cardsPerView) - 1) scrollToIndex(index + 1);
            if (e.key === 'ArrowLeft' && index > 0) scrollToIndex(index - 1);
        });

        // Inicializar
        adjustCardWidth();
        calculateCardsPerView();
        createDots();
        updateDots();

        // Recalcular al redimensionar
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                adjustCardWidth();
                calculateCardsPerView();
                createDots();
                updateDots();
            }, 150);
        });
    }
});

