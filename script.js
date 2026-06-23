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

    let isDragging = false;
    let hasMoved = false;
    let startX, startY, initialX, initialY;
    let dragThreshold = 15; 

    // --- DRAG ENGINE ---
    chatToggle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    chatToggle.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        const rect = chatToggle.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        isDragging = true;
        hasMoved = false;
    }

    function drag(e) {
        if (!isDragging) return;
        let currentX, currentY;
        if (e.type === 'touchmove') {
            e.preventDefault(); 
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        const dx = currentX - startX;
        const dy = currentY - startY;

        if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
            hasMoved = true;
        }

        if (hasMoved) {
            let newLeft = initialX + dx;
            let newTop = initialY + dy;
            const padding = 15;
            newLeft = Math.max(padding, Math.min(window.innerWidth - chatToggle.offsetWidth - padding, newLeft));
            newTop = Math.max(padding, Math.min(window.innerHeight - chatToggle.offsetHeight - padding, newTop));

            chatToggle.style.left = `${newLeft}px`;
            chatToggle.style.top = `${newTop}px`;
            chatToggle.style.bottom = 'auto';
            chatToggle.style.right = 'auto';
            updateWindowPosition(newLeft, newTop);
        }
    }

    function dragEnd() { isDragging = false; }

    chatToggle.addEventListener('click', (e) => {
        if (hasMoved) { e.preventDefault(); return; }
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            const rect = chatToggle.getBoundingClientRect();
            updateWindowPosition(rect.left, rect.top);
            chatInput.focus();
        }
    });

    chatClose.addEventListener('click', () => { chatWindow.classList.remove('open'); });

    function updateWindowPosition(btnLeft, btnTop) {
        let targetLeft = btnLeft - 150;
        let targetTop = btnTop - chatWindow.offsetHeight - 15;
        targetLeft = Math.max(10, Math.min(window.innerWidth - chatWindow.offsetWidth - 10, targetLeft));
        if (targetTop < 10) { targetTop = btnTop + chatToggle.offsetHeight + 15; }
        chatWindow.style.left = `${targetLeft}px`;
        chatWindow.style.top = `${targetTop}px`;
        chatWindow.style.bottom = 'auto';
        chatWindow.style.right = 'auto';
    }

    // Markdown Parser Text Converter
    function formatAIResponse(rawText) {
        return rawText
            .replace(/\*\*(.*?)\*\//g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // --- AI COMMUNICATION HANDLING ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        appendBubble(userText, 'user-bubble', false);
        chatInput.value = '';

        // LOCAL DEV GUARD: Detects if running locally via file layout
        if (window.location.protocol === 'file:') {
            appendBubble("⚠️ <strong>Local Testing Error:</strong> You opened index.html directly as a file. Your local computer cannot run serverless API functions. To test the chatbot, you must upload these changes to GitHub and view them on your live Vercel domain link!", 'bot-bubble', false);
            return;
        }

        const loadingBubble = document.createElement('div');
        loadingBubble.className = 'chat-bubble bot-bubble';
        loadingBubble.innerHTML = `<p style="color: #777; font-style: italic;">Thinking...</p>`;
        chatBody.appendChild(loadingBubble);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();
            loadingBubble.remove();
            appendBubble(data.reply, 'bot-bubble', true);

        } catch (error) {
            loadingBubble.remove();
            appendBubble(`Error reaching backend: ${error.message}. Check your browser console log for deeper details.`, 'bot-bubble', false);
            console.error("Chatbot Fetch Error:", error);
        }
    });

    function appendBubble(text, className, shouldFormat) {
        const div = document.createElement('div');
        div.className = `chat-bubble ${className}`;
        div.innerHTML = `<p>${shouldFormat ? formatAIResponse(text) : text}</p>`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
