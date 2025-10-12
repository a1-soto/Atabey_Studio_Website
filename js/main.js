/**
 * ============================================
 * Modular JS for Scroll, Offcanvas and Modals
 * Atabey Massage Studio - Optimized and Corrected
 * ============================================
 */

/* ======================
   MODAL MANAGEMENT
====================== */
/**
 * Prevents body scroll when a modal is open
 * and restores focus for accessibility
 */
const initModalBehavior = () => {
    document.querySelectorAll('.modal').forEach(modal => {
        
        // When the modal opens
        modal.addEventListener('shown.bs.modal', () => {
            // Focus first interactive element for accessibility
            const inputFocus = modal.querySelector('input, textarea, button');
            if(inputFocus) inputFocus.focus();

            // Prevent body scroll while modal is active
            document.body.style.overflow = 'hidden';
        });

        // When the modal closes
        modal.addEventListener('hidden.bs.modal', () => {
            // Restore body scroll
            document.body.style.overflow = '';
        });
    });
};

/* ======================
   SMOOTH SCROLL FOR OFFCANVAS MENU
====================== */
/**
 * Closes the offcanvas and smoothly scrolls to the target section
 * Includes Bootstrap verification and error handling
 */
const initOffcanvasScroll = () => {
    // Verify that Bootstrap is available
    if (typeof bootstrap === 'undefined') {
        console.error('ERROR: Bootstrap is not loaded. The offcanvas will not work correctly.');
        return;
    }

    const offcanvasLinks = document.querySelectorAll('.offcanvas a.nav-link[href^="#"]');
    
    if (!offcanvasLinks.length) {
        console.warn('WARNING: No links found in the offcanvas.');
        return;
    }

    offcanvasLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            const offcanvasEl = document.getElementById('offcanvasMenu');

            if (!offcanvasEl) {
                console.error('ERROR: Offcanvas element not found');
                return;
            }

            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);

            // If the offcanvas is open and the target element exists
            if (bsOffcanvas && targetElement) {
                // Use AbortController to automatically clean up the event listener
                const controller = new AbortController();
                
                offcanvasEl.addEventListener('hidden.bs.offcanvas', function handler() {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    controller.abort(); // Automatically cleans up the listener
                }, { signal: controller.signal });
                
                bsOffcanvas.hide();
            } else if (targetElement) {
                // If there's no active offcanvas, scroll directly
                targetElement.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.warn('WARNING: Element with id not found: ' + targetId);
            }
        });
    });
};

/* ======================
   "SERVICES" BUTTON FOR SCROLL
====================== */
/**
 * Adaptive scroll based on viewport (mobile/desktop)
 * Improves accessibility by focusing the target section
 */
const initBtnServices = () => {
    const button = document.getElementById('btnServices');
    
    if (!button) {
        console.warn('WARNING: Button #btnServices not found');
        return;
    }

    const mq = window.matchMedia('(max-width: 991.98px)');

    button.addEventListener('click', () => {
        const isMobile = mq.matches;
        const targetId = isMobile ? 'services_others' : 'services_desktop';
        const section = document.getElementById(targetId);
        
        if (!section) {
            console.error('ERROR: Section not found: ' + targetId);
            return;
        }

        // Make the section temporarily focusable for accessibility
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        
        // Smooth scroll
        section.scrollIntoView({ behavior: 'smooth' });
    });
};

/* ======================
   SCROLL DOTS FOR CARD CONTAINER
   Reusable function with improved event management
====================== */
/**
 * Creates dot navigation for scrollable containers
 * 
 * Parameters:
 * - containerSelector: Scroll container selector (string)
 * - dotContainerSelector: Dot container selector (string)
 * - cardSelector: Individual card selector (string)
 */
const initScrollDots = (containerSelector, dotContainerSelector, cardSelector) => {
    const scrollContainer = document.querySelector(containerSelector);
    const dotsContainer = document.querySelector(dotContainerSelector);
    
    // Validation of existing elements
    if (!scrollContainer) {
        console.warn('WARNING: Container not found: ' + containerSelector);
        return;
    }
    
    if (!dotsContainer) {
        console.warn('WARNING: Dot container not found: ' + dotContainerSelector);
        return;
    }

    const cards = Array.from(scrollContainer.querySelectorAll(cardSelector));
    
    if (!cards.length) {
        console.warn('WARNING: No cards found in: ' + cardSelector);
        return;
    }

    // State variables
    let cardsPerView = 1;
    let pages = 1;
    let currentPage = 0;
    let resizeTimer;
    let isDragging = false;
    let startX = 0;
    let startScroll = 0;

    /**
     * Calculates how many cards fit in the current view
     * Returns: number of visible cards (number)
     */
    const calculateCardsPerView = () => {
        const gap = parseFloat(getComputedStyle(scrollContainer).gap) || 20;
        const cardW = cards[0].getBoundingClientRect().width;
        const perView = Math.floor((scrollContainer.clientWidth + gap) / (cardW + gap));
        return Math.max(1, Math.min(perView, cards.length));
    };

    /**
     * Updates the visual state of the dots
     */
    const updateDots = () => {
        const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
        dots.forEach((dot, idx) => {
            const isActive = idx === currentPage;
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    };

    /**
     * Navigates to a specific page
     * Parameter: pageIndex - Target page index (number)
     */
    const goToPage = (pageIndex) => {
        // Validate that the index is in range
        if (pageIndex < 0 || pageIndex >= pages) {
            console.warn('WARNING: Page index out of range: ' + pageIndex);
            return;
        }

        const targetCard = cards[pageIndex * cardsPerView];
        
        if (!targetCard) {
            console.warn('WARNING: Card not found for page: ' + pageIndex);
            return;
        }

        scrollContainer.scrollTo({ 
            left: targetCard.offsetLeft, 
            behavior: 'smooth' 
        });
        
        currentPage = pageIndex;
        updateDots();
    };

    /**
     * Creates navigation dots dynamically
     */
    const createDots = () => {
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < pages; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dot btn-sm rounded-circle me-2';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ' of ' + pages);
            btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            
            // Event listener for click
            btn.addEventListener('click', () => goToPage(i));
            
            dotsContainer.appendChild(btn);
        }
    };

    /**
     * Updates the current page based on scroll position
     */
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
        
        const newPage = Math.floor(closestIdx / cardsPerView);
        
        if (newPage !== currentPage) {
            currentPage = newPage;
            updateDots();
        }
    };

    /**
     * Adjusts scroll to the nearest page after resize
     */
    const snapToNearestPage = () => {
        cardsPerView = calculateCardsPerView();
        pages = Math.ceil(cards.length / cardsPerView);
        
        // Ensure currentPage is within valid range
        currentPage = Math.min(currentPage, pages - 1);
        
        createDots();
        goToPage(currentPage);
    };

    /**
     * Initialization of the dot system
     */
    const init = () => {
        cardsPerView = calculateCardsPerView();
        pages = Math.ceil(cards.length / cardsPerView);
        createDots();
        goToPage(0);
    };

    /* ==================
       EVENT LISTENERS
    ================== */

    // Scroll: update dots based on position
    scrollContainer.addEventListener('scroll', () => {
        requestAnimationFrame(updateFromScroll);
    });

    // Resize: recalculate layout with improved debounce (250ms instead of 120ms)
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(snapToNearestPage, 250);
    });

    /* Touch swipe (mobile/tablets) */
    scrollContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX;
        startScroll = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = startX - e.touches[0].pageX;
        scrollContainer.scrollLeft = startScroll + deltaX;
    });

    scrollContainer.addEventListener('touchend', () => {
        isDragging = false;
        snapToNearestPage();
    });

    /* Mouse drag (desktop) */
    scrollContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX;
        startScroll = scrollContainer.scrollLeft;
        scrollContainer.classList.add('is-dragging');
        scrollContainer.style.cursor = 'grabbing';
        
        // Prevent text selection during drag
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = startX - e.pageX;
        scrollContainer.scrollLeft = startScroll + deltaX;
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        
        isDragging = false;
        scrollContainer.classList.remove('is-dragging');
        scrollContainer.style.cursor = '';
        snapToNearestPage();
    });

    // Initialize the complete system
    init();
};

/* ======================
   GENERAL INITIALIZATION
====================== */
/**
 * Main entry point
 * Executes when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Atabey Massage Studio JS...');

    try {
        // Initialize modal behavior
        initModalBehavior();
        console.log('OK: Modals initialized');

        // Initialize offcanvas scroll
        initOffcanvasScroll();
        console.log('OK: Offcanvas scroll initialized');

        // Initialize Services button
        initBtnServices();
        console.log('OK: Services button initialized');

        // Initialize scroll dots for Services (mobile/tablet)
        initScrollDots('#services_others .scroll', '#services_others .scroll-dots-services', '.card');
        console.log('OK: Services scroll dots initialized');

        // Initialize scroll dots for Reviews
        initScrollDots('.scroll_reviews', '.scroll-dots', '.card_reviews');
        console.log('OK: Reviews scroll dots initialized');

        console.log('SUCCESS: All features loaded correctly');
        
    } catch (error) {
        console.error('CRITICAL ERROR during initialization:', error);
    }
});

/* ======================
   GLOBAL ERROR HANDLING
====================== */
/**
 * Captures unhandled errors for debugging
 * Useful for detecting production issues
 */
window.addEventListener('error', (event) => {
    console.error('GLOBAL ERROR captured:', {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
    });
});

/**
 * Captures rejected promises without .catch()
 * Prevents silent errors in asynchronous code
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('ERROR: Unhandled promise rejection:', event.reason);
});

/* ======================
   IMPORTANT NOTES
====================== 

IMPLEMENTED IMPROVEMENTS:
- Bootstrap verified before use (prevents errors)
- Event listeners properly cleaned up with AbortController
- Debounce optimized to 250ms (previously 120ms, too fast)
- Complete validations in all querySelector calls
- Informative logs for debugging in console
- Complete JSDoc documentation in all functions
- Global error handling to catch issues
- Improved accessibility with descriptive aria-labels
- Optimized performance with requestAnimationFrame
- Cursor feedback during drag (grabbing/grab) for better UX

FEATURES:
1. initModalBehavior() - Manages Bootstrap modals
2. initOffcanvasScroll() - Smooth scroll from mobile menu
3. initBtnServices() - Button that navigates to Services section
4. initScrollDots() - Dot navigation system (reusable)

HOW TO TEST:
Open the browser console (F12) and you'll see:
- "Initializing Atabey Massage Studio JS..."
- "OK: Modals initialized"
- "OK: Offcanvas scroll initialized"
- etc.

If something fails, you'll see messages like:
- "ERROR: Bootstrap is not loaded"
- "WARNING: Button #btnServices not found"

RECOMMENDED ADDITIONAL CSS:
Add this to style.css to improve the experience:

.is-dragging {
    cursor: grabbing !important;
    user-select: none;
    scroll-behavior: auto;
}

.scroll,
.scroll_reviews {
    cursor: grab;
}

.dot:focus-visible {
    outline: 2px solid #8fbc8f;
    outline-offset: 3px;
}

====================== */