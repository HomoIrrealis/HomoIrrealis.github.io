export default async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return jsonResponse(
        {
          success: false,
          error: "GITHUB_TOKEN is missing"
        },
        500,
        corsHeaders
      );
    }

    const url = new URL(req.url);

    const file =
      url.searchParams.get("file") ||
      "admin/data.json";

    const allowedFiles = [
      "admin/data.json",
      "index.html"
    ];

    if (!allowedFiles.includes(file)) {
      return jsonResponse(
        {
          success: false,
          error: "File is not allowed"
        },
        403,
        corsHeaders
      );
    }

    const githubUrl =
      `https://api.github.com/repos/HomoIrrealis/HomoIrrealis.github.io/contents/${file}`;

    const githubHeaders = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };


    // =========================
    // GET
    // =========================

    if (req.method === "GET") {

      const response = await fetch(
        githubUrl,
        {
          method: "GET",
          headers: githubHeaders
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        return jsonResponse(
          {
            success: false,
            error:
              result.message ||
              "GitHub GET request failed"
          },
          response.status,
          corsHeaders
        );
      }

      const content =
        Buffer.from(
          result.content.replace(/\n/g, ""),
          "base64"
        ).toString("utf8");

      return jsonResponse(
        {
          success: true,
          file,
          sha: result.sha,
          content
        },
        200,
        corsHeaders
      );
    }


    // =========================
    // PUT
    // =========================

    if (req.method === "PUT") {

      const body =
        await req.json();

      if (
        typeof body.content !== "string"
      ) {
        return jsonResponse(
          {
            success: false,
            error: "Content is required"
          },
          400,
          corsHeaders
        );
      }


      // دریافت نسخه فعلی فایل
      const currentResponse =
        await fetch(
          githubUrl,
          {
            method: "GET",
            headers: githubHeaders
          }
        );

      const current =
        await currentResponse.json();


      if (!currentResponse.ok) {
        return jsonResponse(
          {
            success: false,
            error:
              current.message ||
              "Could not read current GitHub file"
          },
          currentResponse.status,
          corsHeaders
        );
      }


      // تبدیل محتوا به Base64
      const encoded =
        Buffer.from(
          body.content,
          "utf8"
        ).toString("base64");


      // نوشتن فایل در GitHub
      const updateResponse =
        await fetch(
          githubUrl,
          {
            method: "PUT",

            headers: {
              ...githubHeaders,
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              message:
                body.message ||
                `Update ${file}`,

              content: encoded,

              sha: current.sha
            })
          }
        );


      const updateResult =
        await updateResponse.json();


      if (!updateResponse.ok) {
        return jsonResponse(
          {
            success: false,
            error:
              updateResult.message ||
              "GitHub update failed"
          },
          updateResponse.status,
          corsHeaders
        );
      }


      return jsonResponse(
        {
          success: true,
          file,
          message:
            "Saved to GitHub"
        },
        200,
        corsHeaders
      );
    }


    return jsonResponse(
      {
        success: false,
        error: "Method not allowed"
      },
      405,
      corsHeaders
    );


  } catch (error) {

    console.error(
      "GitHub function error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error?.message ||
          "Unknown server error"
      },
      500,
      corsHeaders
    );
  }
};


function jsonResponse(
  data,
  status,
  headers
) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...headers,
        "Content-Type":
          "application/json"
      }
    }
  );
}
