/*=========================================
   DOLPHIN RES — SHARED SITE SCRIPT
   (mobile menu, scroll reveals, counters)
==========================================*/

document.addEventListener('DOMContentLoaded', () => {

    /* -------- Loading screen -------- */

    const loadingScreen = document.querySelector('.loading-screen');

    if (loadingScreen) {

        window.addEventListener('load', () => {
            setTimeout(() => loadingScreen.classList.add('loaded'), 300);
        });

        // fallback in case 'load' already fired or is slow to register
        setTimeout(() => loadingScreen.classList.add('loaded'), 2500);

    }

    /* -------- Scroll progress bar + glass nav shadow -------- */

    const progressBar = document.querySelector('.scroll-progress');
    const navbarEl = document.querySelector('.navbar');

    const onScroll = () => {

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progressBar) progressBar.style.width = progress + '%';

        if (navbarEl) navbarEl.classList.toggle('scrolled', scrollTop > 40);

        if (backToTop) backToTop.classList.toggle('visible', scrollTop > 500);

    };

    /* -------- Back to top button -------- */

    const backToTop = document.querySelector('.back-to-top');

    if (backToTop) {

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -------- Ripple effect on buttons -------- */

    document.querySelectorAll('.btn, .btn-outline').forEach(btn => {

        btn.addEventListener('click', function (e) {

            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            ripple.className = 'ripple-effect';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            this.style.position = this.style.position || 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 650);

        });

    });

    /* -------- Mobile menu toggle -------- */

    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {

        menuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        menuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                menuBtn.click();
            }
        });

        // close the menu after a link is tapped
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });

    }

    /* -------- Contact form submission (FormSubmit.co) --------
       Progressive enhancement: if JS runs, we intercept the submit and
       send it via fetch so the page never reloads and the visitor sees
       an inline success/error message immediately. If JS fails to load
       for any reason, the form still works as a plain POST that
       redirects back with ?sent=true (handled by the query-param check
       below), so nothing is ever fully broken. A honeypot field
       ("_honey") is also checked client-side as a first line of
       defense, on top of FormSubmit's own server-side honeypot
       handling for that field name. */

    const contactForm = document.querySelector('#contact-form-el');

    if (contactForm) {

        const submitBtn = document.querySelector('#contact-submit-btn');
        const successBanner = document.querySelector('#form-success');
        const errorBanner = document.querySelector('#form-error');

        contactForm.addEventListener('submit', async (e) => {

            const honeypot = contactForm.querySelector('#website');
            if (honeypot && honeypot.value.trim() !== '') {
                e.preventDefault();
                return; // silently drop — likely a bot
            }

            e.preventDefault();

            if (successBanner) successBanner.hidden = true;
            if (errorBanner) errorBanner.hidden = true;

            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            try {

                const formData = new FormData(contactForm);
                const ajaxUrl = contactForm.action.replace(
                    'formsubmit.co/', 'formsubmit.co/ajax/'
                );

                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData,
                });

                if (!response.ok) throw new Error('Request failed');

                if (successBanner) successBanner.hidden = false;
                contactForm.reset();
                successBanner?.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (err) {

                if (errorBanner) errorBanner.hidden = false;
                errorBanner?.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } finally {

                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }

            }

        });

    }

    // no-JS fallback: if the page loaded with ?sent=true (FormSubmit's
    // redirect after a plain, non-AJAX POST), show the success banner.
    if (new URLSearchParams(window.location.search).get('sent') === 'true') {
        document.querySelector('#form-success')?.removeAttribute('hidden');
    }

    /* -------- FAQ accordion -------- */
    /* Only one answer open at a time. Uses max-height transition, so the
       answer's actual height is measured and set on open. */

    document.querySelectorAll('.faq-question').forEach(button => {

        button.addEventListener('click', () => {

            const item = button.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');

            // close every other open item first
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    openItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            if (isOpen) {
                item.classList.remove('open');
                button.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('open');
                button.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }

        });

    });

    /* -------- Scroll-triggered reveal animations -------- */
    /* Add the .reveal / .reveal-pop class to anything that should
       fade or pop in once it scrolls into view. */

    const revealTargets = document.querySelectorAll(
        '.amenity-card, .stats > div, .about-text, .about-image, .section-title'
    );

    revealTargets.forEach(el => el.classList.add('reveal'));

    // stats numbers pop instead of slide
    document.querySelectorAll('.stats > div').forEach(el => {
        el.classList.remove('reveal');
        el.classList.add('reveal-pop');
    });

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }

        });

    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .reveal-pop').forEach(el => observer.observe(el));

    /* -------- Animated stat counters -------- */
    /* Add a data-target="123" attribute to any <h2> you want to count up. */

    const counters = document.querySelectorAll('.stats h2[data-target]');

    const animateCounter = (el) => {

        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';

        if (isNaN(target)) return;

        const duration = 1400;
        const start = performance.now();

        const step = (now) => {

            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            el.textContent = Math.floor(eased * target) + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }

        };

        requestAnimationFrame(step);

    };

    const counterObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }

        });

    }, { threshold: 0.4 });

    counters.forEach(el => counterObserver.observe(el));

});
