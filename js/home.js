/*=========================================
   DOLPHIN RES — HOMEPAGE SCRIPT
   (hero slider, testimonials carousel)
==========================================*/

document.addEventListener('DOMContentLoaded', () => {

    /* -------- Hero image slider -------- */

    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-arrow.prev');
    const nextBtn = document.querySelector('.hero-arrow.next');

    let current = 0;
    let heroInterval;

    const goToSlide = (index) => {

        if (!slides.length) return;

        current = (index + slides.length) % slides.length;

        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dots.forEach((d, i) => d.classList.toggle('active', i === current));

    };

    const startAutoplay = () => {
        clearInterval(heroInterval);
        heroInterval = setInterval(() => goToSlide(current + 1), 6000);
    };

    if (slides.length) {

        goToSlide(0);
        startAutoplay();

        if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(current + 1); startAutoplay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(current - 1); startAutoplay(); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goToSlide(i); startAutoplay(); });
        });

    }

    /* -------- Testimonials carousel --------
       Pauses on hover/focus, supports left/right arrow keys and touch
       swipe, keeps ARIA state in sync, and respects prefers-reduced-motion
       by disabling autoplay for users who've asked for less motion. */

    const track = document.querySelector('.testimonial-track');
    const tSlides = document.querySelectorAll('.testimonial-slide');
    const tDots = document.querySelectorAll('.testimonial-dot');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let tCurrent = 0;
    let tInterval = null;
    let tPaused = false;

    const goToTestimonial = (index) => {

        if (!tSlides.length) return;

        tCurrent = (index + tSlides.length) % tSlides.length;

        tSlides.forEach((s, i) => {
            const isActive = i === tCurrent;
            s.classList.toggle('active', isActive);
            s.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        tDots.forEach((d, i) => {
            const isActive = i === tCurrent;
            d.classList.toggle('active', isActive);
            d.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

    };

    const startTestimonialAutoplay = () => {

        clearInterval(tInterval);

        if (prefersReducedMotion || tSlides.length < 2) return;

        tInterval = setInterval(() => {
            if (!tPaused) goToTestimonial(tCurrent + 1);
        }, 6000);

    };

    if (tSlides.length && track) {

        goToTestimonial(0);
        startTestimonialAutoplay();

        // pause on hover / keyboard focus so a reader isn't rushed mid-quote
        track.addEventListener('mouseenter', () => { tPaused = true; });
        track.addEventListener('mouseleave', () => { tPaused = false; });
        track.addEventListener('focusin', () => { tPaused = true; });
        track.addEventListener('focusout', () => { tPaused = false; });

        // keyboard navigation
        track.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { goToTestimonial(tCurrent + 1); }
            if (e.key === 'ArrowLeft') { goToTestimonial(tCurrent - 1); }
        });

        // touch swipe navigation
        let touchStartX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {

            const touchEndX = e.changedTouches[0].screenX;
            const delta = touchEndX - touchStartX;

            if (Math.abs(delta) > 40) {
                goToTestimonial(delta < 0 ? tCurrent + 1 : tCurrent - 1);
            }

        }, { passive: true });

        tDots.forEach((dot, i) => {
            dot.addEventListener('click', () => goToTestimonial(i));
        });

    }

});
