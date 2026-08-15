export default async (req) => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return json({ error: "GITHUB_TOKEN is not configured" }, 500);
  }

  const url = new URL(req.url);
  const file = url.searchParams.get("file") || "index.html";

  const allowedFiles = [
    "index.html",
    "admin/data.json"
  ];

  if (!allowedFiles.includes(file)) {
    return json({ error: "File is not allowed" }, 403);
  }

  const apiUrl =
    `https://api.github.com/repos/HomoIrrealis/HomoIrrealis.github.io/contents/${file}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  try {
    // دریافت فایل
    if (req.method === "GET") {
      const response = await fetch(apiUrl, { headers });
      const data = await response.json();

      if (!response.ok) {
        return json(data, response.status);
      }

      let content = "";

      if (data.content) {
        content = Buffer.from(
          data.content.replace(/\n/g, ""),
          "base64"
        ).toString("utf8");
      }

      return json({
        success: true,
        file,
        sha: data.sha,
        content
      });
    }

    // ذخیره فایل
    if (req.method === "PUT") {
      const body = await req.json();

      if (!body.content) {
        return json({ error: "Content is required" }, 400);
      }

      const content = Buffer.from(body.content, "utf8").toString("base64");

      // اول SHA فعلی فایل را می‌گیریم
      const currentResponse = await fetch(apiUrl, { headers });
      const currentData = await currentResponse.json();

      const payload = {
        message: body.message || `Update ${file}`,
        content,
        sha: currentData.sha
      };

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        return json(data, response.status);
      }

      return json({
        success: true,
        file,
        message: "File updated successfully"
      });
    }

    return json({ error: "Method not allowed" }, 405);

  } catch (error) {
    return json({
      success: false,
      error: error.message
    }, 500);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}      }
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
