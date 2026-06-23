/**
 * Toruk Makto Core Interactive System Modules - Fully Fixed Version
 */

// Safe local scope block prevents collision errors with inline HTML scripts
(() => {
    // 1. Clear any old dismissal memory immediately
    localStorage.removeItem("designer_toast_hidden");

    // 2. Trigger the toast layout animation directly 
    setTimeout(() => {
        const toast = document.getElementById("designer-toast");
        if (toast) {
            toast.classList.add("slide-in");
        }
    }, 1200);

    // 3. Automated Active Navigation State Sync Engine
    const currentPath = window.location.pathname.split("/").pop();
    const navMenuElements = document.querySelectorAll(".nav-links a");

    navMenuElements.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (currentPath === linkPath || (currentPath === "" && linkPath === "index.html")) {
            link.classList.add("active");
        }
    });

    /**
     * Close the layout card visually
     */
    function dismissDesignerToast() {
        const toast = document.getElementById("designer-toast");
        if (toast) {
            toast.classList.remove("slide-in");
        }
    }

    // Bind dismiss function to global context window for direct HTML inline execution
    window.dismissDesignerToast = dismissDesignerToast;

    // ====== NAV TOGGLE ARCHITECTURE ======
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');

    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navToggle.classList.toggle('open');
            navLinksContainer.classList.toggle('open');
        });

        // Automatically close mobile tray window if an item is selected
        const dropDownLinks = navLinksContainer.querySelectorAll('a');
        dropDownLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinksContainer.classList.remove('open');
            });
        });

        // Close the navigation viewport cleanly if user clicks outside header zone area
        document.addEventListener('click', (e) => {
            if (!navLinksContainer.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('open');
                navLinksContainer.classList.remove('open');
            }
        });
    }

    // =============================================
    // 4. COUNTER ANIMATIONS FOR STATS
    // =============================================

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 16);
        });
    }

    // Trigger counters when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateCounters);
    } else {
        animateCounters();
    }

    // =============================================
    // 5. SCROLL ANIMATIONS (CLASS-BASED & HOVER-SAFE)
    // =============================================

    document.addEventListener('DOMContentLoaded', () => {
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.media-card, .team-card, .testimonial-card, .event-card').forEach(el => {
            const rect = el.getBoundingClientRect();
            const isAboveFold = rect.top < window.innerHeight && rect.bottom > 0;

            if (isAboveFold || rect.top === 0) {
                el.classList.add('visible');
            } else {
                observer.observe(el);
            }
        });
    });

    // =============================================
    // 6. NEWSLETTER SIGNUP
    // =============================================

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = document.getElementById('newsletterMessage');
            message.textContent = '✓ Thank you for subscribing!';
            message.style.color = 'var(--accent-color)';
            message.style.display = 'block';
            this.reset();
            setTimeout(() => message.style.display = 'none', 3000);
        });
    }

    // =============================================
    // 7. SCROLL TO TOP BUTTON
    // =============================================

    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();
document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    // Toggle showing and hiding chat panel window
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) chatInput.focus();
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // Form Submission Actions
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        // Display user message bubble
        appendBubble(userText, 'user-bubble');
        chatInput.value = '';

        // Add a temporary loading text item
        const loadingBubble = document.createElement('div');
        loadingBubble.className = 'chat-bubble bot-bubble';
        loadingBubble.innerHTML = `<p style="color: #777; font-style: italic;">Thinking...</p>`;
        chatBody.appendChild(loadingBubble);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            // Call our serverless function directly
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();
            loadingBubble.remove(); // Remove thinking message
            appendBubble(data.reply, 'bot-bubble');

        } catch (error) {
            loadingBubble.remove();
            appendBubble("Sorry, I had trouble processing that request. Please try again.", 'bot-bubble');
        }
    });

    function appendBubble(text, className) {
        const div = document.createElement('div');
        div.className = `chat-bubble ${className}`;
        div.innerHTML = `<p>${text}</p>`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight; // Force scroll to bottom
    }
});
