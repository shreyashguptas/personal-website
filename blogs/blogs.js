const blogs = [
    {
        title: "The Power of Iteration: Lessons from Kindergarteners and Building Websites",
        url: "https://shreyashgupta.substack.com/p/the-power-of-iteration-lessons-from",
        date: "Jul 22, 2024"
    },
    {
        title: "One Year of Python: From Novice to Enthusiast",
        url: "https://shreyashgupta.substack.com/p/one-year-of-python-from-novice-to-enthusiast",
        date: "Jul 14, 2024"
    },
    {
        title: "Harness Your Senses: The Art of Dual-Tasking Without Multitasking",
        url: "https://shreyashgupta.substack.com/p/harness-your-senses-the-art-of-dual",
        date: "Oct 12, 2023"
    },
    {
        title: "The $5 Bag Addition: Always Powered, Never Stranded!",
        url: "https://shreyashgupta.substack.com/p/the-5-bag-addition-always-powered",
        date: "Aug 10, 2023"
    },
    {
        title: "A Tech Love Story 💻❤️",
        url: "https://shreyashgupta.substack.com/p/a-tech-love-story",
        date: "Aug 3, 2023"
    },
    {
        title: "Reclaim +100 hours of your time with Youtube.",
        url: "https://shreyashgupta.substack.com/p/reclaim-100-hours-of-your-time-with",
        date: "Jul 13, 2023"
    },
    {
        title: "Sick of feeling uninspired at work? Try tweaking your environment",
        url: "https://shreyashgupta.substack.com/p/sick-of-feeling-uninspired-at-work",
        date: "Jun 29, 2023"
    },
    {
        title: "Stop taking breaks...",
        url: "https://shreyashgupta.substack.com/p/stop-taking-breaks",
        date: "Jun 22, 2023"
    },
    {
        title: "The Secret to a Good Night's Sleep",
        url: "https://shreyashgupta.substack.com/p/the-secret-to-a-good-nights-sleep",
        date: "May 19, 2023"
    },
    {
        title: "There's Only ☝️ Way to Avoid Saying Yes to Too Much",
        url: "https://shreyashgupta.substack.com/p/theres-only-way-to-avoid-saying-yes",
        date: "May 11, 2023"
    },
    {
        title: "No Technology Day: The Surprisingly Peaceful Results",
        url: "https://shreyashgupta.substack.com/p/no-technology-day-the-surprisingly",
        date: "May 5, 2023"
    },
    {
        title: "Harnessing your chronotype for peak 🏔️ performance 🏎️",
        url: "https://shreyashgupta.substack.com/p/harnessing-your-chronotype-for-peak",
        date: "Apr 21, 2023"
    }
];

function populateBlogs() {
    const blogsList = document.querySelector('.blogs-list');
    blogs.forEach(blog => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="blog-info">
                <h2><a href="${blog.url}">${blog.title}</a></h2>
                <span class="blog-date">${blog.date}</span>
            </div>
        `;
        blogsList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', populateBlogs);