// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDropdown();
    initializeCart();
    initializeToast();
    initializeCartPage();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navClose = document.getElementById('navClose');
    
    function closeNavMenu() {
        navMenu.classList.remove('active');
        // Reset hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = '';
            span.style.opacity = '';
        });
    }
    
    function openNavMenu() {
        navMenu.classList.add('active');
        // Animate hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        });
    }
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                closeNavMenu();
            } else {
                openNavMenu();
            }
        });
        
        // Close button functionality
        if (navClose) {
            navClose.addEventListener('click', function() {
                closeNavMenu();
            });
        }
        
        // Close menu when clicking outside (only on mobile backdrop area)
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navToggle.contains(e.target) && 
                !navMenu.contains(e.target) &&
                window.innerWidth < 768) {
                closeNavMenu();
            }
        });
        
        // Close menu when clicking on nav links and action buttons
        const navLinks = navMenu.querySelectorAll('.nav-link, .nav-cart-btn, .nav-apply-btn, .nav-track-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeNavMenu();
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeNavMenu();
            }
        });
    }
}

// Dropdown functionality
function initializeDropdown() {
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdown = dropdownBtn?.closest('.dropdown');
    
    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking on dropdown items
        const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        });
        
        // Close dropdown on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
}

// Cart functionality (for navigation display)
function initializeCart() {
    updateCartCount();
}

function getCart() {
    try {
        const cartData = localStorage.getItem('chitram_cart');
        return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('chitram_cart', JSON.stringify(cart));
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'chitram_cart',
            newValue: JSON.stringify(cart)
        }));
    } catch (error) {
        console.error('Error saving cart:', error);
        showToast('Error saving cart changes', 'error');
    }
}

function updateCartCount() {
    const cart = getCart();
    const cartCountElement = document.getElementById('cartCount');
    const cartCountMobileElement = document.getElementById('cartCountMobile');
    
    // Update desktop cart count
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
    
    // Update mobile cart count
    if (cartCountMobileElement) {
        cartCountMobileElement.textContent = cart.length;
    }
}

// Cart Page Specific Functionality
function initializeCartPage() {
    const cartPage = new CartPage();
    window.cartPage = cartPage; // Make it globally accessible
}

class CartPage {
    constructor() {
        this.platformCommission = 25;
        this.discountAmount = 0;
        this.init();
    }

    init() {
        this.loadCartItems();
        this.bindEvents();
        this.loadRecentlyViewed();
    }

    bindEvents() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }

        // Promo code
        const applyPromoBtn = document.getElementById('apply-promo-btn');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'chitram_cart') {
                this.loadCartItems();
            }
        });

        // Listen for cart updates from other parts of the page
        window.addEventListener('cartUpdated', () => {
            this.loadCartItems();
        });
    }

    loadCartItems() {
        const cartItems = getCart();
        this.displayCartItems(cartItems);
        this.updateOrderSummary(cartItems);
        this.updateCartCount();
        this.toggleClearButton(cartItems.length > 0);
    }

    displayCartItems(items) {
        const cartItemsList = document.getElementById('cart-items-list');
        const emptyMessage = document.getElementById('empty-cart-message');
        const cartItemsCount = document.getElementById('cart-items-count');

        // Update items count
        if (cartItemsCount) {
            cartItemsCount.textContent = items.length;
        }

        if (items.length === 0) {
            if (emptyMessage) {
                emptyMessage.style.display = 'block';
            }
            cartItemsList.innerHTML = '';
            if (emptyMessage) {
                cartItemsList.appendChild(emptyMessage);
            }
            return;
        }

        if (emptyMessage) {
            emptyMessage.style.display = 'none';
        }
        
        const itemsHTML = items.map(item => this.createCartItemHTML(item)).join('');
        cartItemsList.innerHTML = itemsHTML;

        // Bind remove buttons
        const removeButtons = cartItemsList.querySelectorAll('.remove-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = btn.closest('.cart-item').dataset.itemId;
                this.removeItem(itemId);
            });
        });
    }

    createCartItemHTML(item) {
        const imageUrl = this.getImageUrl(item.art_image);
        const addedTime = this.getRelativeTime(item.added_at || new Date().toISOString());
        
        return `
            <div class="cart-item" data-item-id="${item.unique_id}">
                <div class="item-image">
                    <img src="${imageUrl}" alt="${item.art_name}" 
                         onerror="this.onerror=null; this.style.display='none'; this.parentNode.innerHTML='<div class=\\"image-placeholder\\"><i class=\\"fas fa-image\\"></i></div>';">
                </div>
                
                <div class="item-details">
                    <h4 class="item-name">${this.escapeHtml(item.art_name)}</h4>
                    <p class="item-artist">by ${this.escapeHtml(item.artist_name || 'Unknown Artist')}</p>
                    <p class="item-added">Added ${addedTime}</p>
                </div>
                
                <div class="item-price">
                    <span class="price">₹${this.formatPrice(item.cost)}</span>
                </div>
                
                <div class="item-actions">
                    <button class="remove-btn" title="Remove from cart">
                        <i class="fas fa-trash"></i>
                    </button>
                    <a href="/artwork/${item.unique_id}" class="view-btn" title="View details">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </div>
        `;
    }

    updateOrderSummary(items) {
        const totalItems = items.length;
        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
        const total = subtotal + this.platformCommission - this.discountAmount;

        // Update DOM elements
        const totalItemsEl = document.getElementById('total-items');
        const subtotalAmountEl = document.getElementById('subtotal-amount');
        const totalAmountEl = document.getElementById('total-amount');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (totalItemsEl) totalItemsEl.textContent = totalItems;
        if (subtotalAmountEl) subtotalAmountEl.textContent = `₹${this.formatPrice(subtotal)}`;
        if (totalAmountEl) totalAmountEl.textContent = `₹${this.formatPrice(total)}`;

        // Enable/disable checkout button
        if (checkoutBtn) {
            if (totalItems > 0) {
                checkoutBtn.disabled = false;
                checkoutBtn.classList.remove('disabled');
            } else {
                checkoutBtn.disabled = true;
                checkoutBtn.classList.add('disabled');
            }
        }

        // Show/hide discount row
        const discountRow = document.querySelector('.discount-row');
        if (discountRow) {
            if (this.discountAmount > 0) {
                discountRow.style.display = 'flex';
                const discountAmountEl = discountRow.querySelector('.discount-amount');
                if (discountAmountEl) {
                    discountAmountEl.textContent = `-₹${this.formatPrice(this.discountAmount)}`;
                }
            } else {
                discountRow.style.display = 'none';
            }
        }
    }

    removeItem(itemId) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            let cart = getCart();
            cart = cart.filter(item => item.unique_id !== itemId);
            saveCart(cart);
            this.loadCartItems();
            updateCartCount();
            showToast('Item removed from cart', 'success');
        }
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            saveCart([]);
            this.loadCartItems();
            updateCartCount();
            showToast('Cart cleared successfully', 'success');
        }
    }

    toggleClearButton(show) {
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.style.display = show ? 'flex' : 'none';
        }
    }

    proceedToCheckout() {
        const cart = getCart();
        if (cart.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        // Show loading state
        const checkoutBtn = document.getElementById('checkout-btn');
        const btnContent = checkoutBtn.querySelector('span');
        const btnLoader = checkoutBtn.querySelector('.btn-loader');
        
        if (btnContent && btnLoader) {
            btnContent.style.display = 'none';
            btnLoader.style.display = 'flex';
        }

        // Simulate processing delay
        setTimeout(() => {
            window.location.href = '/checkout';
        }, 1000);
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promo-code');
        const promoCode = promoInput?.value.trim().toUpperCase();
        
        if (!promoCode) {
            showToast('Please enter a promo code', 'error');
            return;
        }

        // Simulate promo code validation
        const validPromoCodes = {
            'WELCOME10': 10,
            'SAVE20': 20,
            'CHITRAM15': 15
        };

        if (validPromoCodes[promoCode]) {
            this.discountAmount = validPromoCodes[promoCode];
            this.loadCartItems(); // Refresh to show discount
            showToast(`Promo code applied! ₹${this.discountAmount} discount`, 'success');
            promoInput.value = '';
        } else {
            showToast('Invalid promo code', 'error');
        }
    }

    loadRecentlyViewed() {
        // This would typically load from localStorage or API
        // For now, we'll hide the section
        const recentlyViewedSection = document.querySelector('.recently-viewed-section');
        if (recentlyViewedSection) {
            recentlyViewedSection.style.display = 'none';
        }
    }

    getImageUrl(imagePath) {
        if (!imagePath) return '/images/placeholder-artwork.jpg';
        
        // Handle different image path formats
        if (imagePath.startsWith('http')) {
            return imagePath;
        } else if (imagePath.startsWith('/')) {
            return imagePath;
        } else {
            return `/uploads/artworks/${imagePath}`;
        }
    }

    getRelativeTime(dateString) {
        try {
            const now = new Date();
            const addedDate = new Date(dateString);
            const diffInSeconds = Math.floor((now - addedDate) / 1000);

            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            return `${Math.floor(diffInSeconds / 86400)} days ago`;
        } catch (error) {
            return 'recently';
        }
    }

    formatPrice(price) {
        return parseFloat(price || 0).toLocaleString('en-IN');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }

    updateCartCount() {
        updateCartCount(); // Call the global function
    }
}

// Toast notification system
function initializeToast() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon"></i>
                <span class="toast-message"></span>
            </div>
        `;
        document.body.appendChild(toast);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon and style based on type
    toast.className = `toast ${type}`;
    
    switch (type) {
        case 'success':
            toastIcon.className = 'toast-icon fas fa-check-circle';
            break;
        case 'error':
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
            break;
        case 'warning':
            toastIcon.className = 'toast-icon fas fa-exclamation-triangle';
            break;
        default:
            toastIcon.className = 'toast-icon fas fa-info-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu and dropdown
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const navToggle = document.getElementById('navToggle');
            if (navToggle) {
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        }
        
        // Close dropdown
        const dropdown = document.querySelector('.dropdown.active');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
});

// Add to cart functionality for other pages
function addToCart(artworkData) {
    let cart = getCart();
    
    // Check if item already exists
    const existingItem = cart.find(item => item.unique_id === artworkData.unique_id);
    
    if (existingItem) {
        showToast('Item already in cart', 'warning');
        return false;
    }
    
    // Add timestamp
    artworkData.added_at = new Date().toISOString();
    
    // Add to cart
    cart.push(artworkData);
    saveCart(cart);
    updateCartCount();
    
    showToast('Added to cart successfully!', 'success');
    return true;
}
