/**
 * JNYXR PORTFOLIO - MAIN INTERACTION SCRIPT
 * Scrapbook Noir Style Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileMenu();
    initScrollReveal();
    initCarousel();
    initHeartButtons();
    initTiltOnHover();
    initSparkleTrail();
    initThemeDyePicker();
    initProjectLightbox();
});

/* ==========================================================================
   1. Navbar Scroll Effect (Optimized for smooth 60fps scrolling)
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar-container');
    
    function checkScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
}

/* ==========================================================================
   2. Mobile Drawer Navigation Menu
   ========================================================================== */
function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const closeBtn = document.querySelector('.mobile-menu-close');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const links = document.querySelectorAll('.mobile-link-item');

    function openMenu() {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);

    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('active') && 
            !drawer.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
            closeMenu();
        }
    });
}

/* ==========================================================================
   3. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

/* ==========================================================================
   4. Interactive Project Carousel & Sorting
   ========================================================================== */
function initCarousel() {
    const track = document.querySelector('.projects-carousel-track');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const sortSelect = document.getElementById('project-sort-select');

    if (!track) return;

    let cards = Array.from(track.children);
    let currentIndex = 0;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateCarousel() {
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].getBoundingClientRect().width;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap || style.gap) || 0;
        
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, cards.length - cardsPerView);
        
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        const amountToMove = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${amountToMove}px)`;

        updateDots(maxIndex);
        updateArrowStates(maxIndex);
    }

    function generateDots(maxIndex) {
        dotsContainer.innerHTML = '';
        const dotsCount = maxIndex + 1;
        
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to Slide ${i + 1}`);
            
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots(maxIndex) {
        const currentDotsCount = dotsContainer.children.length;
        const expectedDotsCount = maxIndex + 1;

        if (currentDotsCount !== expectedDotsCount) {
            generateDots(maxIndex);
        } else {
            const dots = Array.from(dotsContainer.children);
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    function updateArrowStates(maxIndex) {
        if (currentIndex === 0) {
            prevBtn.style.opacity = '0.35';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'all';
        }

        if (currentIndex >= maxIndex) {
            nextBtn.style.opacity = '0.35';
            nextBtn.style.pointerEvents = 'none';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'all';
        }
    }

    nextBtn.addEventListener('click', () => {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, cards.length - cardsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    sortSelect.addEventListener('change', () => {
        const order = sortSelect.value;
        
        // Fade out cards first
        cards.forEach(card => card.classList.add('fade-out'));
        
        setTimeout(() => {
            cards.sort((cardA, cardB) => {
                const dateA = new Date(cardA.getAttribute('data-date'));
                const dateB = new Date(cardB.getAttribute('data-date'));
                
                return order === 'newest' ? dateB - dateA : dateA - dateB;
            });

            cards.forEach(card => track.appendChild(card));
            
            currentIndex = 0;
            updateCarousel();
            
            requestAnimationFrame(() => {
                cards.forEach(card => card.classList.remove('fade-out'));
            });
        }, 400);
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 150);
    });

    updateCarousel();
}

/* ==========================================================================
   5. Project Bookmarks (Heart click transitions)
   ========================================================================== */
function initHeartButtons() {
    const heartBtns = document.querySelectorAll('.project-love-btn');

    heartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Avoid opening lightbox on heart click
            btn.classList.toggle('active');
            
            const icon = btn.querySelector('i');
            if (btn.classList.contains('active')) {
                icon.className = 'fa-solid fa-heart';
                btn.style.color = '#e04f5f';
                btn.style.transform = 'scale(1.3)';
                setTimeout(() => btn.style.transform = '', 200);
            } else {
                icon.className = 'fa-regular fa-heart';
                btn.style.color = '';
            }
        });
    });
}

/* ==========================================================================
   6. 3D Parallax Tilt Effect & Shadow Shifts on Scrapbook Frames (Subtle & Jitter-Free)
   ========================================================================== */
function initTiltOnHover() {
    const targets = document.querySelectorAll('.hero-polaroid-main, .project-photo-wrap');

    targets.forEach(target => {
        const frame = target.querySelector('.polaroid-frame');
        if (!frame) return;

        target.addEventListener('mousemove', (e) => {
            const rect = target.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xNormalized = (x / rect.width) - 0.5;
            const yNormalized = (y / rect.height) - 0.5;
            
            // Reduced tilt angle (6deg max) to keep it stable, elegant, and glitch-free
            const tiltMaxX = 6;
            const tiltMaxY = 6;
            
            const rotateX = (-yNormalized * tiltMaxX).toFixed(2);
            const rotateY = (xNormalized * tiltMaxY).toFixed(2);
            
            // Dynamic shadow offsets (shifting shadow opposite to tilt)
            const shadowX = (-rotateY * 2).toFixed(2);
            const shadowY = (rotateX * 2).toFixed(2);
            
            frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            frame.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(59, 15, 23, 0.35), 0 10px 25px rgba(0, 0, 0, 0.4)`;
            frame.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
        });

        target.addEventListener('mouseleave', () => {
            frame.style.transform = '';
            frame.style.boxShadow = '';
            frame.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
        });
    });
}

/* ==========================================================================
   7. Tasteful Sparkle Cursor Trail Particles
   ========================================================================== */
function initSparkleTrail() {
    let lastSpawnTime = 0;
    const throttleTime = 70; // ms between sparkles to maintain subtle low density

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSpawnTime < throttleTime) return;
        lastSpawnTime = now;

        createSparkle(e.clientX, e.clientY);
    });

    function createSparkle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-trail-particle';
        
        particle.innerHTML = `
            <svg viewBox="0 0 24 24" width="11" height="11" fill="var(--blush)">
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z"/>
            </svg>
        `;
        
        const offsetX = (Math.random() - 0.5) * 6;
        const offsetY = (Math.random() - 0.5) * 6;
        
        particle.style.left = `${x + offsetX}px`;
        particle.style.top = `${y + offsetY}px`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

/* ==========================================================================
   8. Elastic Magnetic Button Hover Effect (Only on Carousel Arrows for Stability)
   ========================================================================== */
function initMagneticButtons() {
    // Only apply magnetic pull to carousel arrow buttons to maintain site stability & keep CTAs solid
    const buttons = document.querySelectorAll('.carousel-btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            
            const mouseX = e.clientX - rect.left - (rect.width / 2);
            const mouseY = e.clientY - rect.top - (rect.height / 2);
            
            const strength = 0.35;
            
            btn.style.transform = `translate(${mouseX * strength}px, ${mouseY * strength}px) scale(1.04)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

/* ==========================================================================
   9. Theme Accent Dye Palette Picker (Creative Feature)
   ========================================================================== */
function initThemeDyePicker() {
    const swatches = document.querySelectorAll('.theme-dye-btn');
    
    // Map theme names to color palettes matching Onyx/Charcoal/Silver foundations
    const themes = {
        burgundy: {
            burgundy: '#3B0F17',
            burgundyLight: '#5A1825',
            blush: '#E2B2B8'
        },
        gold: {
            burgundy: '#4C3B24',
            burgundyLight: '#6B5436',
            blush: '#D4AF37'
        },
        silver: {
            burgundy: '#2B2B2D',
            burgundyLight: '#434346',
            blush: '#C7C7CC'
        },
        rose: {
            burgundy: '#5A2A33',
            burgundyLight: '#7A3D48',
            blush: '#F0C2C9'
        }
    };

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const themeName = swatch.getAttribute('data-theme');
            const palette = themes[themeName];
            
            if (!palette) return;

            // Remove active states and set new active swatch
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            // Smoothly update CSS Custom Properties
            document.documentElement.style.setProperty('--burgundy', palette.burgundy);
            document.documentElement.style.setProperty('--burgundy-light', palette.burgundyLight);
            document.documentElement.style.setProperty('--blush', palette.blush);
        });
    });
}

/* ==========================================================================
   10. Design Details Lightbox Modal (Creative Feature)
   ========================================================================== */
function initProjectLightbox() {
    const lightbox = document.getElementById('project-lightbox');
    if (!lightbox) return;

    const overlay = lightbox.querySelector('.lightbox-overlay');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const imgEl = lightbox.getElementById('lightbox-img');
    const titleEl = lightbox.getElementById('lightbox-title');
    const collectionEl = lightbox.getElementById('lightbox-collection');
    const descEl = lightbox.getElementById('lightbox-desc');
    
    const silhouetteEl = lightbox.getElementById('lightbox-silhouette');
    const materialsEl = lightbox.getElementById('lightbox-materials');
    const processEl = lightbox.getElementById('lightbox-process');

    // Trigger buttons (either full project link, image container, or overlay)
    const triggerCards = document.querySelectorAll('.project-card');

    function openLightbox(card) {
        const title = card.querySelector('.project-name').textContent;
        const collection = card.querySelector('.project-collection').textContent;
        const desc = card.querySelector('.project-desc').textContent;
        const imgStyle = card.querySelector('.polaroid-frame img').getAttribute('src');
        
        const silhouette = card.getAttribute('data-silhouette');
        const materials = card.getAttribute('data-materials');
        const process = card.getAttribute('data-process');

        // Populate Lightbox Fields
        imgEl.setAttribute('src', imgStyle);
        imgEl.setAttribute('alt', title);
        titleEl.textContent = title;
        collectionEl.textContent = collection;
        descEl.textContent = desc;
        
        silhouetteEl.textContent = silhouette;
        materialsEl.textContent = materials;
        processEl.textContent = process;

        // Open Lightbox with active CSS transition
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent scrolling underneath
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Attach click listeners to overlay triggers inside project card
    triggerCards.forEach(card => {
        const link = card.querySelector('.project-card-link');
        const overlayTrigger = card.querySelector('.project-overlay');

        const triggers = [link, overlayTrigger];

        triggers.forEach(trigger => {
            if (!trigger) return;
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(card);
            });
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}
