// Main JavaScript for FitTribe.fitness

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Get all mobile menu buttons
    const mobileMenuButtons = document.querySelectorAll('button[aria-expanded]');
    
    mobileMenuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
            
            // Find the mobile menu - this is a simplified example
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // Basic validation example
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('border-red-500');
                    
                    // Add error message if it doesn't exist
                    let errorMsg = field.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('p');
                        errorMsg.className = 'text-red-500 text-xs mt-1 error-message';
                        errorMsg.textContent = 'This field is required';
                        field.parentNode.appendChild(errorMsg);
                    }
                } else {
                    field.classList.remove('border-red-500');
                    const errorMsg = field.parentNode.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            // Email validation for email fields
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value.trim() && !validateEmail(field.value)) {
                    isValid = false;
                    field.classList.add('border-red-500');
                    
                    // Add error message if it doesn't exist
                    let errorMsg = field.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('p');
                        errorMsg.className = 'text-red-500 text-xs mt-1 error-message';
                        errorMsg.textContent = 'Please enter a valid email address';
                        field.parentNode.appendChild(errorMsg);
                    } else {
                        errorMsg.textContent = 'Please enter a valid email address';
                    }
                }
            });
            
            // Password matching for signup form
            const password = form.querySelector('#password');
            const passwordConfirm = form.querySelector('#password-confirm');
            if (password && passwordConfirm && password.value !== passwordConfirm.value) {
                isValid = false;
                passwordConfirm.classList.add('border-red-500');
                
                // Add error message if it doesn't exist
                let errorMsg = passwordConfirm.parentNode.querySelector('.error-message');
                if (!errorMsg) {
                    errorMsg = document.createElement('p');
                    errorMsg.className = 'text-red-500 text-xs mt-1 error-message';
                    errorMsg.textContent = 'Passwords do not match';
                    passwordConfirm.parentNode.appendChild(errorMsg);
                } else {
                    errorMsg.textContent = 'Passwords do not match';
                }
            }
            
            // If the form is not valid, prevent submission
            if (!isValid) {
                event.preventDefault();
            } else {
                // For demo purposes, we'll simulate a successful login/signup
                // In a real application, this would be handled by the backend
                localStorage.setItem('fittribe_user', JSON.stringify({
                    email: form.querySelector('#email').value,
                    isLoggedIn: true,
                    name: form.querySelector('#first-name') ? 
                          `${form.querySelector('#first-name').value} ${form.querySelector('#last-name').value}` : 
                          'FitTribe User'
                }));
            }
        });
        
        // Clear validation errors when user types
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('border-red-500');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
    });
    
    // Check if user is logged in
    checkLoginStatus();

    // Initialize trainer filter functionality
    initTrainerFilters();
});

// Email validation helper
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Check login status and update UI accordingly
function checkLoginStatus() {
    const userData = localStorage.getItem('fittribe_user');
    
    if (userData) {
        const user = JSON.parse(userData);
        
        // Update navigation
        const loginLink = document.querySelector('a[href="login.html"]');
        const signupLink = document.querySelector('a[href="signup.html"]');
        
        if (loginLink && signupLink) {
            // Replace login/signup with user info and logout
            const parentDiv = loginLink.parentNode;
            
            // Clear existing links
            parentDiv.innerHTML = '';
            
            // Add user greeting and logout button
            const userGreeting = document.createElement('span');
            userGreeting.className = 'text-gray-700 font-medium mr-4';
            userGreeting.textContent = `Hello, ${user.name.split(' ')[0]}`;
            
            const logoutButton = document.createElement('a');
            logoutButton.href = '#';
            logoutButton.className = 'btn-primary bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg';
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('fittribe_user');
                window.location.href = 'index.html';
            });
            
            parentDiv.appendChild(userGreeting);
            parentDiv.appendChild(logoutButton);
        }
    }
}

// Initialize trainer filter functionality
function initTrainerFilters() {
    // Check if we're on the trainers page
    if (!document.querySelector('.trainer-card')) return;

    // Get all trainer cards
    const trainerCards = document.querySelectorAll('.trainer-card');
    
    // Get filter elements
    const searchInput = document.getElementById('search');
    const specialtySelect = document.getElementById('specialty');
    const priceSelect = document.getElementById('price');
    const searchButton = document.querySelector('button[type="button"]');
    
    // Get rating checkboxes
    const ratingCheckboxes = document.querySelectorAll('input[name="rating"]');
    
    // Get availability checkboxes
    const availabilityCheckboxes = document.querySelectorAll('input[id^="availability-"]');
    
    // Get session type checkboxes
    const sessionTypeCheckboxes = document.querySelectorAll('input[id^="session-"]');
    
    // Get experience level checkboxes
    const experienceLevelCheckboxes = document.querySelectorAll('input[id^="level-"]');
    
    // Get sort select
    const sortSelect = document.getElementById('sort');
    
    // Add event listener to search button
    searchButton.addEventListener('click', filterTrainers);
    
    // Add event listeners to all filter inputs for real-time filtering
    if (searchInput) searchInput.addEventListener('input', filterTrainers);
    if (specialtySelect) specialtySelect.addEventListener('change', filterTrainers);
    if (priceSelect) priceSelect.addEventListener('change', filterTrainers);
    if (sortSelect) sortSelect.addEventListener('change', sortTrainers);
    
    // Add event listeners to checkboxes
    ratingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterTrainers);
    });
    
    availabilityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterTrainers);
    });
    
    sessionTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterTrainers);
    });
    
    experienceLevelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterTrainers);
    });
    
    // Filter trainers function
    function filterTrainers() {
        // Get filter values
        const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
        const specialtyValue = specialtySelect ? specialtySelect.value.toLowerCase() : '';
        const priceValue = priceSelect ? priceSelect.value : '';
        
        // Get selected ratings
        const selectedRatings = [];
        ratingCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const rating = parseFloat(checkbox.id.replace('rating-', ''));
                selectedRatings.push(rating);
            }
        });
        
        // Get selected availabilities
        const selectedAvailabilities = [];
        availabilityCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const availability = checkbox.id.replace('availability-', '');
                selectedAvailabilities.push(availability);
            }
        });
        
        // Get selected session types
        const selectedSessionTypes = [];
        sessionTypeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const sessionType = checkbox.id.replace('session-', '');
                selectedSessionTypes.push(sessionType);
            }
        });
        
        // Get selected experience levels
        const selectedExperienceLevels = [];
        experienceLevelCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const experienceLevel = checkbox.id.replace('level-', '');
                selectedExperienceLevels.push(experienceLevel);
            }
        });
        
        // Parse price range
        let minPrice = 0;
        let maxPrice = Infinity;
        if (priceValue) {
            if (priceValue === '0-30') {
                minPrice = 0;
                maxPrice = 30;
            } else if (priceValue === '30-50') {
                minPrice = 30;
                maxPrice = 50;
            } else if (priceValue === '50-75') {
                minPrice = 50;
                maxPrice = 75;
            } else if (priceValue === '75+') {
                minPrice = 75;
                maxPrice = Infinity;
            }
        }
        
        // Filter trainer cards
        trainerCards.forEach(card => {
            // Get trainer data
            const trainerName = card.querySelector('h3').textContent.toLowerCase();
            const trainerSpecialty = card.querySelector('p').textContent.toLowerCase();
            const trainerPrice = parseFloat(card.querySelector('.price').textContent.replace('$', ''));
            const trainerRating = parseFloat(card.querySelector('.rating').textContent);
            const trainerAvailability = card.querySelector('.availability').textContent.toLowerCase();
            
            // Additional data (may not be present in all cards)
            const trainerSessionType = card.querySelector('.session-type') ? 
                                      card.querySelector('.session-type').textContent.toLowerCase() : '';
            const trainerExperienceLevel = card.querySelector('.experience-level') ? 
                                          card.querySelector('.experience-level').textContent.toLowerCase() : '';
            
            // Check if trainer matches search criteria
            const matchesSearch = !searchValue || 
                                 trainerName.includes(searchValue) || 
                                 trainerSpecialty.includes(searchValue);
            
            // Check if trainer matches specialty
            const matchesSpecialty = !specialtyValue || trainerSpecialty.includes(specialtyValue);
            
            // Check if trainer matches price range
            const matchesPrice = trainerPrice >= minPrice && trainerPrice <= maxPrice;
            
            // Check if trainer matches rating
            const matchesRating = selectedRatings.length === 0 || 
                                 selectedRatings.some(rating => trainerRating >= rating);
            
            // Check if trainer matches availability
            const matchesAvailability = selectedAvailabilities.length === 0 || 
                                       selectedAvailabilities.some(availability => 
                                           trainerAvailability.includes(availability.toLowerCase()));
            
            // Check if trainer matches session type
            const matchesSessionType = selectedSessionTypes.length === 0 || 
                                      selectedSessionTypes.some(sessionType => 
                                          trainerSessionType.includes(sessionType.toLowerCase()));
            
            // Check if trainer matches experience level
            const matchesExperienceLevel = selectedExperienceLevels.length === 0 || 
                                          selectedExperienceLevels.some(experienceLevel => 
                                              trainerExperienceLevel.includes(experienceLevel.toLowerCase()));
            
            // Show or hide trainer card based on filter criteria
            if (matchesSearch && matchesSpecialty && matchesPrice && 
                matchesRating && matchesAvailability && 
                matchesSessionType && matchesExperienceLevel) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update trainer count
        updateTrainerCount();
    }
    
    // Sort trainers function
    function sortTrainers() {
        if (!sortSelect) return;
        
        const sortValue = sortSelect.value;
        const trainerContainer = document.querySelector('.trainer-container');
        const trainers = Array.from(trainerCards);
        
        // Sort trainers based on selected criteria
        trainers.sort((a, b) => {
            if (sortValue === 'price-low') {
                const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', ''));
                return priceA - priceB;
            } else if (sortValue === 'price-high') {
                const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.price').textConten
(Content truncated due to size limit. Use line ranges to read in chunks)