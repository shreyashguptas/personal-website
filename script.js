document.addEventListener('DOMContentLoaded', function() {
    const lastUpdatedElement = document.getElementById('last-updated');
    const username = 'shreyashguptas';
    const repo = 'personal-website';

    fetch(`https://api.github.com/repos/${username}/${repo}/commits`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lastCommitDate = new Date(data[0].commit.author.date);
                const formattedDate = lastCommitDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                lastUpdatedElement.textContent = `Last updated on ${formattedDate}`;
            }
        })
        .catch(error => {
            console.error('Error fetching last commit date:', error);
            lastUpdatedElement.textContent = 'Last updated date unavailable';
        });
});

// Add this function to your existing script.js
function fetchBlogsPreview() {
    fetch('blogs/blogs.js')
        .then(response => response.text())
        .then(text => {
            // Extract the blogs array from the JS file
            const blogsMatch = text.match(/const blogs = (\[[\s\S]*?\]);/);
            if (blogsMatch) {
                const blogsArray = eval(blogsMatch[1]);
                const previewList = document.getElementById('blogs-preview');
                
                blogsArray.slice(0, 5).forEach(blog => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="${blog.url}"><span class="title">${blog.title}</span><span class="date">${blog.date}</span></a>`;
                    previewList.appendChild(li);
                });
            }
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch and display projects
    function fetchProjects() {
        fetch('projects/projects.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const projects = doc.querySelectorAll('.projects-list li');
                const previewList = document.getElementById('projects-preview');
                
                for (let i = 0; i < Math.min(5, projects.length); i++) {
                    const li = document.createElement('li');
                    const projectLink = projects[i].querySelector('h2 a');
                    const title = projectLink.textContent;
                    const url = projectLink.getAttribute('href');
                    const year = projects[i].querySelector('.project-year').textContent;
                    li.innerHTML = `<a href="${url}"><span class="title">${title}</span><span class="date">${year}</span></a>`;
                    previewList.appendChild(li);
                }
            });
    }

    // Function to fetch and display readings
    function fetchReadings() {
        fetch('readings/readings.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const readings = doc.querySelectorAll('.readings-list li');
                const previewList = document.getElementById('readings-preview');
                
                for (let i = 0; i < Math.min(5, readings.length); i++) {
                    const li = document.createElement('li');
                    const readingLink = readings[i].querySelector('h2 a');
                    const title = readingLink.textContent;
                    const url = readingLink.getAttribute('href');
                    const author = readings[i].querySelector('.reading-author').textContent;
                    li.innerHTML = `<a href="${url}"><span class="title">${title}</span><span class="date">${author}</span></a>`;
                    previewList.appendChild(li);
                }
            });
    }

    // Call both functions
    fetchProjects();
    fetchReadings();
    fetchBlogsPreview();
});


const ParticleNetwork = (function() {
    const canvas = document.getElementById('particle-network');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;
    const maxDistance = 150;
    let animationFrame;
    const nodeInfo = document.getElementById('node-info');

    const nodeTypes = ['Input', 'Hidden', 'Output'];
    const nodeColors = ['#64ffda', '#8892b0', '#ff6b6b'];

    function init() {
        sizeCanvas();
        createParticles();
        animate();
        canvas.addEventListener('mousemove', showNodeInfo);
        canvas.addEventListener('mouseout', hideNodeInfo);
        window.addEventListener('resize', sizeCanvas);
    }

    function sizeCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        const containerWidth = canvas.offsetWidth;
        const containerHeight = canvas.offsetHeight;
        canvas.width = containerWidth * pixelRatio;
        canvas.height = containerHeight * pixelRatio;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        ctx.scale(pixelRatio, pixelRatio);
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)]
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateParticles();
        drawParticles();
        connectParticles();
        animationFrame = requestAnimationFrame(animate);
    }

    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > canvas.width) particle.vx = -particle.vx;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy = -particle.vy;
        });
    }

    function drawParticles() {
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = nodeColors[nodeTypes.indexOf(particle.type)];
            ctx.fill();
        });
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${(maxDistance - distance) / maxDistance * 0.5})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function showNodeInfo(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (let particle of particles) {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < particle.radius + 5) {
                nodeInfo.style.display = 'block';
                nodeInfo.style.left = (event.clientX + 10) + 'px';
                nodeInfo.style.top = (event.clientY + 10) + 'px';
                nodeInfo.textContent = `Type: ${particle.type} Node`;
                return;
            }
        }

        hideNodeInfo();
    }

    function hideNodeInfo() {
        nodeInfo.style.display = 'none';
    }

    return {
        init: init
    };
})();

window.addEventListener('load', ParticleNetwork.init);