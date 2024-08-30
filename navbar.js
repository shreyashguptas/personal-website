document.addEventListener('DOMContentLoaded', function() {
    const navbar = `
        <div class="logo">
            <a href="/index.html">SHREYASH GUPTA</a>
        </div>
        <nav>
            <a href="/index.html">Home</a>
            <a href="/projects/projects.html">Projects</a>
            <a href="/readings/readings.html">Readings</a>
            <a href="/blogs/blogs.html">Blog</a>
            <a href="/my-tech/my-tech.html">My Tech</a>
            <a href="/about/about.html">About</a>
        </nav>
    `;

    document.querySelector('header').innerHTML = navbar;
});