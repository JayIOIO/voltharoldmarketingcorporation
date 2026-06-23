/* ══════════════════════════════════════════
   VOLT HAROLD MARKETING CORPORATION
   Premium Motorcycle Dealership JS
   ══════════════════════════════════════════ */

'use strict';

// ── Helpers ──────────────────────────────
const qs = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

// ── DOM Ready ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollReveal();
    initCounters();
    initMotoCarousel();
    initTestimonialsSlider();
    initCarouselDots();
    initFloatCta();
    initActiveNav();
    initSmoothScroll();
    initMotoModal();
    initPageFinanceCalculator();
});

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
function initNav() {
    const header = qs('#navHeader');
    const hamburger = qs('#hamburger');
    const navLinks = qs('#navLinks');
    const overlay = qs('#navOverlay');

    // Scroll styling
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // Hamburger toggle
    function openMenu() {
        navLinks.classList.add('open');
        overlay.classList.add('active');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navLinks.classList.remove('open');
        overlay.classList.remove('active');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);

    // Close on nav link click (mobile)
    qsa('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });
}

/* ═══════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════ */
function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = qs(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 72; // nav height
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ═══════════════════════════════════════
   ACTIVE NAV HIGHLIGHTING
═══════════════════════════════════════ */
function initActiveNav() {
    const sections = qsa('section[id]');
    const navLinks = qsa('.nav-link');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.section === id);
                });
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
}

/* ═══════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════ */
function initScrollReveal() {
    const elements = qsa('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
                setTimeout(() => el.classList.add('visible'), delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   ANIMATED COUNTERS
═══════════════════════════════════════ */
function initCounters() {
    const counters = qsa('.stat-num[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            const duration = 1800;
            const step = target / (duration / 16);
            let current = 0;

            const tick = () => {
                current = Math.min(current + step, target);
                el.textContent = Math.floor(current);
                if (current < target) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* ═══════════════════════════════════════
   MOTORCYCLE CAROUSEL
═══════════════════════════════════════ */
function initMotoCarousel() {
    const track = qs('#motoTrack');
    const trackOuter = qs('#motoTrackOuter');
    const prevBtn = qs('#carouselPrev');
    const nextBtn = qs('#carouselNext');
    const dotsWrap = qs('#carouselDots');

    if (!track) return;

    const cards = qsa('.moto-card', track);
    let current = 0;
    let startX = 0,
        isDragging = false,
        startTranslate = 0,
        currentTranslate = 0;

    function getCardsPerView() {
        const w = window.innerWidth;
        if (w <= 768) return 1;
        if (w <= 1100) return 3;
        return 5;
    }

    function getCardWidth() {
        const w = window.innerWidth;
        if (w <= 768) return (w - 32) * 0.8;
        return null; // CSS grid handles it on desktop
    }

    function getMaxIndex() {
        const perView = getCardsPerView();
        return Math.max(0, cards.length - perView);
    }

    function buildDots() {
        dotsWrap.innerHTML = '';
        const maxIdx = getMaxIndex();
        for (let i = 0; i <= maxIdx; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === current ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        }
    }

    function updateDots() {
        qsa('.carousel-dot', dotsWrap).forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }

    function goTo(index) {
        const maxIdx = getMaxIndex();
        current = Math.max(0, Math.min(index, maxIdx));

        const w = window.innerWidth;
        if (w <= 768) {
            // Mobile: translate manually
            const cardW = getCardWidth() + 16;
            const translate = -current * cardW;
            track.style.transform = `translateX(${translate}px)`;
        } else {
            // Desktop: grid layout, just reveal appropriate cards
            track.style.transform = '';
        }

        if (prevBtn) prevBtn.disabled = current === 0;
        if (nextBtn) nextBtn.disabled = current >= getMaxIndex();
        updateDots();
    }

    function next() { goTo(current + 1); }

    function prev() { goTo(current - 1); }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Touch/drag on mobile
    trackOuter.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    trackOuter.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? next() : prev();
        }
    }, { passive: true });

    // Mouse drag (desktop)
    track.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        track.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
    });
    document.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = '';
        const diff = startX - e.clientX;
        if (Math.abs(diff) > 60) {
            diff > 0 ? next() : prev();
        }
    });

    // Keyboard
    trackOuter.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    });

    // Auto-play on mobile
    let autoplayTimer;

    function startAutoplay() {
        if (window.innerWidth > 768) return;
        autoplayTimer = setInterval(() => {
            if (current >= getMaxIndex()) goTo(0);
            else next();
        }, 3500);
    }

    function stopAutoplay() { clearInterval(autoplayTimer); }

    trackOuter.addEventListener('touchstart', stopAutoplay, { passive: true });
    trackOuter.addEventListener('touchend', startAutoplay, { passive: true });

    // Init
    buildDots();
    goTo(0);

    window.addEventListener('resize', () => {
        buildDots();
        goTo(0);
        stopAutoplay();
        startAutoplay();
    });

    startAutoplay();
}

function initCarouselDots() {
    // dots initialized inside initMotoCarousel
}

/* ═══════════════════════════════════════
   TESTIMONIALS SLIDER (MOBILE)
═══════════════════════════════════════ */
function initTestimonialsSlider() {
    const track = qs('#testimonialsTrack');
    const dotsWrap = qs('#testiDots');
    if (!track) return;

    const cards = qsa('.testimonial-card', track);
    let current = 0;
    let startX = 0;

    function isMobile() { return window.innerWidth <= 768; }

    function buildDots() {
        dotsWrap.innerHTML = '';
        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'testi-dot' + (i === current ? ' active' : '');
            dot.setAttribute('aria-label', `Review ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        });
    }

    function updateDots() {
        qsa('.testi-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function goTo(index) {
        if (!isMobile()) {
            track.style.transform = '';
            return;
        }
        current = Math.max(0, Math.min(index, cards.length - 1));
        track.style.transform = `translateX(-${current * 100}%)`;
        updateDots();
    }

    // Touch
    track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
        if (!isMobile()) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ?
                goTo(Math.min(current + 1, cards.length - 1)) :
                goTo(Math.max(current - 1, 0));
        }
    }, { passive: true });

    buildDots();
    goTo(0);

    window.addEventListener('resize', () => { goTo(0); });

    // Auto-rotate on mobile
    setInterval(() => {
        if (!isMobile()) return;
        goTo(current >= cards.length - 1 ? 0 : current + 1);
    }, 4500);
}

/* ═══════════════════════════════════════
   FLOATING CTA VISIBILITY
═══════════════════════════════════════ */
function initFloatCta() {
    const floatCta = qs('#floatCta');
    if (!floatCta) return;

    let shown = false;
    window.addEventListener('scroll', () => {
        const shouldShow = window.scrollY > 400;
        if (shouldShow !== shown) {
            shown = shouldShow;
            floatCta.classList.toggle('visible', shown);
        }
    }, { passive: true });
}

/* ═══════════════════════════════════════
   MICRO-INTERACTIONS: Button ripple
═══════════════════════════════════════ */
document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .moto-inquire-btn, .brand-explore-btn, .contact-action-btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    ripple.style.cssText = `
    position: absolute;
    width: ${size}px; height: ${size}px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    left: ${e.clientX - rect.left - size / 2}px;
    top: ${e.clientY - rect.top - size / 2}px;
    transform: scale(0);
    animation: ripple-anim 0.55s var(--ease-out-expo) forwards;
    pointer-events: none;
    z-index: 10;
  `;

    const prevPos = btn.style.position || getComputedStyle(btn).position;
    if (prevPos === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
@keyframes ripple-anim {
  to { transform: scale(1); opacity: 0; }
}
`;
document.head.appendChild(style);

/* ═══════════════════════════════════════
   IMAGE LAZY LOADING FALLBACK
═══════════════════════════════════════ */
if ('loading' in HTMLImageElement.prototype === false) {
    qsa('img[loading="lazy"]').forEach(img => {
        if (img.dataset.src) img.src = img.dataset.src;
    });
}

/* ═══════════════════════════════════════
   BRAND CARD HOVER TILT (DESKTOP)
═══════════════════════════════════════ */
qsa('.brand-card, .moto-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        if (window.innerWidth <= 768) return;
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width * 2;
        const dy = (e.clientY - cy) / rect.height * 2;
        card.style.transform = `translateY(-8px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ═══════════════════════════════════════
   MOTORCYCLE MODAL POPUP DATALINK CONTROLLER
═══════════════════════════════════════ */
function initMotoModal() {
    const modal = qs('#motoModal');
    const overlay = qs('#modalOverlay');
    const closeBtn = qs('#modalClose');
    const cards = qsa('.moto-card');

    if (!modal) return;

    const mImg = qs('#modalImg', modal);
    const mBrand = qs('#modalBrand', modal);
    const mName = qs('#modalName', modal);
    const mPrice = qs('#modalPrice', modal);
    const mSpecsList = qs('#modalSpecsList', modal);
    const mColorsList = qs('#modalColorsList', modal);
    const mFeaturesList = qs('#modalFeaturesList', modal);
    const mInquireBtn = qs('#modalInquireBtn', modal);

    // Helper color map dictionary to match text strings with structural css background rendering tokens
    const colorHexMap = {
        'red': '#e8001c',
        'black': '#111111',
        'blue': '#0055df',
        'gray': '#777777',
        'bronze': '#8a7355',
        'white': '#ffffff',
        'matte gunpowder black': '#222222',
        'matte solar red': '#c01020',
        'matte gray': '#444444',
        'off-white': '#f5f5f5',
        'matte dark gray': '#333333',
        'matte burgundy': '#58111a',
        'sword gray': '#555e65',
        'metallic matte black': '#1c2024',
        'matte bordeaux red': '#6b1d2f',
        'candy jackal blue': '#103470',
        'titan black': '#191b1f',
        'summer red': '#d6222e'
    };

    function openModal(card) {
        const brand = qs('.moto-brand', card).textContent;
        const name = qs('.moto-name', card).textContent;
        const price = qs('.moto-price', card).innerHTML;
        const imgUrl = qs('img', card).src;
        const specs = qsa('.moto-specs span:not(.spec-dot)', card);

        // Read raw CSV string configurations from HTML data fields
        const rawColors = card.getAttribute('data-colors') || '';
        const rawFeatures = card.getAttribute('data-features') || '';

        // Assign Base Parameters
        mImg.src = imgUrl;
        mImg.alt = name;
        mBrand.textContent = brand;
        mName.textContent = name;
        mPrice.innerHTML = price;

        // A. Inject Specifications Elements
        mSpecsList.innerHTML = '';
        specs.forEach(spec => {
            const el = document.createElement('div');
            el.className = 'modal-spec-badge';
            el.textContent = spec.textContent;
            mSpecsList.appendChild(el);
        });

        // B. Inject Color Option Flex Blocks
        mColorsList.innerHTML = '';
        if (rawColors) {
            rawColors.split(',').forEach(colorStr => {
                const nameClean = colorStr.trim();
                const lower = nameClean.toLowerCase();

                const token = document.createElement('div');
                token.className = 'modal-color-token';

                const circle = document.createElement('div');
                circle.className = 'modal-color-circle';
                if (colorHexMap[lower]) {
                    circle.style.backgroundColor = colorHexMap[lower];
                }

                const label = document.createElement('span');
                label.textContent = nameClean;

                token.appendChild(circle);
                token.appendChild(label);
                mColorsList.appendChild(token);
            });
        }

        // C. Inject Features Unordered Checklist
        mFeaturesList.innerHTML = '';
        if (rawFeatures) {
            rawFeatures.split(',').forEach(featStr => {
                const item = document.createElement('li');
                item.textContent = featStr.trim();
                mFeaturesList.appendChild(item);
            });
        }

        // Fire state change trigger animations
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent open events if user targets standard inline inquire targets directly
            if (e.target.closest('.moto-inquire-btn')) return;
            openModal(card);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    if (mInquireBtn) mInquireBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
}

/* ═══════════════════════════════════════════
   EMBEDDED PAGE FINANCING CALCULATOR ENGINE
═══════════════════════════════════════════ */
function initPageFinanceCalculator() {
    const bikeSelect = qs('#calcBikeSelect');
    const dpSelect = qs('#calcDpSelect');
    const termSelect = qs('#calcTermSelect');

    if (!bikeSelect || !dpSelect || !termSelect) return;

    const dpOutput = qs('#pageDpValue');
    const monthlyOutput = qs('#pageMonthlyValue');
    const submitBtn = qs('.calc-submit-btn'); // Targets the request button

    function updatePageCalculations() {
        const srp = parseFloat(bikeSelect.value);
        const dpPct = parseFloat(dpSelect.value);
        const months = parseInt(termSelect.value);

        // Get text values for matching labels
        const bikeName = bikeSelect.options[bikeSelect.selectedIndex].text;
        const dpLabel = dpSelect.options[dpSelect.selectedIndex].text;
        const termLabel = termSelect.options[termSelect.selectedIndex].text;

        // Run computation rates formula
        const downpaymentAmount = srp * dpPct;
        const loanAmount = srp - downpaymentAmount;

        // Flat 4.5% annual interest multiplier
        const annualInterestRate = 0.045;
        const totalInterest = loanAmount * (annualInterestRate * (months / 12));
        const totalPayable = loanAmount + totalInterest;
        const monthlyAmortization = totalPayable / months;

        const formattedDp = '₱' + Math.round(downpaymentAmount).toLocaleString();
        const formattedMonthly = '₱' + Math.round(monthlyAmortization).toLocaleString();

        // Render formatted currency text on screen
        dpOutput.textContent = formattedDp;
        monthlyOutput.textContent = formattedMonthly;

        // Create an automated context text message for your business channels
        const messageBody = `Hi Volt Harold Marketing! I am interested in inquiring about the following financing deal calculated on your website:
• Model: ${bikeName}
• Downpayment Chosen: ${dpLabel} (${formattedDp})
• Terms Chosen: ${termLabel}
• Estimated Amortization: ${formattedMonthly}/mo.

Please assist me with the next application requirements!`;

        // Action Hook: Smoothly update the bottom Contact links dynamically based on calculation choices
        updateContactLinksWithFinancingData(messageBody);
    }

    function updateContactLinksWithFinancingData(textMessage) {
        const encodedMessage = encodeURIComponent(textMessage);

        // 1. Target SMS button link if present
        const smsBtn = qs('.contact-action-btn.sms-btn');
        if (smsBtn) {
            smsBtn.setAttribute('href', `sms:09338224649?body=${encodedMessage}`);
        }

        // 2. Adjust click listener for the main "Request Financing Information" block
        // This will copy the summary data to the user's clipboard and seamlessly guide them down to choose their agent contact platform
        if (submitBtn) {
            // Remove previous event listener clones to prevent stacking bugs
            const newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

            newSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();

                // Copy the calculation data onto their clipboard so they can effortlessly paste it inside Facebook Messenger or a form
                navigator.clipboard.writeText(textMessage).then(() => {
                    alert(`✅ Computation copied to clipboard!\n\nWe are scrolling you down to our contact methods. Simply tap 'Message Us on Facebook' or 'Send SMS' and paste your copied text directly into the chat!`);
                }).catch(() => {
                    // Fallback if permission is blocked by browser security sandbox policies
                });

                // Smooth scroll to the updated call action center channel
                const targetSection = qs('#contact');
                if (targetSection) {
                    const offset = 72;
                    const top = targetSection.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        }
    }

    // Attach event change listeners to form selectors
    bikeSelect.addEventListener('change', updatePageCalculations);
    dpSelect.addEventListener('change', updatePageCalculations);
    termSelect.addEventListener('change', updatePageCalculations);

    // Run calculation immediately on load
    updatePageCalculations();
}