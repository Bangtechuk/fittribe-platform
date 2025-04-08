// Dashboard JavaScript for FitTribe.fitness

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard functionality
    initDashboard();
    
    // Set up tab switching
    setupTabSwitching();
    
    // Set up logout button
    setupLogout();
});

// Initialize dashboard based on user role
function initDashboard() {
    // Get user data from localStorage
    const userData = localStorage.getItem('fittribe_user');
    
    if (!userData) {
        // If no user data, redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const userEmail = user.email.toLowerCase();
    
    // Determine user role based on email
    let userRole = 'client'; // Default role
    
    if (userEmail.includes('admin')) {
        userRole = 'admin';
    } else if (userEmail.includes('trainer')) {
        userRole = 'trainer';
    }
    
    // Store user role in localStorage for future reference
    user.role = userRole;
    localStorage.setItem('fittribe_user', JSON.stringify(user));
    
    // Update UI based on user role
    updateDashboardForRole(userRole, user.name);
}

// Update dashboard UI based on user role
function updateDashboardForRole(role, userName) {
    // Update greeting
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        userGreeting.textContent = `Hello, ${userName.split(' ')[0]}`;
    }
    
    // Update dashboard title and subtitle
    const dashboardTitle = document.getElementById('dashboard-title');
    const dashboardSubtitle = document.getElementById('dashboard-subtitle');
    
    if (dashboardTitle && dashboardSubtitle) {
        if (role === 'admin') {
            dashboardTitle.textContent = 'Admin Dashboard';
            dashboardSubtitle.textContent = 'Manage the FitTribe platform and users';
        } else if (role === 'trainer') {
            dashboardTitle.textContent = 'Trainer Dashboard';
            dashboardSubtitle.textContent = 'Manage your sessions, clients, and profile';
        } else {
            dashboardTitle.textContent = 'Client Dashboard';
            dashboardSubtitle.textContent = 'Track your fitness journey and upcoming sessions';
        }
    }
    
    // Show/hide role-specific tabs
    const trainerOnlyElements = document.querySelectorAll('.trainer-only');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const clientOnlyElements = document.querySelectorAll('.client-only');
    
    // Hide all role-specific elements first
    trainerOnlyElements.forEach(el => el.style.display = 'none');
    adminOnlyElements.forEach(el => el.style.display = 'none');
    clientOnlyElements.forEach(el => el.style.display = 'none');
    
    // Show elements based on role
    if (role === 'admin') {
        adminOnlyElements.forEach(el => el.style.display = '');
        // Optionally show trainer elements for admins
        trainerOnlyElements.forEach(el => el.style.display = '');
    } else if (role === 'trainer') {
        trainerOnlyElements.forEach(el => el.style.display = '');
    } else {
        clientOnlyElements.forEach(el => el.style.display = '');
    }
    
    // Update dashboard content based on role
    updateDashboardContent(role);
}

// Update dashboard content based on user role
function updateDashboardContent(role) {
    // Get all dashboard content sections
    const overviewContent = document.getElementById('overview-content');
    const clientsContent = document.getElementById('clients-content');
    const adminContent = document.getElementById('admin-content');
    
    if (role === 'admin') {
        // Update admin-specific content
        if (adminContent) {
            // Populate admin stats
            const pendingVerifications = adminContent.querySelector('.pending-verifications');
            if (pendingVerifications) {
                pendingVerifications.textContent = '12';
            }
            
            const activeUsers = adminContent.querySelector('.active-users');
            if (activeUsers) {
                activeUsers.textContent = '256';
            }
            
            const totalRevenue = adminContent.querySelector('.total-revenue');
            if (totalRevenue) {
                totalRevenue.textContent = '$12,450';
            }
        }
        
        // Make admin tab active by default for admins
        const adminTab = document.querySelector('[data-tab="admin"]');
        if (adminTab) {
            setTimeout(() => {
                adminTab.click();
            }, 100);
        }
    } else if (role === 'trainer') {
        // Update trainer-specific content
        if (clientsContent) {
            // Populate trainer stats
            const totalClients = clientsContent.querySelector('.total-clients');
            if (totalClients) {
                totalClients.textContent = '8';
            }
            
            const completedSessions = clientsContent.querySelector('.completed-sessions');
            if (completedSessions) {
                completedSessions.textContent = '24';
            }
            
            const earnings = clientsContent.querySelector('.earnings');
            if (earnings) {
                earnings.textContent = '$1,250';
            }
        }
        
        // Update overview content for trainers
        if (overviewContent) {
            const upcomingSessions = overviewContent.querySelector('.upcoming-sessions');
            if (upcomingSessions) {
                upcomingSessions.textContent = '5';
            }
            
            const completedSessionsOverview = overviewContent.querySelector('.completed-sessions');
            if (completedSessionsOverview) {
                completedSessionsOverview.textContent = '24';
            }
            
            const averageRating = overviewContent.querySelector('.average-rating');
            if (averageRating) {
                averageRating.textContent = '4.8';
            }
        }
    } else {
        // Update client-specific content
        if (overviewContent) {
            const upcomingSessions = overviewContent.querySelector('.upcoming-sessions');
            if (upcomingSessions) {
                upcomingSessions.textContent = '3';
            }
            
            const completedSessions = overviewContent.querySelector('.completed-sessions');
            if (completedSessions) {
                completedSessions.textContent = '12';
            }
            
            const favoriteTrainers = overviewContent.querySelector('.favorite-trainers');
            if (favoriteTrainers) {
                favoriteTrainers.textContent = '2';
            }
        }
    }
}

// Set up tab switching functionality
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    const contentSections = document.querySelectorAll('.dashboard-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active-tab', 'border-blue-500', 'text-blue-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            
            // Add active class to clicked tab
            this.classList.add('active-tab', 'border-blue-500', 'text-blue-600');
            this.classList.remove('border-transparent', 'text-gray-500');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Show selected content section
            const tabName = this.getAttribute('data-tab');
            const selectedContent = document.getElementById(`${tabName}-content`);
            if (selectedContent) {
                selectedContent.classList.add('active');
                selectedContent.style.display = 'block';
            }
        });
    });
}

// Set up logout button functionality
function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Clear user data from localStorage
            localStorage.removeItem('fittribe_user');
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
}
