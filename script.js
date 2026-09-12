// Liberty Fencing Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle with backdrop + ESC + click-outside
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    function openMenu() {
        navMenu.classList.add('active');
        mobileMenuToggle.classList.add('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileMenuToggle.setAttribute('aria-label', 'Close menu');
        // Create backdrop if doesn't exist
        let backdrop = document.querySelector('.menu-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'menu-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', closeMenu);
        }
        // Show backdrop
        requestAnimationFrame(() => backdrop.classList.add('show'));
        body.classList.add('menu-open');
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Open menu');
        const backdrop = document.querySelector('.menu-backdrop');
        if (backdrop) backdrop.classList.remove('show');
        body.classList.remove('menu-open');
    }

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // ESC key closes
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    closeMenu();
                }
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Add animation on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe service cards
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });

    // FAQ expand/collapse all
    const faqExpandAll = document.querySelector('.faq-expand-all');
    if (faqExpandAll) {
        faqExpandAll.addEventListener('click', function() {
            const allItems = document.querySelectorAll('.faq-item');
            const anyClosed = Array.from(allItems).some(item => !item.open);
            allItems.forEach(item => {
                item.open = anyClosed;
            });
            this.textContent = anyClosed ? 'Collapse all' : 'Expand all';
        });
    }
});


// ─── PACKAGES CAROUSEL ────────────────────────────────────────────
document.querySelectorAll('.package-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const variations = document.getElementById(targetId);
    if (!variations) return;

    const isOpen = variations.classList.contains('expanded');

    // Close all other expanded packages
    document.querySelectorAll('.package-variations.expanded').forEach(v => {
      v.classList.remove('expanded');
    });
    document.querySelectorAll('.package-toggle.active').forEach(t => {
      t.classList.remove('active');
      const target = t.dataset.target;
      const variationsEl = document.getElementById(target);
      const count = variationsEl ? variationsEl.querySelectorAll('.package-variation').length : 0;
      t.textContent = `See ${count} size${count !== 1 ? 's' : ''}`;
    });

    // Toggle the clicked one
    if (!isOpen) {
      variations.classList.add('expanded');
      btn.classList.add('active');
      const count = variations.querySelectorAll('.package-variation').length;
      btn.textContent = `Hide ${count} sizes`;
    }
  });
});

// Carousel arrows
const carousel = document.querySelector('.packages-carousel');
if (carousel) {
  const track = carousel.querySelector('.packages-track');
  const leftArrow = carousel.querySelector('.carousel-arrow-left');
  const rightArrow = carousel.querySelector('.carousel-arrow-right');
  const cardWidth = 344;

  if (leftArrow && track) {
    leftArrow.addEventListener('click', () => {
      track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
  }
  if (rightArrow && track) {
    rightArrow.addEventListener('click', () => {
      track.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }
}
