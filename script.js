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

function updateNavigation() {
    const currentPage = window.location.pathname;
    document.addEventListener('DOMContentLoaded', function() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage || 
                (currentPage.includes('/my-tech/') && link.getAttribute('href') === '/my-tech/index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });
}

updateNavigation();

// Add this new function to handle the profile image aspect ratio
function adjustProfileImage() {
    const container = document.getElementById('profile-image-container');
    const img = document.getElementById('profile-image');

    if (!container || !img) return;

    const desiredAspectRatio = 16 / 9; // Adjust this ratio as needed

    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth / desiredAspectRatio;

    container.style.height = `${containerHeight}px`;

    // Always crop and zoom to fill the width
    img.style.width = '100%';
    img.style.height = 'auto';
    
    // Calculate the crop
    const scaleFactor = containerWidth / img.naturalWidth;
    const newHeight = img.naturalHeight * scaleFactor;
    const cropAmount = (newHeight - containerHeight) / 2;

    // Apply the crop
    img.style.marginTop = `-${cropAmount}px`;
    container.style.overflow = 'hidden';
}

// Use requestAnimationFrame for smoother performance
window.addEventListener('load', () => requestAnimationFrame(adjustProfileImage));
window.addEventListener('resize', () => requestAnimationFrame(adjustProfileImage));

// Add this function to your existing script.js
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, options);

    images.forEach(img => imageObserver.observe(img));
}

// Call this function after the DOM is loaded
document.addEventListener('DOMContentLoaded', lazyLoadImages);