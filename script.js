document.addEventListener('DOMContentLoaded', function() {
    fetch('projects.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const projects = doc.querySelectorAll('.projects-list li');
            const previewList = document.getElementById('projects-preview');
            
            for (let i = 0; i < Math.min(5, projects.length); i++) {
                const li = document.createElement('li');
                const link = projects[i].querySelector('h2 a').cloneNode(true);
                const date = projects[i].querySelector('.project-date').cloneNode(true);
                li.appendChild(link);
                li.appendChild(date);
                previewList.appendChild(li);
            }
        });
});