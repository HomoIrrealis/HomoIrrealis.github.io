export default async (req) => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({ error: "GITHUB_TOKEN is not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const response = await fetch(
      "https://api.github.com/repos/HomoIrrealis/HomoIrrealis.github.io/contents/index.html",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: response.ok,
        file: data.name || null,
        message: response.ok ? "GitHub connection works" : data.message
      }),
      {
        status: response.ok ? 200 : response.status,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
