function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class ScreenEffect {
    constructor(parent, options) {
        this.parent = parent;
        if (typeof parent === "string") {
            this.parent = document.querySelector(parent);
        }
        
        this.config = Object.assign({}, {
            //
        }, options)
        
        this.effects = {};
        
        this.events = {
            resize: this.onResize.bind(this)
        };
        
        window.addEventListener("resize", this.events.resize, false);
        
        this.render();
    }
    
    render() {
        const container = document.createElement("div");
        container.classList.add("screen-container");
        
        const wrapper1 = document.createElement("div");
        wrapper1.classList.add("screen-wrapper");
        
        const wrapper2 = document.createElement("div");
        wrapper2.classList.add("screen-wrapper");
        
        const wrapper3 = document.createElement("div");
        wrapper3.classList.add("screen-wrapper");
        
        wrapper1.appendChild(wrapper2);
        wrapper2.appendChild(wrapper3);
        
        container.appendChild(wrapper1);
        
        this.parent.parentNode.insertBefore(container, this.parent);
        wrapper3.appendChild(this.parent);
        
        this.nodes = { container, wrapper1, wrapper2, wrapper3 };
        
        this.onResize();
    }
    
    onResize(e) {
        this.rect = this.parent.getBoundingClientRect();
        
        if (this.effects.vcr && !!this.effects.vcr.enabled) {
            this.generateVCRNoise();
        }
    }
    
    add(type, options) {
        const config = Object.assign({}, {
            fps: 30,
            blur: 1
        }, options);
        
        if (Array.isArray(type)) {
            for (const t of type) {
                this.add(t);
            }
            
            return this;
        }
        
        const that = this;
        
        if (type === "snow") {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.classList.add(type);
            canvas.width = this.rect.width / 2;
            canvas.height = this.rect.height / 2;
            
            this.nodes.wrapper2.appendChild(canvas);
            
            animate();
            
            function animate() {
                that.generateSnow(ctx);
                that.snowframe = requestAnimationFrame(animate);
            }
            
            this.effects[type] = {
                wrapper: this.nodes.wrapper2,
                node: canvas,
                enabled: true,
                config
            };
            
            return this;
        }
        
        if (type === "roll") {
            return this.enableRoll();
        }
        
        if (type === "vcr") {
            const canvas = document.createElement("canvas");
            canvas.classList.add(type);
            this.nodes.wrapper2.appendChild(canvas);
            
            canvas.width = this.rect.width;
            canvas.height = this.rect.height;
            
            this.effects[type] = {
                wrapper: this.nodes.wrapper2,
                node: canvas,
                ctx: canvas.getContext("2d"),
                enabled: true,
                config
            };
            
            this.generateVCRNoise();
            
            return this;
        }
        
        let node = false;
        let wrapper = this.nodes.wrapper2;
        
        switch(type) {
            case "wobblex":
            case "wobbley":
                wrapper.classList.add(type);
                break;
            case "scanlines":
                node = document.createElement("div");
                node.classList.add(type);
                wrapper.appendChild(node);
                break;
            case "vignette":
                wrapper = this.nodes.container;
                node = document.createElement("div");
                node.classList.add(type);
                wrapper.appendChild(node);
                break;
            case "image":
                wrapper = this.parent;
                node = document.createElement('img');
                node.classList.add(type);
                node.src = config.src;
                wrapper.appendChild(node);
                break;
            case "video":
                wrapper = this.parent;
                node = document.createElement('video');
                node.classList.add(type);
                node.src = config.src;
                node.crossOrigin = 'anonymous';
                node.autoplay = true;
                node.muted = true;
                node.loop = true;
                wrapper.appendChild(node);
                break;
        }

        this.effects[type] = {
            wrapper,
            node,
            enabled: true,
            config
        };
        
        return this;
    }
    
    remove(type) {
        const obj = this.effects[type];
        if (type in this.effects && !!obj.enabled) {
            obj.enabled = false;
            
            if (type === "roll" && obj.original) {
                this.parent.appendChild(obj.original);
            }
            
            if (type === "vcr") {
                clearInterval(this.vcrInterval);
            }
            
            if (type === "snow") {
                cancelAnimationFrame(this.snowframe);
            }
            
            if (obj.node) {
                obj.wrapper.removeChild(obj.node);
            } else {
                obj.wrapper.classList.remove(type);
            }
        }
        
        return this;
    }
    
    enableRoll() {
        const el = this.parent.firstElementChild;
        
        if (el) {
            const div = document.createElement("div");
            div.classList.add("roller");
            
            this.parent.appendChild(div);
            div.appendChild(el);
            div.appendChild(el.cloneNode(true));
            
            this.effects.roll = {
                enabled: true,
                wrapper: this.parent,
                node: div,
                original: el
            };
        }
    }
    
    generateVCRNoise() {
        const canvas = this.effects.vcr.node;
        const config = this.effects.vcr.config;
        const div = this.effects.vcr.node;
        
        if (config.fps >= 60) {
            cancelAnimationFrame(this.vcrInterval);
            const animate = () => {
                this.renderTrackingNoise();
                this.vcrInterval = requestAnimationFrame(animate);
            };
            
            animate();
        } else {
            clearInterval(this.vcrInterval);
            this.vcrInterval = setInterval(() => {
                this.renderTrackingNoise();
            }, 1000 / config.fps);
        }
    }
    
    generateSnow(ctx) {
        var w = ctx.canvas.width,
            h = ctx.canvas.height,
            d = ctx.createImageData(w, h),
            b = new Uint32Array(d.data.buffer),
            len = b.length;

        for (var i = 0; i < len; i++) {
            b[i] = ((255 * Math.random()) | 0) << 24;
        }

        ctx.putImageData(d, 0, 0);
    }
    
    renderTrackingNoise(radius = 2, xmax, ymax) {
        const canvas = this.effects.vcr.node;
        const ctx = this.effects.vcr.ctx;
        const config = this.effects.vcr.config;
        let posy1 = config.miny || 0;
        let posy2 = config.maxy || canvas.height;
        let posy3 = config.miny2 || 0;
        const num = config.num || 20;
        
        if (xmax === undefined) {
            xmax = canvas.width;
        }
        
        if (ymax === undefined) {
            ymax = canvas.height;
        }
        
        canvas.style.filter = `blur(${config.blur}px)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `#fff`;

        ctx.beginPath();
        for (var i = 0; i <= num; i++) {
            var x = Math.random(i) * xmax;
            var y1 = getRandomInt(posy1+=3, posy2);
            var y2 = getRandomInt(0, posy3-=3);
            ctx.fillRect(x, y1, radius, radius);
            ctx.fillRect(x, y2, radius, radius);
            ctx.fill();

            this.renderTail(ctx, x, y1, radius);
            this.renderTail(ctx, x, y2, radius);
        }
        ctx.closePath();
    }

    renderTail(ctx, x, y, radius) {
        const n = getRandomInt(1, 50);
        const dirs = [1, -1];
        let rd = radius;
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        for (let i = 0; i < n; i++) {
            const step = 0.01;
            let r = getRandomInt((rd -= step), radius);
            let dx = getRandomInt(1, 4);
            radius -= 0.1;
            dx *= dir;
            ctx.fillRect((x += dx), y, r, r);
            ctx.fill();
        }
    }
}

// Initialize screen effect and number input handling
document.addEventListener('DOMContentLoaded', function() {
    const screen = new ScreenEffect("#screen", {});
    
    // Add effects with reduced VCR settings
    screen.add("vignette");
    screen.add("scanlines");
    screen.add("vcr", {
        opacity: 0.4,
        miny: 100,
        miny2: 100,
        num: 30,
        fps: 30,
        blur: 0.5
    });
    screen.add("wobbley");

    // Create number display
    const numberDisplay = document.createElement('div');
    numberDisplay.classList.add('number-display');
    document.body.appendChild(numberDisplay);

    // Initialize number input handling
    let currentNumber = '';
    let displayTimeout;

    // Handle keyboard input
    document.addEventListener('keydown', function(e) {
        // Only handle number keys
        if (/^[0-9]$/.test(e.key)) {
            currentNumber += e.key;
            
            // Show number
            numberDisplay.textContent = currentNumber;
            numberDisplay.classList.add('visible');
            
            // Clear previous timeout
            if (displayTimeout) {
                clearTimeout(displayTimeout);
            }
            
            // If we have 3 digits, navigate
            if (currentNumber.length === 3) {
                const pageNumber = parseInt(currentNumber);
                displayTimeout = setTimeout(() => {
                    window.location.href = `/page/${pageNumber}`;
                }, 500);
            }
            
            // Clear number after 2 seconds of inactivity
            displayTimeout = setTimeout(() => {
                currentNumber = '';
                numberDisplay.classList.remove('visible');
            }, 2000);
        }
    });

    // Handle page transitions
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            
            // Blur out
            screen.nodes.container.style.transition = 'filter 0.3s ease-out';
            screen.nodes.container.style.filter = 'blur(10px)';
            
            // Navigate after blur
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        }
    });

    // Clock update
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
        
        document.getElementById('clock-time').textContent = time;
        document.getElementById('clock-date').textContent = date;
    }
    
    setInterval(updateClock, 1000);
    updateClock();

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const currentPage = parseInt(document.querySelector('.page-indicator span:last-child').textContent);
        let nextPage = currentPage;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextPage = Math.min(currentPage + 1, 599);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            nextPage = Math.max(currentPage - 1, 100);
        }

        if (nextPage !== currentPage) {
            window.location.href = `/page/${nextPage}`;
        }
    });

    // Auto-scroll content
    const contentArea = document.querySelector('.content-area');
    if (contentArea.scrollHeight > contentArea.clientHeight) {
        let scrollPosition = 0;
        const scrollStep = 30; // Pixels to scroll each step
        const scrollInterval = 2000; // Time between scrolls in milliseconds

        setInterval(() => {
            if (scrollPosition + contentArea.clientHeight >= contentArea.scrollHeight) {
                scrollPosition = 0;
            } else {
                scrollPosition += scrollStep;
            }
            contentArea.scrollTo({
                top: scrollPosition,
                behavior: 'instant'
            });
        }, scrollInterval);
    }
});

// Typewriter effect for blue titles
document.querySelectorAll('.blue-text').forEach(element => {
    element.style.opacity = '0';
    let text = element.textContent;
    element.textContent = '';
    
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(typeInterval);
            element.style.opacity = '1';
        }
    }, 50);
}); 