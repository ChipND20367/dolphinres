/*=========================================
   DOLPHIN RES — RESIDENCE / GALLERY SCRIPT
==========================================*/

document.addEventListener('DOMContentLoaded', () => {

    /* -------- Scroll reveal for gallery + res-stats -------- */
    /* script.js already sets up the IntersectionObserver pattern for
       .reveal / .reveal-pop — we just need to tag the right elements
       here since this page has its own sections. */

    const galleryItems = document.querySelectorAll('.gallery-item');
    const statBoxes = document.querySelectorAll('.stat-box');
    const filterSectionEls = document.querySelectorAll('.filters h2, .filters > p, .book-room h2, .book-room p');

    galleryItems.forEach(el => el.classList.add('reveal'));
    statBoxes.forEach(el => el.classList.add('reveal-pop'));
    filterSectionEls.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }

        });

    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .reveal-pop').forEach(el => observer.observe(el));

    /* -------- Gallery filtering -------- */
    /* Each .gallery-item needs a data-category attribute that matches
       one of the filter button labels (case-insensitive), e.g.
       data-category="Rooms". The "All" button always shows everything. */

    const filterButtons = document.querySelectorAll('.filter-buttons button');

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            const selected = button.textContent.trim().toLowerCase();

            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            galleryItems.forEach(item => {

                const category = (item.dataset.category || '').toLowerCase();
                const show = selected === 'all' || category === selected;

                item.classList.toggle('filtered-out', !show);

            });

        });

    });

});
