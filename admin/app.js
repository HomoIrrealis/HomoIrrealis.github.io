const KEY = "homoIrrealisAdminData";

const API =
  "https://homoirrealis.netlify.app/.netlify/functions/github";

const DATA_FILE = "admin/data.json";


/* =========================
   DEFAULT DATA
========================= */

const defaults = {
  categories: [
    "پروژه‌ها",
    "مطالعات",
    "یادداشت"
  ],

  posts: [
    {
      id: 1,
      title: "نمونه نوشته",
      category: "یادداشت",
      tags: ["یادداشت", "ایماژ"],
      image: "",
      content: "<p>این یک نوشته‌ی نمونه است.</p>",
      date: "۱۵ مرداد ۱۴۰۵",
      time: "22:00",
      status: "published"
    },

    {
      id: 2,
      title: "نمونه اثر",
      category: "پروژه‌ها",
      tags: ["پروژه"],
      image: "",
      content: "<p>این یک اثر نمونه است.</p>",
      date: "۱۴ مرداد ۱۴۰۵",
      time: "18:30",
      status: "published"
    }
  ],

  links: [
    {
      title: "Pinterest",
      url: "https://www.pinterest.com/itsnyctophilia/21-%CA%BCtill-i-die/"
    }
  ],

  page: {
    title: "مَن",
    content: ""
  },

  theme: {
    bg: "#335C67",
    fg: "#FEF4AF",
    title: "Homo Irrealis",
    desc: "ایماژ، آثار و یادداشت‌ها",
    about: true,
    links: true,
    tags: true,
    archive: true,
    categories: true,
    css: ""
  },

  settings: {
    admin: "DIAN",
    panel: "Homo Irrealis"
  }
};


/* =========================
   STATE
========================= */

let data = loadLocal();

let githubReady = false;


/* =========================
   LOCAL STORAGE
========================= */

function loadLocal() {
  try {
    const saved = localStorage.getItem(KEY);

    if (saved) {
      return JSON.parse(saved);
    }

    return structuredClone(defaults);

  } catch (error) {
    console.error("Local data error:", error);
    return structuredClone(defaults);
  }
}


/* =========================
   SAVE LOCAL + GITHUB
========================= */

async function save() {

  // همیشه یک نسخه‌ی محلی نگه می‌داریم
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error("Local save error:", error);
  }

  renderAll();

  try {

    const response = await fetch(
      `${API}?file=${encodeURIComponent(DATA_FILE)}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          content: JSON.stringify(data, null, 2),
          message: "Update blog data"
        })
      }
    );


    const result = await response.json();


    if (!response.ok || !result.success) {

      throw new Error(
        result.error ||
        result.message ||
        "GitHub save failed"
      );
    }


    githubReady = true;

    console.log(
      "Homo Irrealis: saved to GitHub"
    );


    return true;


  } catch (error) {

    githubReady = false;

    console.error(
      "GitHub save error:",
      error
    );

    alert(
      "تغییرات روی GitHub ذخیره نشد.\n\n" +
      error.message
    );

    return false;
  }
}


/* =========================
   LOAD FROM GITHUB
========================= */

async function loadFromGitHub() {

  try {

    const response = await fetch(
      `${API}?file=${encodeURIComponent(DATA_FILE)}`,
      {
        method: "GET",
        cache: "no-store"
      }
    );


    const result = await response.json();


    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.error ||
        "GitHub data could not be loaded."
      );
    }


    if (
      !result.content ||
      result.content.trim() === ""
    ) {
      return;
    }


    const remoteData =
      JSON.parse(result.content);


    data = normalizeData(remoteData);


    // ذخیره‌ی نسخه‌ی دریافت‌شده در مرورگر
    localStorage.setItem(
      KEY,
      JSON.stringify(data)
    );


    githubReady = true;

    renderAll();


    console.log(
      "Homo Irrealis: data loaded from GitHub"
    );


  } catch (error) {

    githubReady = false;

    console.warn(
      "GitHub load failed. Using local data.",
      error
    );

    renderAll();
  }
}


/* =========================
   NORMALIZE DATA
========================= */

function normalizeData(input) {

  const result = {
    ...structuredClone(defaults),
    ...input
  };


  result.categories =
    Array.isArray(input.categories)
      ? input.categories
      : structuredClone(defaults.categories);


  result.posts =
    Array.isArray(input.posts)
      ? input.posts
      : [];


  result.links =
    Array.isArray(input.links)
      ? input.links
      : [];


  result.page = {
    ...defaults.page,
    ...(input.page || {})
  };


  result.theme = {
    ...defaults.theme,
    ...(input.theme || {})
  };


  result.settings = {
    ...defaults.settings,
    ...(input.settings || {})
  };


  return result;
}


/* =========================
   HELPERS
========================= */

function $(id) {
  return document.getElementById(id);
}


function esc(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    function (match) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[match];

    }
  );
}


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll(".nav-item")
  .forEach(button => {

    button.onclick = () => {
      show(button.dataset.view);
    };

  });


document
  .querySelectorAll("[data-go]")
  .forEach(button => {

    button.onclick = () => {
      show(button.dataset.go);
    };

  });


function show(id) {

  document
    .querySelectorAll(".view")
    .forEach(view => {
      view.classList.remove("active");
    });


  const target = $(id);

  if (target) {
    target.classList.add("active");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.view === id
      );

    });


  if (id === "editor") {
    resetEditor();
  }
}


/* =========================
   LOGOUT
========================= */

if ($("logoutBtn")) {

  $("logoutBtn").onclick = () => {

    alert(
      "برای خروج از پنل، تب مرورگر را ببندید."
    );

  };

}


/* =========================
   EDITOR TOOLBAR
========================= */

document
  .querySelectorAll("#toolbar button")
  .forEach(button => {

    button.onclick = () => {

      const command =
        button.dataset.cmd;


      if (command === "createLink") {

        const url =
          prompt("آدرس لینک:");

        if (url) {
          document.execCommand(
            "createLink",
            false,
            url
          );
        }

      }


      else if (
        command === "insertImage"
      ) {

        const url =
          prompt("آدرس تصویر:");

        if (url) {

          document.execCommand(
            "insertImage",
            false,
            url
          );

        }

      }


      else {

        document.execCommand(
          command,
          false,
          button.dataset.value || null
        );

      }


      if ($("postContent")) {
        $("postContent").focus();
      }

    };

  });


/* =========================
   EDITOR
========================= */

function resetEditor() {

  if ($("editorTitle"))
    $("editorTitle").textContent =
      "ارسال مطلب";


  if ($("postId"))
    $("postId").value = "";


  if ($("postTitle"))
    $("postTitle").value = "";


  if ($("postTags"))
    $("postTags").value = "";


  if ($("postImage"))
    $("postImage").value = "";


  if ($("postContent"))
    $("postContent").innerHTML = "";


  fillCategories();
}


function fillCategories() {

  if (!$("postCategory")) return;


  $("postCategory").innerHTML =
    data.categories
      .map(
        category =>
          `<option value="${esc(category)}">${esc(category)}</option>`
      )
      .join("");
}


/* =========================
   EDIT POST
========================= */

function editPost(id) {

  const post =
    data.posts.find(
      item => item.id == id
    );


  if (!post) return;


  show("editor");


  $("editorTitle").textContent =
    "ویرایش مطلب";


  $("postId").value =
    post.id;


  $("postTitle").value =
    post.title || "";


  $("postCategory").value =
    post.category || "";


  $("postTags").value =
    (post.tags || []).join("، ");


  $("postImage").value =
    post.image || "";


  $("postContent").innerHTML =
    post.content || "";
}


/* =========================
   COLLECT POST
========================= */

function collect(status) {

  const tags =
    $("postTags")
      .value
      .split(/[,،]/)
      .map(tag => tag.trim())
      .filter(Boolean);


  return {

    id:
      Number($("postId").value) ||
      Date.now(),

    title:
      $("postTitle").value.trim(),

    category:
      $("postCategory").value,

    tags,

    image:
      $("postImage").value.trim(),

    content:
      $("postContent").innerHTML,

    date:
      new Intl.DateTimeFormat(
        "fa-IR",
        {
          dateStyle: "medium"
        }
      ).format(new Date()),

    time:
      new Date().toLocaleTimeString(
        "fa-IR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      ),

    status
  };
}


/* =========================
   POST FORM
========================= */

if ($("postForm")) {

  $("postForm").onsubmit =
    async event => {

      event.preventDefault();


      const title =
        $("postTitle").value.trim();


      if (!title) {

        alert(
          "عنوان مطلب را وارد کنید."
        );

        return;
      }


      await upsert(
        collect("published")
      );


      alert(
        "مطلب منتشر شد."
      );


      show("posts");
    };

}


/* =========================
   DRAFT
========================= */

if ($("draftBtn")) {

  $("draftBtn").onclick =
    async () => {

      if (
        !$("postTitle").value.trim()
      ) {

        alert(
          "عنوان مطلب را وارد کنید."
        );

        return;
      }


      await upsert(
        collect("draft")
      );


      alert(
        "پیش‌نویس ذخیره شد."
      );


      show("posts");
    };

}


/* =========================
   CANCEL
========================= */

if ($("cancelEdit")) {

  $("cancelEdit").onclick =
    () => show("posts");

}


/* =========================
   UPSERT
========================= */

async function upsert(post) {

  const index =
    data.posts.findIndex(
      item => item.id === post.id
    );


  if (index >= 0) {

    data.posts[index] =
      post;

  } else {

    data.posts.unshift(post);

  }


  await save();
}


/* =========================
   POSTS
========================= */

function renderPosts() {

  const table =
    $("postsTable");


  if (!table) return;


  if (!data.posts.length) {

    table.innerHTML =
      `
      <tr>
        <td
          colspan="5"
          class="empty"
        >
          هنوز مطلبی وجود ندارد.
        </td>
      </tr>
      `;

    return;
  }


  table.innerHTML =
    data.posts
      .map(post => {

        const status =
          post.status === "draft"
            ? "پیش‌نویس"
            : "منتشر";


        return `
          <tr>

            <td>
              ${esc(post.title)}
            </td>

            <td>
              ${esc(post.category)}
            </td>

            <td>
              ${esc(post.date)}
            </td>

            <td>
              <span
                class="status ${
                  post.status === "draft"
                    ? "draft"
                    : ""
                }"
              >
                ${status}
              </span>
            </td>

            <td class="row-actions">

              <button
                onclick="editPost(${post.id})"
              >
                ویرایش
              </button>

              <button
                class="danger"
                onclick="deletePost(${post.id})"
              >
                حذف
              </button>

            </td>

          </tr>
        `;

      })
      .join("");
}


/* =========================
   DELETE POST
========================= */

async function deletePost(id) {

  if (
    !confirm(
      "این مطلب حذف شود؟"
    )
  ) {
    return;
  }


  data.posts =
    data.posts.filter(
      post => post.id != id
    );


  await save();
}


/* =========================
   CATEGORIES
========================= */

function renderCategories() {

  const list =
    $("categoryList");


  if (!list) return;


  list.innerHTML =
    data.categories
      .map(
        (category, index) => `
          <li>

            <span>
              ${esc(category)}
            </span>

            <button
              class="danger"
              onclick="deleteCategory(${index})"
            >
              حذف
            </button>

          </li>
        `
      )
      .join("");


  fillCategories();
}


if ($("addCategory")) {

  $("addCategory").onclick =
    async () => {

      const value =
        $("newCategory")
          .value
          .trim();


      if (
        !value ||
        data.categories.includes(value)
      ) {
        return;
      }


      data.categories.push(value);


      $("newCategory").value = "";


      await save();
    };

}


async function deleteCategory(index) {

  if (
    data.categories.length <= 1
  ) {

    alert(
      "حداقل یک موضوع باید باقی بماند."
    );

    return;
  }


  data.categories.splice(
    index,
    1
  );


  await save();
}


/* =========================
   TAGS
========================= */

function renderTags() {

  const cloud =
    $("tagCloud");


  if (!cloud) return;


  const counts = {};


  data.posts.forEach(post => {

    (post.tags || [])
      .forEach(tag => {

        counts[tag] =
          (counts[tag] || 0) + 1;

      });

  });


  if (
    !Object.keys(counts).length
  ) {

    cloud.innerHTML =
      `
      <div class="empty">
        هنوز برچسبی ساخته نشده.
      </div>
      `;

    return;
  }


  cloud.innerHTML =
    Object.entries(counts)
      .map(
        ([tag, count]) =>
          `
          <span>
            ${esc(tag)}
            <small>
              (${count})
            </small>
          </span>
          `
      )
      .join("");
}


/* =========================
   LINKS
========================= */

function renderLinks() {

  const list =
    $("linkList");


  if (!list) return;


  list.innerHTML =
    data.links
      .map(
        (link, index) => `
          <li>

            <a
              href="${esc(link.url)}"
              target="_blank"
              rel="noopener"
            >
              ${esc(link.title)}
            </a>

            <button
              class="danger"
              onclick="deleteLink(${index})"
            >
              حذف
            </button>

          </li>
        `
      )
      .join("");
}


if ($("addLink")) {

  $("addLink").onclick =
    async () => {

      const title =
        $("linkTitle")
          .value
          .trim();


      const url =
        $("linkUrl")
          .value
          .trim();


      if (!title || !url) {
        return;
      }


      data.links.push({
        title,
        url
      });


      $("linkTitle").value = "";
      $("linkUrl").value = "";


      await save();
    };

}


async function deleteLink(index) {

  data.links.splice(
    index,
    1
  );


  await save();
}


/* =========================
   THEME
========================= */

function loadTheme() {

  const theme =
    data.theme;


  if ($("themeBg"))
    $("themeBg").value =
      theme.bg;


  if ($("themeFg"))
    $("themeFg").value =
      theme.fg;


  if ($("themeTitle"))
    $("themeTitle").value =
      theme.title;


  if ($("themeDesc"))
    $("themeDesc").value =
      theme.desc;


  if ($("showAbout"))
    $("showAbout").checked =
      theme.about;


  if ($("showLinks"))
    $("showLinks").checked =
      theme.links;


  if ($("showTags"))
    $("showTags").checked =
      theme.tags;


  if ($("showArchive"))
    $("showArchive").checked =
      theme.archive;


  if ($("showCategories"))
    $("showCategories").checked =
      theme.categories;


  if ($("customCss"))
    $("customCss").value =
      theme.css || "";


  renderPreview();
}


/* =========================
   SAVE THEME
========================= */

async function saveTheme() {

  data.theme = {

    bg:
      $("themeBg").value.trim() ||
      "#335C67",

    fg:
      $("themeFg").value.trim() ||
      "#FEF4AF",

    title:
      $("themeTitle").value,

    desc:
      $("themeDesc").value,

    about:
      $("showAbout").checked,

    links:
      $("showLinks").checked,

    tags:
      $("showTags").checked,

    archive:
      $("showArchive").checked,

    categories:
      $("showCategories").checked,

    css:
      $("customCss").value
  };


  const success =
    await save();


  if (success) {

    alert(
      "تنظیمات قالب ذخیره شد."
    );

  }
}


if ($("saveTheme")) {

  $("saveTheme").onclick =
    saveTheme;

}


/* =========================
   THEME PREVIEW
========================= */

[
  "themeBg",
  "themeFg",
  "themeTitle",
  "themeDesc",
  "customCss"
]
.forEach(id => {

  const element = $(id);

  if (element) {

    element.addEventListener(
      "input",
      renderPreview
    );

  }

});


[
  "showAbout",
  "showLinks",
  "showTags",
  "showArchive",
  "showCategories"
]
.forEach(id => {

  const element = $(id);

  if (element) {

    element.addEventListener(
      "change",
      renderPreview
    );

  }

});


function renderPreview() {

  if (!$("preview")) return;


  const theme = {

    bg:
      $("themeBg")?.value ||
      "#335C67",

    fg:
      $("themeFg")?.value ||
      "#FEF4AF",

    title:
      $("themeTitle")?.value ||
      "Homo Irrealis",

    desc:
      $("themeDesc")?.value ||
      "",

    css:
      $("customCss")?.value ||
      ""
  };


  const posts =
    data.posts
      .slice(0, 3)
      .map(
        post => `
          <article>

            <h3>
              ${esc(post.title)}
            </h3>

            <div>
              ${post.content || ""}
            </div>

          </article>
        `
      )
      .join("");


  $("preview").srcdoc =
    `
    <!doctype html>

    <html
      lang="fa"
      dir="rtl"
    >

    <head>

      <meta
        charset="UTF-8"
      >

      <style>

        body {
          margin: 0;
          background: ${esc(theme.bg)};
          color: ${esc(theme.fg)};
          font-family: Arial, sans-serif;
          padding: 25px;
        }

        header {
          text-align: center;
          border-bottom:
            1px solid ${esc(theme.fg)};
          padding: 12px;
        }

        h1 {
          font-size: 28px;
        }

        article {
          border:
            1px solid ${esc(theme.fg)};
          padding: 12px;
          margin: 12px auto;
          max-width: 380px;
        }

        a {
          color: ${esc(theme.fg)};
        }

        ${theme.css}

      </style>

    </head>

    <body>

      <header>

        <h1>
          ${esc(theme.title)}
        </h1>

        <p>
          ${esc(theme.desc)}
        </p>

      </header>

      ${posts}

    </body>

    </html>
    `;
}


/* =========================
   PAGE
========================= */

if ($("savePage")) {

  $("savePage").onclick =
    async () => {

      data.page = {

        title:
          $("pageTitle").value,

        content:
          $("pageContent").value
      };


      const success =
        await save();


      if (success) {

        alert(
          "صفحه ذخیره شد."
        );

      }
    };

}


/* =========================
   SETTINGS
========================= */

if ($("saveSettings")) {

  $("saveSettings").onclick =
    async () => {

      data.settings = {

        admin:
          $("adminName").value,

        panel:
          $("panelTitle").value
      };


      const success =
        await save();


      if (success) {

        alert(
          "تنظیمات ذخیره شد."
        );

      }
    };

}


/* =========================
   RENDER ALL
========================= */

function renderAll() {

  if ($("statPosts")) {

    $("statPosts").textContent =
      data.posts.filter(
        post =>
          post.status === "published"
      ).length;

  }


  if ($("statDrafts")) {

    $("statDrafts").textContent =
      data.posts.filter(
        post =>
          post.status === "draft"
      ).length;

  }


  if ($("statCats")) {

    $("statCats").textContent =
      data.categories.length;

  }


  if ($("statTags")) {

    const tags =
      new Set(
        data.posts.flatMap(
          post =>
            post.tags || []
        )
      );


    $("statTags").textContent =
      tags.size;
  }


  renderPosts();

  renderCategories();

  renderTags();

  renderLinks();


  if ($("pageTitle"))
    $("pageTitle").value =
      data.page.title || "";


  if ($("pageContent"))
    $("pageContent").value =
      data.page.content || "";


  if ($("adminName"))
    $("adminName").value =
      data.settings.admin || "";


  if ($("panelTitle"))
    $("panelTitle").value =
      data.settings.panel || "";


  loadTheme();
}


/* =========================
   START
========================= */

renderAll();

loadFromGitHub();

console.log("HOMO IRREALIS APP.JS LOADED");
