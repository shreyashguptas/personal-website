export async function getLastCommitDate() {
  try {
    const username = 'shreyashguptas';
    const repo = 'personal-website';
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repo}/commits?per_page=1`,
      {
        next: { revalidate: 86400 }, // Revalidate once per day
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add GitHub token if you have rate limiting issues
          // 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch commit data');
    }

    const data = await response.json();
    if (data.length > 0) {
      const lastCommitDate = new Date(data[0].commit.author.date);
      return lastCommitDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return null;
  } catch (error) {
    console.error('Error fetching last commit date:', error);
    return null;
  }
} 