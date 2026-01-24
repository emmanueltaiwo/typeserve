/**
 * Fetches the GitHub star count for a repository
 * @param owner - GitHub repository owner
 * @param repo - GitHub repository name
 * @returns The number of stars, or null if the fetch fails
 */
export async function getGitHubStars(
  owner: string,
  repo: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch GitHub stars: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.stargazers_count ?? null;
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    return null;
  }
}
