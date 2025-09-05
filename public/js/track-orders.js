// Track Orders Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDropdown();
    initializeCart();
    initializeToast();
    initializeOrderTracking();
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

// Order tracking functionality
function initializeOrderTracking() {
    const trackingForm = document.getElementById('trackingForm');
    
    if (trackingForm) {
        trackingForm.addEventListener('submit', handleOrderTracking);
    }
}

async function handleOrderTracking(e) {
    e.preventDefault();
    
    const trackBtn = document.getElementById('trackBtn');
    const trackText = document.getElementById('trackText');
    const trackSpinner = document.getElementById('trackSpinner');
    const btnContent = trackBtn.querySelector('.btn-content');
    
    // Show loading state
    trackBtn.disabled = true;
    btnContent.style.display = 'none';
    trackSpinner.classList.remove('hidden');
    
    // Hide previous results
    clearResults();
    
    try {
        const formData = new FormData(e.target);
        const data = {
            order_id: formData.get('order_id').trim(),
            email: formData.get('email').trim()
        };
        
        // Validate input
        if (!data.order_id || !data.email) {
            throw new Error('Please fill in all required fields');
        }
        
        const response = await fetch('/api/track-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success && result.order) {
            displayOrderDetails(result.order);
            showToast('Order found successfully!', 'success');
        } else {
            showError(result.error || 'Order not found. Please check your details and try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Error tracking order. Please try again.');
    } finally {
        // Reset button state
        trackBtn.disabled = false;
        btnContent.style.display = 'flex';
        trackSpinner.classList.add('hidden');
    }
}

function displayOrderDetails(order) {
    const orderResultSection = document.getElementById('orderResultSection');
    const orderResult = document.getElementById('orderResult');
    
    // Status color mapping
    const statusColors = {
        'placed': '#ffc107',
        'seen': '#17a2b8',
        'contacted': '#6f42c1',
        'sold': '#fd7e14',
        'delivered': '#28a745',
        'canceled': '#dc3545'
    };
    
    // Status descriptions
    const statusDescriptions = {
        'placed': 'Your order has been placed successfully and is awaiting review',
        'seen': 'Your order has been reviewed by our team and is being processed',
        'contacted': 'We have contacted you regarding your order details and delivery',
        'sold': 'Your artwork has been confirmed and is being prepared for delivery',
        'delivered': 'Your order has been successfully delivered to you',
        'canceled': 'Your order has been canceled. Please contact support for details'
    };
    
    const statusColor = statusColors[order.status] || '#6c757d';
    const statusDescription = statusDescriptions[order.status] || 'Order status update';
    
    // Format item list
    let itemsHTML = '';
    if (order.item_list && order.item_list.length > 0) {
        itemsHTML = order.item_list.map(item => `
            <div class="order-item">
                <span class="item-name">${escapeHtml(item.name || 'Artwork')}</span>
                <span class="item-price">₹${parseFloat(item.price || 0).toLocaleString()}</span>
            </div>
        `).join('');
    } else {
        itemsHTML = '<div class="order-item"><span class="item-name">Item details not available</span><span class="item-price">-</span></div>';
    }
    
    // Format dates
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not available';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };
    
    orderResult.innerHTML = `
        <div class="order-card">
            <div class="order-header">
                <h2>Order Details</h2>
                <div class="order-status" style="background-color: ${statusColor}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
            </div>
            
            <div class="order-info">
                <div class="info-section">
                    <h3>Order Information</h3>
                    <div class="info-row">
                        <span class="label">Order ID:</span>
                        <span class="value">${escapeHtml(order.order_id)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Customer:</span>
                        <span class="value">${escapeHtml(order.customer_name)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Email:</span>
                        <span class="value">${escapeHtml(order.customer_email)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Phone:</span>
                        <span class="value">${escapeHtml(order.customer_phone || 'Not provided')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Total Amount:</span>
                        <span class="value total-amount">₹${order.total_amount.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Order Timeline</h3>
                    <div class="info-row">
                        <span class="label">Order Placed:</span>
                        <span class="value">${formatDate(order.creation_date)}</span>
                    </div>
                    ${order.received_date ? `
                        <div class="info-row">
                            <span class="label">Order Received:</span>
                            <span class="value">${formatDate(order.received_date)}</span>
                        </div>
                    ` : ''}
                    ${order.delivered_date ? `
                        <div class="info-row">
                            <span class="label">Order Delivered:</span>
                            <span class="value">${formatDate(order.delivered_date)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="info-section">
                    <h3>Items (${order.item_count || 1})</h3>
                    <div class="order-items">
                        ${itemsHTML}
                    </div>
                </div>
                
                <div class="status-description">
                    <p><strong>Status:</strong> ${statusDescription}</p>
                </div>
            </div>
        </div>
    `;
    
    orderResultSection.classList.remove('hidden');
    
    // Smooth scroll to results
    setTimeout(() => {
        orderResultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorSection.classList.remove('hidden');
    
    // Smooth scroll to error
    setTimeout(() => {
        errorSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

function clearResults() {
    const orderResultSection = document.getElementById('orderResultSection');
    const errorSection = document.getElementById('errorSection');
    
    orderResultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global function for retry button
window.clearResults = clearResults;

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
