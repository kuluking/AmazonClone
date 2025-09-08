// ========================================
// AMAZON HOMEPAGE REPLICA - JAVASCRIPT
// ========================================

// Global Variables
let currentSlide = 0;
let slideInterval;
let cart = [];
let isCarouselPaused = false;
let touchStartX = 0;
let touchEndX = 0;

// DOM Elements - Cached for performance
const elements = {
    carouselTrack: null,
    carouselSlides: null,
    indicators: null,
    cartCount: null,
    cartItems: null,
    cartTotal: null,
    toast: null,
    toastMessage: null,
    locationModal: null,
    cartSidebar: null,
    searchInput: null,
    productsContainer: null,
    locationName: null,
    zipInput: null
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Amazon Homepage Replica loaded successfully!');

    // Cache DOM elements
    cacheElements();

    // Initialize all components
    initializeCarousel();
    initializeNavigation();
    initializeSearch();
    initializeCart();
    initializeProductSlider();
    initializeTouchGestures();
    initializeAccessibility();
    initializeIntersectionObserver();

    // Load saved cart
    loadCartFromStorage();
    updateCartDisplay();

    // Add global event listeners
    addGlobalEventListeners();

    console.log('✅ All components initialized successfully');
});

// Cache DOM elements for better performance
function cacheElements() {
    elements.carouselTrack = document.getElementById('carouselTrack');
    elements.carouselSlides = document.querySelectorAll('.carousel-slide');
    elements.indicators = document.querySelectorAll('.indicator');
    elements.cartCount = document.getElementById('cartCount');
    elements.cartItems = document.getElementById('cartItems');
    elements.cartTotal = document.getElementById('cartTotal');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toastMessage');
    elements.locationModal = document.getElementById('locationModal');
    elements.cartSidebar = document.getElementById('cartSidebar');
    elements.searchInput = document.getElementById('searchInput');
    elements.productsContainer = document.getElementById('productsContainer');
    elements.locationName = document.getElementById('locationName');
    elements.zipInput = document.getElementById('zipInput');
}

// ========================================
// CAROUSEL FUNCTIONALITY
// ========================================

function initializeCarousel() {
    if (!elements.carouselSlides || elements.carouselSlides.length === 0) {
        console.warn('No carousel slides found');
        return;
    }

    console.log(`🎠 Initializing carousel with ${elements.carouselSlides.length} slides`);

    // Set first slide as active
    showSlide(0);

    // Start auto-rotation
    startCarouselAutoPlay();

    // Pause on hover/focus
    if (elements.carouselTrack) {
        elements.carouselTrack.addEventListener('mouseenter', pauseCarousel);
        elements.carouselTrack.addEventListener('mouseleave', resumeCarousel);
        elements.carouselTrack.addEventListener('focusin', pauseCarousel);
        elements.carouselTrack.addEventListener('focusout', resumeCarousel);
    }

    console.log('✅ Carousel initialized');
}

function showSlide(index) {
    if (!elements.carouselSlides || index < 0 || index >= elements.carouselSlides.length) {
        return;
    }

    // Remove active class from all slides and indicators
    elements.carouselSlides.forEach(slide => slide.classList.remove('active'));
    elements.indicators.forEach(indicator => {
        indicator.classList.remove('active');
        indicator.setAttribute('aria-selected', 'false');
    });

    // Add active class to current slide and indicator
    elements.carouselSlides[index].classList.add('active');
    if (elements.indicators[index]) {
        elements.indicators[index].classList.add('active');
        elements.indicators[index].setAttribute('aria-selected', 'true');
    }

    currentSlide = index;

    // Announce slide change for screen readers
    announceToScreenReader(`Slide ${index + 1} of ${elements.carouselSlides.length}`);
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % elements.carouselSlides.length;
    showSlide(nextIndex);
}

function previousSlide() {
    const prevIndex = (currentSlide - 1 + elements.carouselSlides.length) % elements.carouselSlides.length;
    showSlide(prevIndex);
}

function goToSlide(index) {
    showSlide(index);
    // Pause auto-play temporarily when user manually navigates
    pauseCarousel();
    setTimeout(() => {
        if (!isCarouselPaused) {
            startCarouselAutoPlay();
        }
    }, 5000);
}

function startCarouselAutoPlay() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    slideInterval = setInterval(() => {
        if (!isCarouselPaused) {
            nextSlide();
        }
    }, 5000);
}

function pauseCarousel() {
    isCarouselPaused = true;
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

function resumeCarousel() {
    isCarouselPaused = false;
    startCarouselAutoPlay();
}

// ========================================
// NAVIGATION FUNCTIONALITY
// ========================================

function initializeNavigation() {
    // Add click outside listeners for dropdowns
    document.addEventListener('click', handleOutsideClick);

    // Add escape key listener
    document.addEventListener('keydown', handleKeyDown);

    console.log('✅ Navigation initialized');
}

function handleOutsideClick(event) {
    // Close dropdowns and modals when clicking outside
    if (!event.target.closest('.nav-account') && !event.target.closest('#accountDropdown')) {
        closeAccountDropdown();
    }

    if (!event.target.closest('.nav-lang') && !event.target.closest('#langDropdown')) {
        closeLangDropdown();
    }

    if (!event.target.closest('.modal-content') && event.target.closest('.modal')) {
        closeLocationModal();
    }

    if (!event.target.closest('.cart-content') && event.target.closest('.cart-sidebar')) {
        toggleCart();
    }
}

function handleKeyDown(event) {
    switch(event.key) {
        case 'Escape':
            closeAllModals();
            break;
        case 'ArrowLeft':
            if (event.target.closest('.carousel-container')) {
                event.preventDefault();
                previousSlide();
            }
            break;
        case 'ArrowRight':
            if (event.target.closest('.carousel-container')) {
                event.preventDefault();
                nextSlide();
            }
            break;
    }

    // Search shortcut (Ctrl+K or Cmd+K)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (elements.searchInput) {
            elements.searchInput.focus();
        }
    }
}

// Location Modal
function openLocationModal() {
    if (elements.locationModal) {
        elements.locationModal.style.display = 'block';
        elements.locationModal.setAttribute('aria-hidden', 'false');

        // Focus on input
        setTimeout(() => {
            if (elements.zipInput) {
                elements.zipInput.focus();
            }
        }, 100);
    }
}

function closeLocationModal() {
    if (elements.locationModal) {
        elements.locationModal.style.display = 'none';
        elements.locationModal.setAttribute('aria-hidden', 'true');
    }
}

function updateLocation(event) {
    event.preventDefault();

    const zipCode = elements.zipInput?.value.trim();
    if (zipCode) {
        if (elements.locationName) {
            elements.locationName.textContent = zipCode;
        }
        closeLocationModal();
        showToast(`📍 Location updated to ${zipCode}`);

        // Clear input
        if (elements.zipInput) {
            elements.zipInput.value = '';
        }
    }
}

// Dropdown Functions
function toggleAccountDropdown() {
    // Simplified - would show account dropdown in real implementation
    showToast('👤 Account menu clicked');
}

function toggleLanguageDropdown() {
    // Simplified - would show language options
    showToast('🌐 Language selector clicked');
}

function toggleAllMenu() {
    // Simplified - would show all departments menu
    showToast('📋 All departments menu clicked');
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');

    if (navLinks) {
        navLinks.classList.toggle('mobile-open');
        const isOpen = navLinks.classList.contains('mobile-open');

        if (mobileToggle) {
            mobileToggle.setAttribute('aria-expanded', isOpen);
        }

        showToast(isOpen ? '📱 Menu opened' : '📱 Menu closed');
    }
}

// Close all modals and dropdowns
function closeAllModals() {
    closeLocationModal();
    closeAccountDropdown();
    closeLangDropdown();
}

function closeAccountDropdown() {
    // Implementation would close account dropdown
}

function closeLangDropdown() {
    // Implementation would close language dropdown
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function initializeSearch() {
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', handleSearchInput);
        elements.searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    console.log('✅ Search initialized');
}

function handleSearchInput(event) {
    const query = event.target.value.trim();

    // Show search suggestions for queries longer than 2 characters
    if (query.length > 2) {
        // In a real app, this would fetch suggestions from an API
        console.log('Search suggestions for:', query);
    }
}

function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch(event);
    }
}

function performSearch(event) {
    event.preventDefault();

    const searchForm = event.target.closest('form') || event.target;
    const formData = new FormData(searchForm);

    const query = elements.searchInput?.value.trim() || '';
    const category = document.querySelector('.search-category')?.value || 'all';

    if (query) {
        showToast(`🔍 Searching for "${query}" in ${category}`);
        console.log('Search performed:', { query, category });

        // In a real app, this would redirect to search results
        // window.location.href = `/search?q=${encodeURIComponent(query)}&category=${category}`;
    } else {
        showToast('⚠️ Please enter a search term');
        elements.searchInput?.focus();
    }
}

// ========================================
// SHOPPING CART FUNCTIONALITY
// ========================================

function initializeCart() {
    console.log('✅ Shopping cart initialized');
}

function addToCart(productId, productName, price) {
    // Check if item already exists
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`📦 Increased ${productName} quantity to ${existingItem.quantity}`);
    } else {
        const newItem = {
            id: productId,
            name: productName,
            price: parseFloat(price),
            quantity: 1,
            addedAt: new Date().toISOString()
        };
        cart.push(newItem);
        showToast(`✅ ${productName} added to cart!`);
    }

    updateCartDisplay();
    saveCartToStorage();
    animateCartIcon();

    // Track event for analytics
    trackEvent('add_to_cart', {
        product_id: productId,
        product_name: productName,
        price: price,
        cart_size: cart.length
    });
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        const removedItem = cart.splice(itemIndex, 1)[0];
        showToast(`🗑️ ${removedItem.name} removed from cart`);
        updateCartDisplay();
        saveCartToStorage();
    }
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCartToStorage();
            showToast(`📝 Quantity updated`);
        }
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update cart count
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update cart total
    if (elements.cartTotal) {
        elements.cartTotal.textContent = totalPrice.toFixed(2);
    }

    // Update cart items display
    updateCartItemsDisplay();
}

function updateCartItemsDisplay() {
    if (!elements.cartItems) return;

    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                <p>Your cart is empty</p>
                <p>Add items to get started</p>
            </div>
        `;
        return;
    }

    const cartHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-info">
                <h4>${escapeHtml(item.name)}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" aria-label="Decrease quantity">
                        <i class="fas fa-minus" aria-hidden="true"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" aria-label="Increase quantity">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove ${escapeHtml(item.name)} from cart">
                <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
        </div>
    `).join('');

    elements.cartItems.innerHTML = cartHTML;
}

function toggleCart() {
    if (elements.cartSidebar) {
        const isVisible = elements.cartSidebar.style.display === 'block';

        if (isVisible) {
            elements.cartSidebar.style.display = 'none';
            elements.cartSidebar.setAttribute('aria-hidden', 'true');
        } else {
            updateCartItemsDisplay();
            elements.cartSidebar.style.display = 'block';
            elements.cartSidebar.setAttribute('aria-hidden', 'false');
        }
    }
}

function animateCartIcon() {
    if (elements.cartCount) {
        elements.cartCount.style.animation = 'none';
        elements.cartCount.offsetHeight; // Trigger reflow
        elements.cartCount.style.animation = 'pulse 0.3s ease';
    }
}

// Cart storage functions
function saveCartToStorage() {
    try {
        localStorage.setItem('amazon-cart', JSON.stringify(cart));
    } catch (error) {
        console.warn('Failed to save cart to localStorage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('amazon-cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log(`💾 Loaded ${cart.length} items from storage`);
        }
    } catch (error) {
        console.warn('Failed to load cart from localStorage:', error);
        cart = [];
    }
}

// ========================================
// PRODUCT SLIDER FUNCTIONALITY
// ========================================

function initializeProductSlider() {
    if (elements.productsContainer) {
        // Add smooth scrolling support
        elements.productsContainer.style.scrollBehavior = 'smooth';

        // Add touch/drag support for desktop
        addDragScrollSupport(elements.productsContainer);
    }

    console.log('✅ Product slider initialized');
}

function scrollProducts(direction) {
    if (!elements.productsContainer) return;

    const cardWidth = 260; // Card width + gap
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time

    if (direction === 'left') {
        elements.productsContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else if (direction === 'right') {
        elements.productsContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

function addDragScrollSupport(container) {
    let isScrolling = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('mousedown', (e) => {
        isScrolling = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
    });

    container.addEventListener('mouseleave', () => {
        isScrolling = false;
        container.style.cursor = 'grab';
        container.style.userSelect = '';
    });

    container.addEventListener('mouseup', () => {
        isScrolling = false;
        container.style.cursor = 'grab';
        container.style.userSelect = '';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });
}

// ========================================
// TOUCH GESTURES
// ========================================

function initializeTouchGestures() {
    // Carousel touch support
    if (elements.carouselTrack) {
        addCarouselTouchSupport();
    }

    // Product slider touch support
    if (elements.productsContainer) {
        addProductSliderTouchSupport();
    }

    console.log('✅ Touch gestures initialized');
}

function addCarouselTouchSupport() {
    elements.carouselTrack.addEventListener('touchstart', handleCarouselTouchStart, { passive: true });
    elements.carouselTrack.addEventListener('touchend', handleCarouselTouchEnd, { passive: true });
}

function handleCarouselTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
}

function handleCarouselTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleCarouselSwipe();
}

function handleCarouselSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - previous slide
            previousSlide();
        }

        // Pause auto-play temporarily
        pauseCarousel();
        setTimeout(() => {
            if (!isCarouselPaused) {
                startCarouselAutoPlay();
            }
        }, 5000);
    }
}

function addProductSliderTouchSupport() {
    let startX = 0;
    let scrollLeft = 0;
    let isScrolling = false;

    elements.productsContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - elements.productsContainer.offsetLeft;
        scrollLeft = elements.productsContainer.scrollLeft;
        isScrolling = true;
    }, { passive: true });

    elements.productsContainer.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        const x = e.touches[0].pageX - elements.productsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        elements.productsContainer.scrollLeft = scrollLeft - walk;
    }, { passive: true });

    elements.productsContainer.addEventListener('touchend', () => {
        isScrolling = false;
    }, { passive: true });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showToast(message, duration = 3000) {
    if (elements.toast && elements.toastMessage) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.add('show');

        // Auto-hide toast
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, duration);

        // Announce to screen readers
        announceToScreenReader(message);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

function initializeAccessibility() {
    // Add skip link
    addSkipLink();

    // Add ARIA live regions
    addLiveRegions();

    // Enhance keyboard navigation
    enhanceKeyboardNavigation();

    console.log('✅ Accessibility features initialized');
}

function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
        border-radius: 4px;
        font-size: 14px;
        opacity: 0;
        transform: translateY(-100%);
        transition: all 0.3s ease;
    `;

    skipLink.addEventListener('focus', function() {
        this.style.opacity = '1';
        this.style.transform = 'translateY(0)';
        this.style.top = '10px';
    });

    skipLink.addEventListener('blur', function() {
        this.style.opacity = '0';
        this.style.transform = 'translateY(-100%)';
        this.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

function addLiveRegions() {
    // Create announcement region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

function enhanceKeyboardNavigation() {
    // Add keyboard support for interactive elements
    document.addEventListener('keydown', (event) => {
        const target = event.target;

        // Enter and Space should activate buttons and links
        if ((event.key === 'Enter' || event.key === ' ') && 
            (target.hasAttribute('onclick') || target.hasAttribute('role'))) {

            if (event.key === ' ') {
                event.preventDefault();
            }

            target.click();
        }
    });
}

// ========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ========================================

function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll-triggered animations
    const animatedElements = document.querySelectorAll('.category-card, .deal-card, .product-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    console.log('✅ Intersection observer initialized');
}

// ========================================
// GLOBAL EVENT LISTENERS
// ========================================

function addGlobalEventListeners() {
    // Scroll to top functionality
    window.scrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        announceToScreenReader('Scrolled to top of page');
    };

    // Window resize handler
    window.addEventListener('resize', debounce(() => {
        closeAllModals();
        console.log('Window resized, modals closed');
    }, 250));

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseCarousel();
        } else {
            resumeCarousel();
        }
    });

    // Category navigation
    window.navigateToCategory = function(category) {
        showToast(`🏪 Loading ${category} category...`);
        trackEvent('category_click', { category: category });
        console.log(`Navigate to category: ${category}`);
        // In real app: window.location.href = `/category/${category}`;
    };

    console.log('✅ Global event listeners added');
}

// ========================================
// ANALYTICS & TRACKING
// ========================================

function trackEvent(eventName, eventData = {}) {
    // In a real application, this would send data to analytics service
    console.log('📊 Analytics Event:', eventName, {
        ...eventData,
        timestamp: new Date().toISOString(),
        page: 'homepage'
    });

    // Example: Google Analytics 4
    // gtag('event', eventName, eventData);

    // Example: Custom analytics
    // analytics.track(eventName, eventData);
}

// Track page load
document.addEventListener('DOMContentLoaded', () => {
    trackEvent('page_load', {
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
    });
});

// Track interactions
document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-product-id], [data-category]');

    if (target) {
        const productId = target.dataset.productId;
        const category = target.dataset.category;

        if (productId && !event.target.closest('.add-to-cart-btn')) {
            trackEvent('product_view', { product_id: productId });
        }

        if (category) {
            trackEvent('category_view', { category: category });
        }
    }
});

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);
    showToast('⚠️ Something went wrong. Please refresh the page.', 5000);

    // Track error for monitoring
    trackEvent('javascript_error', {
        message: event.error?.message || 'Unknown error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    showToast('⚠️ Network error. Please check your connection.', 5000);

    trackEvent('promise_rejection', {
        reason: event.reason?.message || 'Unknown reason'
    });
});

// ========================================
// DEVELOPMENT TOOLS
// ========================================

// Development helper functions (available in console)
window.amazonDevTools = {
    // Add sample products for testing
    addSampleProducts: () => {
        addToCart('sample-1', 'Sample Product 1', 29.99);
        addToCart('sample-2', 'Sample Product 2', 49.99);
        addToCart('sample-3', 'Sample Product 3', 19.99);
        showToast('🧪 Sample products added for testing!');
    },

    // Clear cart
    clearCart: () => {
        cart = [];
        updateCartDisplay();
        saveCartToStorage();
        showToast('🗑️ Cart cleared!');
    },

    // Toggle carousel auto-play
    toggleCarousel: () => {
        if (isCarouselPaused) {
            resumeCarousel();
            showToast('▶️ Carousel resumed');
        } else {
            pauseCarousel();
            showToast('⏸️ Carousel paused');
        }
    },

    // Show current cart
    showCart: () => {
        console.table(cart);
        return cart;
    },

    // Performance info
    getPerformance: () => {
        return {
            cart_items: cart.length,
            current_slide: currentSlide,
            carousel_paused: isCarouselPaused,
            elements_cached: Object.keys(elements).length
        };
    },

    // Show available commands
    help: () => {
        console.log(`
🛒 Amazon Homepage Replica - Development Tools

Available commands:
• amazonDevTools.addSampleProducts() - Add test products to cart
• amazonDevTools.clearCart() - Clear all cart items
• amazonDevTools.toggleCarousel() - Pause/resume carousel
• amazonDevTools.showCart() - Display cart contents
• amazonDevTools.getPerformance() - Show performance metrics
• amazonDevTools.help() - Show this help message

Analytics tracking: ${typeof trackEvent === 'function' ? 'Active' : 'Inactive'}
Cart persistence: ${typeof localStorage !== 'undefined' ? 'Active' : 'Inactive'}
Touch support: ${typeof Touch !== 'undefined' ? 'Active' : 'Inactive'}
        `);
    }
};

// ========================================
// INITIALIZATION COMPLETE
// ========================================

console.log(`
🎉 Amazon Homepage Replica Ready!

Features loaded:
• 🎠 Auto-rotating carousel with touch support
• 🛒 Interactive shopping cart with persistence
• 🔍 Search functionality with keyboard shortcuts
• 📱 Mobile-responsive navigation
• ♿ Full accessibility support
• 📊 Analytics tracking
• 🧪 Development tools (amazonDevTools.help())

Type "amazonDevTools.help()" in console for development commands.
`);

// Make functions globally available for HTML onclick handlers
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.updateLocation = updateLocation;
window.toggleAccountDropdown = toggleAccountDropdown;
window.toggleLanguageDropdown = toggleLanguageDropdown;
window.toggleAllMenu = toggleAllMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.scrollProducts = scrollProducts;
window.performSearch = performSearch;
window.navigateToCategory = navigateToCategory;