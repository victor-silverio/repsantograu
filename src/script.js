document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuButton = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const isExpanded =
        mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, root: null, rootMargin: '0px 0px -50px 0px' }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  }
  const initTimelineCarousel = () => {
    const slider = document.getElementById('timeline-carousel');
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');
    if (slider) {
      const items = slider.querySelectorAll('.snap-center');
      let ticking = false;
      const updateUI = () => {
        if (btnLeft && btnRight) {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const sl = slider.scrollLeft;
              const max = slider.scrollWidth - slider.clientWidth - 20;
              btnLeft.style.opacity = sl > 20 ? '1' : '0';
              btnRight.style.opacity = sl < max ? '1' : '0';
              ticking = false;
            });
            ticking = true;
          }
        }
      };
      slider.addEventListener('scroll', updateUI);
      window.addEventListener('resize', updateUI);
      updateUI();
      if (btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => {
          const itemWidth = items[0].offsetWidth + 24;
          slider.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        });
        btnRight.addEventListener('click', () => {
          const itemWidth = items[0].offsetWidth + 24;
          slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
        });
      }
      let isDown = false;
      let startX;
      let scrollLeft;
      slider
        .querySelectorAll('img')
        .forEach((img) => img.setAttribute('draggable', 'false'));
      slider.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        isDown = true;
        e.preventDefault();
        slider.setPointerCapture(e.pointerId);
        slider.classList.add('cursor-grabbing');
        slider.classList.remove(
          'cursor-grab',
          'snap-x',
          'snap-mandatory',
          'scroll-smooth'
        );
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      const stopDrag = (e) => {
        if (!isDown) return;
        if (e.pointerType !== 'mouse') return;
        isDown = false;
        slider.releasePointerCapture(e.pointerId);
        slider.classList.remove('cursor-grabbing');
        const center = slider.scrollLeft + slider.clientWidth / 2;
        let closestItem = null;
        let minDistance = Infinity;
        items.forEach((item) => {
          const itemCenter = item.offsetLeft + item.offsetWidth / 2;
          const distance = Math.abs(center - itemCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
          }
        });
        if (closestItem) {
          closestItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
        setTimeout(() => {
          slider.classList.add(
            'cursor-grab',
            'snap-x',
            'snap-mandatory',
            'scroll-smooth'
          );
        }, 600);
      };
      slider.addEventListener('pointerleave', stopDrag);
      slider.addEventListener('pointerup', stopDrag);
      slider.addEventListener('pointercancel', stopDrag);
      slider.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        if (e.pointerType !== 'mouse') return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
      });
      let animationId;
      slider.addEventListener(
        'touchstart',
        (e) => {
          isDown = true;
          slider.classList.add('cursor-grabbing');
          slider.classList.remove(
            'cursor-grab',
            'snap-x',
            'snap-mandatory',
            'scroll-smooth'
          );
          startX = e.touches[0].pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
        },
        { passive: true }
      );
      slider.addEventListener('touchend', () => {
        isDown = false;
        slider.classList.remove('cursor-grabbing');
        slider.classList.add(
          'cursor-grab',
          'snap-x',
          'snap-mandatory',
          'scroll-smooth'
        );
      });
      slider.addEventListener(
        'touchmove',
        (e) => {
          if (!isDown) return;
          if (animationId) cancelAnimationFrame(animationId);
          animationId = requestAnimationFrame(() => {
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
          });
        },
        { passive: true }
      );
    }
  };
  initTimelineCarousel();

  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopButton.classList.remove('opacity-0');
        backToTopButton.classList.add('opacity-100');
        backToTopButton.style.pointerEvents = 'auto';
      } else {
        backToTopButton.classList.remove('opacity-100');
        backToTopButton.classList.add('opacity-0');
        backToTopButton.style.pointerEvents = 'none';
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if ('serviceWorker' in navigator) {
    const registerSW = async (retryCount = 0) => {
      const MAX_RETRIES = 2;
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log(
          'Service Worker registrado com sucesso:',
          registration.scope
        );

        try {
          await registration.update();
        } catch (err) {
          console.log('Falha ao atualizar SW:', err);
        }
      } catch (error) {
        console.warn(
          `Falha ao registrar Service Worker (tentativa ${retryCount + 1}):`,
          error
        );

        if (retryCount < MAX_RETRIES) {
          console.log(`Tentando novamente em 2 segundos...`);
          setTimeout(() => registerSW(retryCount + 1), 2000);
        } else {
          console.error(
            'Falha crítica no registro do Service Worker após múltiplas tentativas. O site pode não funcionar offline.'
          );
        }
      }
    };

    window.addEventListener('load', () => {
      const register = () => {
        setTimeout(() => {
          registerSW();
        }, 2000);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(register);
      } else {
        register();
      }
    });
  }
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const galleryImages = document.querySelectorAll('.gallery-img');
  if (lightbox && galleryImages.length > 0) {
    let currentIndex = 0;
    const imagesList = Array.from(galleryImages);
    const openLightbox = (index) => {
      currentIndex = index;
      const img = imagesList[currentIndex];
      lightboxImg.src = img.getAttribute('data-full') || img.src;
      lightboxCaption.textContent = img.getAttribute('alt') || '';
      lightbox.classList.remove('hidden');
      setTimeout(() => {
        lightbox.classList.remove('opacity-0');
      }, 10);
      document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
      lightbox.classList.add('opacity-0');
      setTimeout(() => {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
      }, 300);
      document.body.style.overflow = '';
    };
    const showNext = () => {
      currentIndex = (currentIndex + 1) % imagesList.length;
      openLightbox(currentIndex);
    };
    const showPrev = () => {
      currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
      openLightbox(currentIndex);
    };
    imagesList.forEach((img, index) => {
      img.addEventListener('click', () => openLightbox(index));
    });
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      showNext();
    });
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrev();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );
    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) showNext();
      if (touchEndX > touchStartX + 50) showPrev();
    };
  }
});
