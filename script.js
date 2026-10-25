document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. DYNAMIC FOOTER YEAR
     ========================================================================== */
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     2. MOBILE NAVIGATION TOGGLE
     ========================================================================== */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    const toggleMenu = () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // prevent background scrolling when menu is open on mobile
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    const closeMenu = () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', toggleMenu);

    // close menu when clicking on any navigation link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });

    // close menu if user clicks outside of header
    document.addEventListener('click', (event) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // reset when resizing back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* ======================================
     3. STICKY HEADER & SCROLLSPY 
     ======================================*/
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header background elevation
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // scrollspy section highlight
    const headerOffset = 100;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - headerOffset;
      const sectionId = current.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-menu a[href*="#${sectionId}"]`);

      if (matchingLink) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach(link => link.classList.remove('active'));
          matchingLink.classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial check
  handleScroll();

  /* =====================================
     4. GALLERY CATEGORY FILTER
     ===================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filterValue = button.getAttribute('data-filter');

        // Update active class on filter buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter gallery items
        galleryItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* =======================================================
     5. LIGHTBOX MODAL FOR PHOTO SLOTS & GALLERY
     ======================================================== */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  const openLightbox = (src, altText, captionText) => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = altText || 'Enlarged photo preview';
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || altText || '';
    }
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Gallery items click handler
  document.querySelectorAll('.gallery-frame').forEach(frame => {
    frame.addEventListener('click', () => {
      const img = frame.querySelector('.slot-image');
      if (img) {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        const caption = img.getAttribute('data-caption') || alt;
        openLightbox(src, alt, caption);
      }
    });
  });

  // lightbox close interactions
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* ==========================================================================
     6. ONE-CLICK CLIPBOARD COPY (EMAIL & PHONE)
     ========================================================================== */
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const textToCopy = button.getAttribute('data-copy');
      const tooltip = button.querySelector('.copy-tooltip');

      if (!textToCopy) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // fallback for non-https or older environments
          const tempInput = document.createElement('input');
          tempInput.value = textToCopy;
          tempInput.style.position = 'absolute';
          tempInput.style.left = '-9999px';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        button.classList.add('copied');
        if (tooltip) tooltip.textContent = 'Copied!';

        setTimeout(() => {
          button.classList.remove('copied');
          if (tooltip) tooltip.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    });
  });

  /* =========================================================
     7. CONTACT FORM CLIENT-SIDE VALIDATION & FEEDBACK
     ==========================================================*/
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const subjectInput = document.getElementById('userSubject');
    const messageInput = document.getElementById('userMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateForm = () => {
      let isValid = true;

      // validate Name
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        isValid = false;
      } else {
        nameError.textContent = '';
      }

      // validate Email
      if (!emailInput.value.trim()) {
        emailError.textContent = 'Please enter your email.';
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      } else {
        emailError.textContent = '';
      }

      // validate Subject
      if (!subjectInput.value.trim()) {
        subjectError.textContent = 'Please enter a subject.';
        isValid = false;
      } else {
        subjectError.textContent = '';
      }

      // validate Message
      if (!messageInput.value.trim()) {
        messageError.textContent = 'Please write your message.';
        isValid = false;
      } else if (messageInput.value.trim().length < 10) {
        messageError.textContent = 'Message should be at least 10 characters long.';
        isValid = false;
      } else {
        messageError.textContent = '';
      }

      return isValid;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (validateForm()) {
        const senderName = nameInput.value.trim();

        // display success confirmation message
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = `Thank you, ${senderName}! Your message was prepared. (Note: To send directly, you can also email hanzelg.guevarra@gmail.com).`;
        }

        // reset form inputs
        contactForm.reset();

        // clear status after 8 seconds
        setTimeout(() => {
          if (formStatus) {
            formStatus.className = 'form-status';
            formStatus.textContent = '';
          }
        }, 8000);
      } else {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Please complete all required fields correctly.';
        }
      }
    });

    // realtime error clearing on input
    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          const errorSpan = document.getElementById(`${input.name}Error`);
          if (errorSpan && input.value.trim()) {
            errorSpan.textContent = '';
          }
        });
      }
    });
  }
});
