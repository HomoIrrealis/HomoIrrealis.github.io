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

  posts: [],

  links: [],

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


/* =========================
   HELPERS
========================= */

function $(id) {
  return document.getElementById(id);
}


function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


function esc(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[match]
  );
}


/* =========================
   LOCAL DATA
========================= */

function loadLocal() {

  try {

    const saved =
      localStorage.getItem(KEY);

    if (!saved) {
      return clone(defaults);
    }

    return normalizeData(
      JSON.parse(saved)
    );

  } catch (error) {

    console.error(error);

    return clone(defaults);
  }
}


function normalizeData(input = {}) {

  return {

    categories:
      Array.isArray(input.categories)
        ? input.categories
        : clone(defaults.categories),

    posts:
      Array.isArray(input.posts)
        ? input.posts
        : [],

    links:
      Array.isArray(input.links)
        ? input.links
        : [],

    page: {
      ...defaults.page,
      ...(input.page || {})
    },

    theme: {
      ...defaults.theme,
      ...(input.theme || {})
    },

    settings: {
      ...defaults.settings,
      ...(input.settings || {})
    }

  };
}


/* =========================
   SAVE
========================= */

async function save() {

  localStorage.setItem(
    KEY,
    JSON.stringify(data)
  );

  renderAll();

  /*
    فعلاً فقط نسخه‌ی محلی ذخیره می‌شود.
    اتصال GitHub را بعداً وصل می‌کنیم.
  */

  return true;
}


/* =========================
   NAVIGATION
========================= */

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


  /*
    فقط وقتی دکمه «مطلب جدید» را
    می‌زنیم ادیتور را خالی می‌کنیم.
  */

  if (id === "editor") {

    if (!$("postId").value) {
      resetEditor();
    }

  }

}


document
  .querySelectorAll(".nav-item")
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        show(
          this.dataset.view
        );

      }
    );

  });


document
  .querySelectorAll("[data-go]")
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        show(
          this.dataset.go
        );

      }
    );

  });


/* =========================
   LOGOUT
========================= */

if ($("logoutBtn")) {

  $("logoutBtn").addEventListener(
    "click",
    () => {

      alert(
        "برای خروج از پنل، تب مرورگر را ببندید."
      );

    }
  );

}


/* =========================
   CATEGORIES
========================= */

function fillCategories() {

  const select =
    $("postCategory");

  if (!select) return;

  select.innerHTML =
    data.categories
      .map(category => `
        <option value="${esc(category)}">
          ${esc(category)}
        </option>
      `)
      .join("");

}


function renderCategories() {

  const list =
    $("categoryList");

  if (!list) return;

  list.innerHTML =
    data.categories
      .map((category, index) => `
        <li>

          <span>
            ${esc(category)}
          </span>

          <button
            type="button"
            class="danger"
            data-delete-category="${index}"
          >
            حذف
          </button>

        </li>
      `)
      .join("");

  list
    .querySelectorAll(
      "[data-delete-category]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteCategory(
            Number(
              button.dataset.deleteCategory
            )
          );

        }
      );

    });

  fillCategories();

}


if ($("addCategory")) {

  $("addCategory").addEventListener(
    "click",
    async () => {

      const input =
        $("newCategory");

      const value =
        input.value.trim();

      if (!value) return;

      if (
        data.categories.includes(value)
      ) {

        alert(
          "این موضوع قبلاً وجود دارد."
        );

        return;
      }

      data.categories.push(value);

      input.value = "";

      await save();

    }
  );

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


function collectPost(status) {

  const tags =
    $("postTags")
      .value
      .split(/[,،]/)
      .map(tag => tag.trim())
      .filter(Boolean);

  const now =
    new Date();

  return {

    id:
      Number($("postId").value) ||
      Date.now(),

    title:
      $("postTitle")
        .value
        .trim(),

    category:
      $("postCategory")
        .value,

    tags,

    image:
      $("postImage")
        .value
        .trim(),

    content:
      $("postContent")
        .innerHTML,

    date:
      new Intl.DateTimeFormat(
        "fa-IR",
        {
          dateStyle: "medium"
        }
      ).format(now),

    time:
      new Intl.DateTimeFormat(
        "fa-IR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      ).format(now),

    status

  };

}


if ($("postForm")) {

  $("postForm").addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (
        !$("postTitle")
          .value
          .trim()
      ) {

        alert(
          "عنوان مطلب را وارد کنید."
        );

        return;
      }

      await upsert(
        collectPost("published")
      );

      alert(
        "مطلب منتشر شد."
      );

      resetEditor();

      show("posts");

    }
  );

}


if ($("draftBtn")) {

  $("draftBtn").addEventListener(
    "click",
    async () => {

      if (
        !$("postTitle")
          .value
          .trim()
      ) {

        alert(
          "عنوان مطلب را وارد کنید."
        );

        return;
      }

      await upsert(
        collectPost("draft")
      );

      alert(
        "پیش‌نویس ذخیره شد."
      );

      resetEditor();

      show("posts");

    }
  );

}


if ($("cancelEdit")) {

  $("cancelEdit").addEventListener(
    "click",
    () => {

      resetEditor();

      show("posts");

    }
  );

}


async function upsert(post) {

  const index =
    data.posts.findIndex(
      item => item.id === post.id
    );

  if (index === -1) {

    data.posts.unshift(post);

  } else {

    data.posts[index] = post;

  }

  await save();

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

  $("editorTitle").textContent =
    "ویرایش مطلب";

  $("postId").value =
    post.id;

  $("postTitle").value =
    post.title || "";

  $("postTags").value =
    (post.tags || []).join("، ");

  $("postImage").value =
    post.image || "";

  $("postContent").innerHTML =
    post.content || "";

  fillCategories();

  $("postCategory").value =
    post.category || "";

  show("editor");

}


window.editPost = editPost;


/* =========================
   DELETE POST
========================= */

async function deletePost(id) {

  if (
    !confirm(
      "این مطلب حذف شود؟"
    )
  ) return;

  data.posts =
    data.posts.filter(
      post => post.id != id
    );

  await save();

}


window.deletePost = deletePost;


/* =========================
   POSTS
========================= */

function renderPosts() {

  const table =
    $("postsTable");

  if (!table) return;

  if (!data.posts.length) {

    table.innerHTML = `
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
              <span class="status ${
                post.status === "draft"
                  ? "draft"
                  : ""
              }">
                ${status}
              </span>
            </td>

            <td class="row-actions">

              <button
                type="button"
                data-edit="${post.id}"
              >
                ویرایش
              </button>

              <button
                type="button"
                class="danger"
                data-delete="${post.id}"
              >
                حذف
              </button>

            </td>

          </tr>
        `;

      })
      .join("");


  table
    .querySelectorAll(
      "[data-edit]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          editPost(
            button.dataset.edit
          );

        }
      );

    });


  table
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deletePost(
            button.dataset.delete
          );

        }
      );

    });

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

    cloud.innerHTML = `
      <div class="empty">
        هنوز برچسبی ساخته نشده.
      </div>
    `;

    return;
  }


  cloud.innerHTML =
    Object.entries(counts)
      .map(([tag, count]) => `
        <span>
          ${esc(tag)}
          <small>(${count})</small>
        </span>
      `)
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
      .map((link, index) => `
        <li>

          <a
            href="${esc(link.url)}"
            target="_blank"
            rel="noopener"
          >
            ${esc(link.title)}
          </a>

          <button
            type="button"
            class="danger"
            data-delete-link="${index}"
          >
            حذف
          </button>

        </li>
      `)
      .join("");


  list
    .querySelectorAll(
      "[data-delete-link]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteLink(
            Number(
              button.dataset.deleteLink
            )
          );

        }
      );

    });

}


if ($("addLink")) {

  $("addLink").addEventListener(
    "click",
    async () => {

      const title =
        $("linkTitle")
          .value
          .trim();

      const url =
        $("linkUrl")
          .value
          .trim();

      if (!title || !url) return;

      data.links.push({
        title,
        url
      });

      $("linkTitle").value = "";
      $("linkUrl").value = "";

      await save();

    }
  );

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
      theme.bg || "";

  if ($("themeFg"))
    $("themeFg").value =
      theme.fg || "";

  if ($("themeTitle"))
    $("themeTitle").value =
      theme.title || "";

  if ($("themeDesc"))
    $("themeDesc").value =
      theme.desc || "";

  if ($("showAbout"))
    $("showAbout").checked =
      !!theme.about;

  if ($("showLinks"))
    $("showLinks").checked =
      !!theme.links;

  if ($("showTags"))
    $("showTags").checked =
      !!theme.tags;

  if ($("showArchive"))
    $("showArchive").checked =
      !!theme.archive;

  if ($("showCategories"))
    $("showCategories").checked =
      !!theme.categories;

  if ($("customCss"))
    $("customCss").value =
      theme.css || "";

}


if ($("saveTheme")) {

  $("saveTheme").addEventListener(
    "click",
    async () => {

      data.theme = {

        bg:
          $("themeBg").value.trim(),

        fg:
          $("themeFg").value.trim(),

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

      await save();

      alert(
        "تنظیمات قالب ذخیره شد."
      );

    }
  );

}


/* =========================
   THEME PREVIEW
========================= */

function renderPreview() {

  if (!$("preview")) return;

  const bg =
    $("themeBg")?.value ||
    "#335C67";

  const fg =
    $("themeFg")?.value ||
    "#FEF4AF";

  const title =
    $("themeTitle")?.value ||
    "Homo Irrealis";

  const desc =
    $("themeDesc")?.value ||
    "";

  const css =
    $("customCss")?.value ||
    "";

  const posts =
    data.posts
      .slice(0, 3)
      .map(post => `
        <article>
          <h3>
            ${esc(post.title)}
          </h3>

          ${post.content || ""}
        </article>
      `)
      .join("");


  $("preview").srcdoc = `
    <!doctype html>

    <html lang="fa" dir="rtl">

    <head>

      <meta charset="UTF-8">

      <style>

        body {
          margin: 0;
          padding: 25px;
          background: ${esc(bg)};
          color: ${esc(fg)};
          font-family: Arial, sans-serif;
        }

        header {
          text-align: center;
          padding: 15px;
          border-bottom:
            1px solid ${esc(fg)};
        }

        article {
          max-width: 500px;
          margin: 15px auto;
          padding: 15px;
          border:
            1px solid ${esc(fg)};
        }

        a {
          color: ${esc(fg)};
        }

        ${css}

      </style>

    </head>

    <body>

      <header>

        <h1>
          ${esc(title)}
        </h1>

        <p>
          ${esc(desc)}
        </p>

      </header>

      ${posts}

    </body>

    </html>
  `;

}


[
  "themeBg",
  "themeFg",
  "themeTitle",
  "themeDesc",
  "customCss"
]
.forEach(id => {

  const element = $(id);

  if (!element) return;

  element.addEventListener(
    "input",
    renderPreview
  );

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

  if (!element) return;

  element.addEventListener(
    "change",
    renderPreview
  );

});


/* =========================
   PAGE
========================= */

if ($("savePage")) {

  $("savePage").addEventListener(
    "click",
    async () => {

      data.page = {

        title:
          $("pageTitle").value,

        content:
          $("pageContent").value

      };

      await save();

      alert(
        "صفحه ذخیره شد."
      );

    }
  );

}


/* =========================
   SETTINGS
========================= */

if ($("saveSettings")) {

  $("saveSettings").addEventListener(
    "click",
    async () => {

      data.settings = {

        admin:
          $("adminName").value,

        panel:
          $("panelTitle").value

      };

      await save();

      alert(
        "تنظیمات ذخیره شد."
      );

    }
  );

}


/* =========================
   TOOLBAR
========================= */

document
  .querySelectorAll(
    "#toolbar button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const command =
          button.dataset.cmd;

        if (
          command === "createLink"
        ) {

          const url =
            prompt(
              "آدرس لینک:"
            );

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
            prompt(
              "آدرس تصویر:"
            );

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
            button.dataset.value ||
            null
          );

        }

      }
    );

  });


/* =========================
   RENDER
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
  loadTheme();

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

}


/* =========================
   START
========================= */

renderAll();

console.log(
  "Homo Irrealis Admin loaded successfully."
);
