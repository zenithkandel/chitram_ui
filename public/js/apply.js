// Apply as Artist Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDropdown();
    initializeCart();
    initializeToast();
    initializeApplicationForm();
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

// Application Form Functionality
function initializeApplicationForm() {
    const applicationForm = document.getElementById('applicationForm');
    const profilePictureInput = document.getElementById('profilePicture');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.querySelector('.image-preview');
    const submitBtn = document.querySelector('.submit-btn');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnContent = document.querySelector('.btn-content');
    const applicationSection = document.querySelector('.application-section');
    const successSection = document.querySelector('.success-section');

    // Image Preview Functionality
    if (profilePictureInput && imagePreview) {
        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showToast('Please select a valid image file', 'error');
                    return;
                }
                
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image size must be less than 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    previewContainer.classList.remove('empty');
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.classList.add('hidden');
                previewContainer.classList.add('empty');
            }
        });
    }

    // Form Submission
    if (applicationForm) {
        applicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateApplicationForm()) {
                return;
            }
            
            // Show loading state
            setLoadingState(true);
            
            try {
                const formData = new FormData(applicationForm);
                
                const response = await fetch('/api/applications/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showApplicationSuccess();
                } else {
                    throw new Error(result.message || 'Failed to submit application');
                }
            } catch (error) {
                console.error('Error submitting application:', error);
                showToast('Failed to submit application. Please try again.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Submit another application button
    const submitAnotherBtn = document.getElementById('submitAnother');
    if (submitAnotherBtn) {
        submitAnotherBtn.addEventListener('click', function() {
            resetApplicationForm();
        });
    }

    // Form field focus effects
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6366f1';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '';
            }
        });
    });
}

// Form Validation
function validateApplicationForm() {
    const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'dateOfBirth',
        'address',
        'experience',
        'specialization',
        'bio'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else if (field) {
            field.style.borderColor = '';
        }
    });
    
    // Email validation
    const email = document.getElementById('email');
    if (email && email.value && !isValidEmail(email.value)) {
        email.style.borderColor = '#ef4444';
        showToast('Please enter a valid email address', 'error');
        isValid = false;
    }
    
    // Phone validation
    const phone = document.getElementById('phone');
    if (phone && phone.value && !isValidPhone(phone.value)) {
        phone.style.borderColor = '#ef4444';
        showToast('Please enter a valid phone number', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showToast('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Loading state management
function setLoadingState(loading) {
    const submitBtn = document.querySelector('.submit-btn');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnContent = document.querySelector('.btn-content');
    
    if (submitBtn && loadingSpinner && btnContent) {
        if (loading) {
            submitBtn.disabled = true;
            btnContent.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnContent.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    }
}

// Show success section
function showApplicationSuccess() {
    const applicationSection = document.querySelector('.application-section');
    const successSection = document.querySelector('.success-section');
    
    if (applicationSection && successSection) {
        applicationSection.classList.add('hidden');
        successSection.classList.remove('hidden');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Reset form for new application
function resetApplicationForm() {
    const applicationForm = document.getElementById('applicationForm');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.querySelector('.image-preview');
    const applicationSection = document.querySelector('.application-section');
    const successSection = document.querySelector('.success-section');
    
    // Reset form
    if (applicationForm) {
        applicationForm.reset();
    }
    
    // Clear image preview
    if (imagePreview && previewContainer) {
        imagePreview.classList.add('hidden');
        previewContainer.classList.add('empty');
    }
    
    // Show form section
    if (applicationSection && successSection) {
        successSection.classList.add('hidden');
        applicationSection.classList.remove('hidden');
    }
    
    // Scroll to form
    if (applicationSection) {
        applicationSection.scrollIntoView({ behavior: 'smooth' });
    }
}
