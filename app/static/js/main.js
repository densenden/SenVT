// Update clock display
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US');
    }
    if (dateElement) {
        timeElement.textContent = now.toLocaleDateString('en-US');
    }
}

// Animate number counting effect
function animateNumber(element, start, end, duration) {
    let current = start;
    const increment = (end - start) / (duration / 50);
    const timer = setInterval(() => {
        current += increment;
        element.textContent = String(Math.floor(current)).padStart(3, '0');
        if (current >= end) {
            element.textContent = String(end).padStart(3, '0');
            clearInterval(timer);
        }
    }, 50);
}

// Initialize remote control interface
function initializeRemoteControl() {
    const remoteHTML = `
        <div class="remote-control">
            <div class="remote-toggle">></div>
            <div class="remote-grid">
                <button class="remote-button" data-page="1">1</button>
                <button class="remote-button" data-page="2">2</button>
                <button class="remote-button" data-page="3">3</button>
                <button class="remote-button" data-page="4">4</button>
                <button class="remote-button" data-page="5">5</button>
                <button class="remote-button" data-page="6">6</button>
                <button class="remote-button" data-page="7">7</button>
                <button class="remote-button" data-page="8">8</button>
                <button class="remote-button" data-page="9">9</button>
                <button class="remote-button" data-page="0">0</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', remoteHTML);
    
    const remote = document.querySelector('.remote-control');
    const toggle = remote.querySelector('.remote-toggle');
    
    // Handle remote control minimization
    toggle.addEventListener('click', () => {
        remote.classList.toggle('minimized');
        toggle.textContent = remote.classList.contains('minimized') ? '<' : '>';
    });
    
    // Handle page number input
    let pageInput = '';
    const buttons = remote.querySelectorAll('.remote-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const digit = button.dataset.page;
            pageInput += digit;
            
            if (pageInput.length === 3) {
                window.location.href = `/page/${pageInput}`;
                pageInput = '';
            }
            
            // Clear input after 2 seconds of inactivity
            setTimeout(() => {
                if (pageInput.length < 3) {
                    pageInput = '';
                }
            }, 2000);
        });
    });
}

// Handle page transition animations
function handlePageTransition() {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.style.opacity = '0';
        setTimeout(() => {
            contentArea.style.opacity = '1';
        }, 100);
    }
}

// Rotating announcements
const announcements = [
    "+++ STUDIO SEN: Professional Meditation Production in Retro Videotext Design +++ Your Partner for Brand Meditation and Sound Design since 1983 +++",
    "+++ NEW: Express Meditation Service within 48h +++ Special Offer: 20% off on Brand Meditation Packages +++",
    "+++ Join our next Live Meditation Session this Friday - Register now! +++",
    "+++ Corporate Wellness Program Launch: Transform your workplace culture +++",
    "+++ New Voice Talent Added: Experience meditation in 5 new languages +++",
    "+++ Download our Free Meditation Starter Guide +++",
    "+++ Early Bird Special: 30% off on Annual Subscriptions until end of month +++",
    "+++ Join our Meditation Community: Share experiences & grow together +++",
    "+++ New AI-powered Sound Design feature launched +++",
    "+++ Book a Free Consultation for Corporate Meditation Programs +++",
    "+++ Special Bundle: Personal Manifestation + Sound Design Package +++"
];

// Update announcement display
function updateAnnouncement() {
    const announcement = document.querySelector('.announcement');
    if (announcement) {
        const randomIndex = Math.floor(Math.random() * announcements.length);
        announcement.textContent = announcements[randomIndex];
    }
}

// Initialize all features on page load
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    initializeRemoteControl();
    handlePageTransition();
    updateAnnouncement();
    
    // Update clock every second
    setInterval(updateClock, 1000);
    
    // Update announcement every 10 seconds
    setInterval(updateAnnouncement, 10000);
    
    // Make remote control draggable
    const remote = document.querySelector('.remote-control');
    if (remote) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        remote.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Start dragging
        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === remote) {
                isDragging = true;
            }
        }

        // Handle drag movement
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                remote.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }

        // End dragging
        function dragEnd() {
            isDragging = false;
        }
    }
    
    // Animate page number on initial load
    const pageIndicator = document.querySelector('.page-indicator span:last-child');
    if (pageIndicator) {
        const pageNumber = parseInt(pageIndicator.textContent);
        if (!isNaN(pageNumber)) {
            animateNumber(pageIndicator, 0, pageNumber, 1000);
        }
    }
}); 