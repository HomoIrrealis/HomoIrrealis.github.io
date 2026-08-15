export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };

  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: cors
    });
  }

  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return response(
        {
          success: false,
          error: "GITHUB_TOKEN is missing"
        },
        500,
        cors
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
      return response(
        {
          success: false,
          error: "File is not allowed"
        },
        403,
        cors
      );
    }

    const githubUrl =
      `https://api.github.com/repos/HomoIrrealis/HomoIrrealis.github.io/contents/${file}`;

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    /* =====================
       GET
    ===================== */

    if (req.method === "GET") {
      const r = await fetch(githubUrl, {
        headers
      });

      const data = await r.json();

      if (!r.ok) {
        return response(
          {
            success: false,
            error: data.message
          },
          r.status,
          cors
        );
      }

      const content = Buffer.from(
        data.content.replace(/\n/g, ""),
        "base64"
      ).toString("utf8");

      return response(
        {
          success: true,
          file,
          sha: data.sha,
          content
        },
        200,
        cors
      );
    }

    /* =====================
       PUT
    ===================== */

    if (req.method === "PUT") {
      const body = await req.json();

      if (
        !body.content ||
        typeof body.content !== "string"
      ) {
        return response(
          {
            success: false,
            error: "Content is required"
          },
          400,
          cors
        );
      }

      /* دریافت نسخه فعلی فایل */

      const current =
        await fetch(githubUrl, {
          headers
        });

      const currentData =
        await current.json();

      if (!current.ok) {
        return response(
          {
            success: false,
            error: currentData.message
          },
          current.status,
          cors
        );
      }

      /* تبدیل محتوا به Base64 */

      const encoded =
        Buffer
          .from(body.content, "utf8")
          .toString("base64");

      /* ارسال به GitHub */

      const r =
        await fetch(githubUrl, {
          method: "PUT",

          headers: {
            ...headers,
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message:
              body.message ||
              `Update ${file}`,

            content: encoded,

            sha:
              currentData.sha
          })
        });

      const data =
        await r.json();

      if (!r.ok) {
        return response(
          {
            success: false,
            error:
              data.message ||
              "GitHub update failed",
            details: data
          },
          r.status,
          cors
        );
      }

      return response(
        {
          success: true,
          file,
          message: "Saved to GitHub",
          sha:
            data.content?.sha || null
        },
        200,
        cors
      );
    }

    return response(
      {
        success: false,
        error: "Method not allowed"
      },
      405,
      cors
    );

  } catch (error) {

    return response(
      {
        success: false,
        error: error.message
      },
      500,
      cors
    );
  }
};


function response(
  data,
  status,
  cors
) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...cors,
        "Content-Type":
          "application/json"
      }
    }
  );
}
