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

// document.addEventListener('DOMContentLoaded', function() {
//     const lastUpdatedElement = document.getElementById('last-updated');
//     const currentDate = new Date();
//     const formattedDate = currentDate.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//     });
//     lastUpdatedElement.textContent = `Last updated on ${formattedDate}`;
// });

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
  const particleCount = 100;
  const maxDistance = 120;
  let animationFrame;

  function init() {
      sizeCanvas();
      createParticles();
      animate();
      canvas.addEventListener('click', expandParticles);
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
              radius: Math.random() * 2 + 1,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              opacity: Math.random() * 0.5 + 0.5
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
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();

          // Add glow effect
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 2);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
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

  function expandParticles(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      particles.forEach(particle => {
          const dx = particle.x - x;
          const dy = particle.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = Math.min(50 / distance, 5);
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
      });
  }

  return {
      init: init
  };
})();

window.addEventListener('load', ParticleNetwork.init);