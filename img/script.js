// JSONBin.io Configuration - REPLACE WITH YOUR ACTUAL KEYS
const JSONBIN_API_KEY = '$2a$10$XN/2XPsncjl8IwhQVRJbPu0lZ.zKavKkCUQjMZaMuKnIHqgV/.fua'; // Get from jsonbin.io
const JSONBIN_BIN_ID = '68ea57ea43b1c97be962af9b'; // Get from jsonbin.io

let recentEntries = [];

// Initialize with data from JSONBin
async function initializeDefaultData() {
    try {
        const data = await fetchFromJSONBin();
        if (data && data.length > 0) {
            recentEntries = data;
            console.log('Loaded data from JSONBin:', recentEntries.length, 'entries');
        } else {
            // Initialize with default data if no data exists
            const defaultData = [
                { center: "Dharoi Dam", ph: 7.2, dissolvedOxygen: 8.5, turbidity: 12, temperature: 28, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Kheralu", ph: 7.3, dissolvedOxygen: 7.8, turbidity: 18, temperature: 29, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Gandhinagar", ph: 7.8, dissolvedOxygen: 6.2, turbidity: 28, temperature: 30, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Ahmedabad", ph: 7.5, dissolvedOxygen: 5.8, turbidity: 35, temperature: 31, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Vataman", ph: 8.1, dissolvedOxygen: 4.2, turbidity: 52, temperature: 32, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Nadiad", ph: 7.7, dissolvedOxygen: 5.5, turbidity: 38, temperature: 30, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Vautha", ph: 7.6, dissolvedOxygen: 6.0, turbidity: 30, temperature: 29, timestamp: new Date().toLocaleString('en-IN') },
                { center: "Khambhat", ph: 7.4, dissolvedOxygen: 7.2, turbidity: 22, temperature: 28, timestamp: new Date().toLocaleString('en-IN') }
            ];
            recentEntries = defaultData;
            await saveToJSONBin(recentEntries);
            console.log('Initialized with default data');
        }
        updateStats();
        updateRecentEntries();
    } catch (error) {
        console.error('Error initializing data:', error);
        showStatus('Error loading data from cloud storage', 'error');
    }
}

// Fetch data from JSONBin.io
async function fetchFromJSONBin() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.record || [];
        } else {
            console.error('JSONBin fetch error:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('JSONBin fetch error:', error);
        return null;
    }
}

// Save data to JSONBin.io
async function saveToJSONBin(data) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Data saved to JSONBin. Version:', result.metadata?.version);
            return true;
        } else {
            const errorText = await response.text();
            console.error('JSONBin save error:', errorText);
            return false;
        }
    } catch (error) {
        console.error('JSONBin save error:', error);
        return false;
    }
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    
    // Get form data
    const formData = {
        center: document.getElementById('center').value,
        ph: parseFloat(document.getElementById('ph').value),
        dissolvedOxygen: parseFloat(document.getElementById('dissolvedOxygen').value),
        turbidity: parseFloat(document.getElementById('turbidity').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    // Validate form data
    if (!validateFormData(formData)) {
        showStatus('Please check your input values. Some values may be out of range.', 'error');
        return;
    }

    // Add loading animation
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div>Submitting to Cloud...';

    try {
        // Add to recent entries
        recentEntries.unshift(formData);
        if (recentEntries.length > 50) recentEntries.pop();
        
        // Save to JSONBin.io cloud database
        const cloudSuccess = await saveToJSONBin(recentEntries);
        
        if (cloudSuccess) {
            // Also save to localStorage as backup
            localStorage.setItem('riverMonitoringData', JSON.stringify(recentEntries));
            
            updateRecentEntries();
            updateStats();
            showStatus('Data submitted to cloud database! ✓', 'success');
            
            // Show confetti if function exists
            if (typeof triggerConfetti === 'function') {
                triggerConfetti();
            }
            
            document.getElementById('dataForm').reset();
            
            // Show dashboard link
            showDashboardLink();
        } else {
            throw new Error('Failed to save to cloud database');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error submitting data. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = '<span class="btn-text">Submit Data to Cloud</span><span class="btn-icon">📊</span>';
    }
}

// Show dashboard link after successful submission
function showDashboardLink() {
    const dashboardUrl = 'https://mainsabar.netlify.app/';
    
    setTimeout(() => {
        const statusMsg = document.getElementById('statusMessage');
        statusMsg.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 10px;">✅ Data saved to cloud database!</div>
                <a href="${dashboardUrl}" target="_blank" 
                   style="color: white; text-decoration: underline; font-weight: bold; 
                          background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 5px;
                          display: inline-block; margin-top: 5px;">
                   📊 Open Live Dashboard →
                </a>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                    Data will auto-refresh on dashboard
                </div>
            </div>
        `;
        statusMsg.style.display = 'block';
    }, 1000);
}

// Add this HTML to your admin panel for dashboard link
function addDashboardLinkButton() {
    const dashboardLinkHtml = `
        <div class="dashboard-link-container" style="text-align: center; margin: 20px 0;">
            <a href="https://mainsabar.netlify.app/" target="_blank" class="btn-dashboard">
                <span class="btn-text">Open Live Dashboard</span>
                <span class="btn-icon">📈</span>
            </a>
        </div>
    `;
    
    // Add it before the form or wherever you prefer
    const form = document.getElementById('dataForm');
    if (form) {
        form.insertAdjacentHTML('beforebegin', dashboardLinkHtml);
    }
}

// Add this CSS for the dashboard button
function addDashboardButtonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .btn-dashboard {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .btn-dashboard:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// VALIDATION FUNCTION
function validateFormData(data) {
    if (data.ph < 0 || data.ph > 14) return false;
    if (data.dissolvedOxygen < 0) return false;
    if (data.turbidity < 0) return false;
    if (data.temperature < -10 || data.temperature > 50) return false;
    return true;
}

// STATUS MESSAGE FUNCTION
function showStatus(message, type) {
    const statusMsg = document.getElementById('statusMessage');
    if (statusMsg) {
        statusMsg.textContent = message;
        statusMsg.className = `status-message ${type}`;
        statusMsg.style.display = 'block';
        setTimeout(() => { statusMsg.style.display = 'none'; }, 5000);
    }
}

// UPDATE RECENT ENTRIES
function updateRecentEntries() {
    const container = document.getElementById('recentEntries');
    if (!container) return;
    
    if (recentEntries.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; font-size: 14px; text-align: center; padding: 20px;">No entries yet. Submit your first data entry above!</p>';
        return;
    }
    const displayEntries = recentEntries.slice(0, 5);
    container.innerHTML = displayEntries.map((entry, index) => `
        <div class="entry-item" style="animation-delay: ${index * 0.1}s">
            <strong>${entry.center}</strong> - ${entry.timestamp}
            <div class="time">
                pH: ${entry.ph} | DO: ${entry.dissolvedOxygen} mg/L | 
                Turbidity: ${entry.turbidity} NTU | Temp: ${entry.temperature}°C
            </div>
        </div>
    `).join('');
}

// UPDATE STATS
function updateStats() {
    const totalEntries = recentEntries.length;
    const today = new Date().toDateString();
    const todayEntries = recentEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp).toDateString();
        return entryDate === today;
    }).length;
    
    const totalEl = document.getElementById('totalEntries');
    const todayEl = document.getElementById('todayEntries');
    
    if (totalEl) totalEl.textContent = totalEntries;
    if (todayEl) todayEl.textContent = todayEntries;
}

// CREATE PARTICLES FUNCTION
function createParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;
    
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 15;
        const animationDuration = Math.random() * 10 + 15;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `${animationDelay}s`;
        particle.style.animationDuration = `${animationDuration}s`;
        
        container.appendChild(particle);
    }
}

// CONFETTI FUNCTION
function triggerConfetti() {
    const confettiCount = 100;
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '1000';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.innerHTML = ['🎉', '✅', '📊', '💧', '🌊'][Math.floor(Math.random() * 5)];
        confetti.style.position = 'absolute';
        confetti.style.fontSize = Math.random() * 20 + 10 + 'px';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        
        confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.remove();
        }
    }, 3000);
}

// Add confetti animation to CSS
function addConfettiStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Add input animations
function addInputAnimations() {
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

// Initialize the application
async function initializeApp() {
    try {
        // Add dashboard button and styles
        addDashboardButtonStyles();
        addDashboardLinkButton();
        
        // Add confetti styles
        addConfettiStyles();
        
        // Set up form event listener
        const form = document.getElementById('dataForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        // Add input animations
        addInputAnimations();
        
        // Load initial data from JSONBin
        await initializeDefaultData();
        
        // Create particles if container exists
        if (document.querySelector('.particles-container')) {
            createParticles();
        }
        
        console.log('Admin Panel initialized with JSONBin.io cloud storage');
    } catch (error) {
        console.error('Error initializing admin panel:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);