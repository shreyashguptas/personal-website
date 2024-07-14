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
});