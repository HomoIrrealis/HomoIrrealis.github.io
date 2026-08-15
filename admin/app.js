const KEY="homoIrrealisAdminData";
const API="https://homoirrealis.netlify.app/.netlify/functions/github";
const defaults={categories:["Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§","Ù…Ø·Ø§Ù„Ø¹Ø§Øª","ÛŒØ§Ø¯Ø¯Ø§Ø´Øª"],posts:[
{id:1,title:"Ù†Ù…ÙˆÙ†Ù‡ Ù†ÙˆØ´ØªÙ‡",category:"ÛŒØ§Ø¯Ø¯Ø§Ø´Øª",tags:["ÛŒØ§Ø¯Ø¯Ø§Ø´Øª","Ø§ÛŒÙ…Ø§Ú˜"],image:"",content:"<p>Ø§ÛŒÙ† ÛŒÚ© Ù†ÙˆØ´ØªÙ‡â€ŒÛŒ Ù†Ù…ÙˆÙ†Ù‡ Ø§Ø³Øª.</p>",date:"Û±Ûµ Ù…Ø±Ø¯Ø§Ø¯ Û±Û´Û°Ûµ",time:"22:00",status:"published"},
{id:2,title:"Ù†Ù…ÙˆÙ†Ù‡ Ø§Ø«Ø±",category:"Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§",tags:["Ù¾Ø±ÙˆÚ˜Ù‡"],image:"",content:"<p>Ø§ÛŒÙ† ÛŒÚ© Ø§Ø«Ø± Ù†Ù…ÙˆÙ†Ù‡ Ø§Ø³Øª.</p>",date:"Û±Û´ Ù…Ø±Ø¯Ø§Ø¯ Û±Û´Û°Ûµ",time:"18:30",status:"published"}
],links:[{title:"Pinterest",url:"https://www.pinterest.com/itsnyctophilia/21-%CA%BCtill-i-die/"}],page:{title:"Ù…ÙŽÙ†",content:""},theme:{bg:"#335C67",fg:"#FEF4AF",title:"Homo Irrealis",desc:"Ø§ÛŒÙ…Ø§Ú˜ØŒ Ø¢Ø«Ø§Ø± Ùˆ ÛŒØ§Ø¯Ø¯Ø§Ø´Øªâ€ŒÙ‡Ø§",about:true,links:true,tags:true,archive:true,categories:true,css:""},settings:{admin:"DIAN",panel:"Homo Irrealis"}};
let data=load();

const API = "https://homoirrealis.netlify.app/.netlify/functions/github";

function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaults)}catch(e){return structuredClone(defaults)}}
async 
  async function save(){
  localStorage.setItem(KEY,JSON.stringify(data));
  renderAll();

  try {
    const response=await fetch(API+"?file=admin/data.json",{
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        content:JSON.stringify(data,null,2),
        message:"Update blog data"
      })
    });

    const result=await response.json();

    console.log("GitHub response:",result);

    if(!response.ok || !result.success){
      alert("خطا در ذخیره GitHub: "+(result.error||"Unknown error"));
      return;
    }

    alert("در GitHub ذخیره شد.");
  }catch(error){
    console.error(error);
    alert("اتصال به GitHub انجام نشد: "+error.message);
  }
  }

  try {
    const response = await fetch(
      "https://homoirrealis.netlify.app/.netlify/functions/github?file=admin/data.json",
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
      throw new Error(result.error || "GitHub save failed");
    }

    console.log("Saved to GitHub");

  } catch(error) {
    console.error(error);
    alert("ذخیره روی GitHub انجام نشد.");
  }
  }

  try {
    await fetch(API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: JSON.stringify(data, null, 2),
        message: "Update blog data"
      })
    });
  } catch(error) {
    console.error("GitHub save failed:", error);
  }
}
function $(id){return document.getElementById(id)}
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>show(b.dataset.view));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
function show(id){
 document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
 $(id).classList.add("active");
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
 if(id==="editor") resetEditor();
}
$("logoutBtn").onclick=()=>alert("Ø¯Ø± Ù†Ø³Ø®Ù‡ Ù†Ù‡Ø§ÛŒÛŒØŒ Ø®Ø±ÙˆØ¬ Ø¨Ù‡ Ø³ÛŒØ³ØªÙ… Ø§Ø­Ø±Ø§Ø² Ù‡ÙˆÛŒØª GitHub Ù…ØªØµÙ„ Ø®ÙˆØ§Ù‡Ø¯ Ø´Ø¯.");

document.querySelectorAll("#toolbar button").forEach(b=>b.onclick=()=>{
 const c=b.dataset.cmd;
 if(c==="createLink"){const u=prompt("Ø¢Ø¯Ø±Ø³ Ù„ÛŒÙ†Ú©:");if(u)document.execCommand("createLink",false,u)}
 else if(c==="insertImage"){const u=prompt("Ø¢Ø¯Ø±Ø³ ØªØµÙˆÛŒØ±:");if(u)document.execCommand("insertImage",false,u)}
 else document.execCommand(c,false,b.dataset.value||null);
 $("postContent").focus();
});

function resetEditor(){
 $("editorTitle").textContent="Ø§Ø±Ø³Ø§Ù„ Ù…Ø·Ù„Ø¨";
 $("postId").value="";$("postTitle").value="";$("postTags").value="";$("postImage").value="";$("postContent").innerHTML="";
 fillCategories();
}
function fillCategories(){
 $("postCategory").innerHTML=data.categories.map(c=>`<option>${esc(c)}</option>`).join("");
}
function editPost(id){
 const p=data.posts.find(x=>x.id==id);if(!p)return;
 show("editor");$("editorTitle").textContent="ÙˆÛŒØ±Ø§ÛŒØ´ Ù…Ø·Ù„Ø¨";$("postId").value=p.id;$("postTitle").value=p.title;
 $("postCategory").value=p.category;$("postTags").value=(p.tags||[]).join("ØŒ ");$("postImage").value=p.image||"";$("postContent").innerHTML=p.content||"";
}
function collect(status){
 return {id:Number($("postId").value)||Date.now(),title:$("postTitle").value.trim(),category:$("postCategory").value,tags:$("postTags").value.split(/[,ØŒ]/).map(x=>x.trim()).filter(Boolean),image:$("postImage").value.trim(),content:$("postContent").innerHTML,date:new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium"}).format(new Date()),time:new Date().toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"}),status};
}
$("postForm").onsubmit=e=>{e.preventDefault();upsert(collect("published"));alert("Ù…Ø·Ù„Ø¨ Ù…Ù†ØªØ´Ø± Ø´Ø¯.");show("posts")};
$("draftBtn").onclick=()=>{if(!$("postTitle").value.trim())return alert("Ø¹Ù†ÙˆØ§Ù† Ù…Ø·Ù„Ø¨ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.");upsert(collect("draft"));alert("Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯.");show("posts")};
$("cancelEdit").onclick=()=>show("posts");
function upsert(p){const i=data.posts.findIndex(x=>x.id===p.id);if(i>=0)data.posts[i]=p;else data.posts.unshift(p);save()}

function renderPosts(){
 const t=$("postsTable");if(!data.posts.length){t.innerHTML='<tr><td colspan="5" class="empty">Ù‡Ù†ÙˆØ² Ù…Ø·Ù„Ø¨ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.</td></tr>';return}
 t.innerHTML=data.posts.map(p=>`<tr><td>${esc(p.title)}</td><td>${esc(p.category)}</td><td>${esc(p.date)}</td><td><span class="status ${p.status==="draft"?"draft":""}">${p.status==="draft"?"Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³":"Ù…Ù†ØªØ´Ø±"}</span></td><td class="row-actions"><button onclick="editPost(${p.id})">ÙˆÛŒØ±Ø§ÛŒØ´</button><button class="danger" onclick="deletePost(${p.id})">Ø­Ø°Ù</button></td></tr>`).join("");
}
function deletePost(id){if(confirm("Ø§ÛŒÙ† Ù…Ø·Ù„Ø¨ Ø­Ø°Ù Ø´ÙˆØ¯ØŸ")){data.posts=data.posts.filter(p=>p.id!=id);save()}}
function renderCategories(){
 $("categoryList").innerHTML=data.categories.map((c,i)=>`<li><span>${esc(c)}</span><button class="danger" onclick="deleteCategory(${i})">Ø­Ø°Ù</button></li>`).join("");
 fillCategories();
}
$("addCategory").onclick=()=>{const v=$("newCategory").value.trim();if(v&&!data.categories.includes(v)){data.categories.push(v);$("newCategory").value="";save()}};
function deleteCategory(i){if(data.categories.length<=1)return alert("Ø­Ø¯Ø§Ù‚Ù„ ÛŒÚ© Ù…ÙˆØ¶ÙˆØ¹ Ø¨Ø§ÛŒØ¯ Ø¨Ø§Ù‚ÛŒ Ø¨Ù…Ø§Ù†Ø¯.");data.categories.splice(i,1);save()}

function renderTags(){
 const m={};data.posts.forEach(p=>(p.tags||[]).forEach(t=>m[t]=(m[t]||0)+1));
 $("tagCloud").innerHTML=Object.keys(m).length?Object.entries(m).map(([t,n])=>`<span>${esc(t)} <small>(${n})</small></span>`).join(""):'<div class="empty">Ù‡Ù†ÙˆØ² Ø¨Ø±Ú†Ø³Ø¨ÛŒ Ø³Ø§Ø®ØªÙ‡ Ù†Ø´Ø¯Ù‡.</div>';
}
function renderLinks(){
 $("linkList").innerHTML=data.links.map((l,i)=>`<li><a href="${esc(l.url)}" target="_blank">${esc(l.title)}</a><button class="danger" onclick="deleteLink(${i})">Ø­Ø°Ù</button></li>`).join("");
}
$("addLink").onclick=()=>{const t=$("linkTitle").value.trim(),u=$("linkUrl").value.trim();if(t&&u){data.links.push({title:t,url:u});$("linkTitle").value="";$("linkUrl").value="";save()}};
function deleteLink(i){data.links.splice(i,1);save()}

function loadTheme(){
 const t=data.theme;$("themeBg").value=t.bg;$("themeFg").value=t.fg;$("themeTitle").value=t.title;$("themeDesc").value=t.desc;
 $("showAbout").checked=t.about;$("showLinks").checked=t.links;$("showTags").checked=t.tags;$("showArchive").checked=t.archive;$("showCategories").checked=t.categories;$("customCss").value=t.css||"";
 renderPreview();
}
function saveTheme(){
 data.theme={bg:$("themeBg").value.trim()||"#335C67",fg:$("themeFg").value.trim()||"#FEF4AF",title:$("themeTitle").value,desc:$("themeDesc").value,about:$("showAbout").checked,links:$("showLinks").checked,tags:$("showTags").checked,archive:$("showArchive").checked,categories:$("showCategories").checked,css:$("customCss").value};
 save();alert("ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù‚Ø§Ù„Ø¨ Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯.");
}
$("saveTheme").onclick=saveTheme;
["themeBg","themeFg","themeTitle","themeDesc","customCss"].forEach(id=>$(id).addEventListener("input",renderPreview));
["showAbout","showLinks","showTags","showArchive","showCategories"].forEach(id=>$(id).addEventListener("change",renderPreview));
function renderPreview(){
 const t={bg:$("themeBg").value||"#335C67",fg:$("themeFg").value||"#FEF4AF",title:$("themeTitle").value||"Homo Irrealis",desc:$("themeDesc").value||"",css:$("customCss").value||""};
 const p=data.posts.slice(0,3).map(x=>`<article><h3>${esc(x.title)}</h3><div>${x.content}</div></article>`).join("");
 $("preview").srcdoc=`<!doctype html><html lang="fa" dir="rtl"><style>body{margin:0;background:${esc(t.bg)};color:${esc(t.fg)};font-family:Arial;padding:25px}header{text-align:center;border-bottom:1px solid ${esc(t.fg)};padding:12px}h1{font-size:28px}article{border:1px solid ${esc(t.fg)};padding:12px;margin:12px auto;max-width:380px}a{color:${esc(t.fg)}}${t.css}</style><header><h1>${esc(t.title)}</h1><p>${esc(t.desc)}</p></header>${p}</html>`;
}
$("savePage").onclick=()=>{data.page={title:$("pageTitle").value,content:$("pageContent").value};save();alert("ØµÙØ­Ù‡ Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯.")};
$("saveSettings").onclick=()=>{data.settings={admin:$("adminName").value,panel:$("panelTitle").value};save();alert("ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯.")};

function renderAll(){
 $("statPosts").textContent=data.posts.filter(p=>p.status==="published").length;
 $("statDrafts").textContent=data.posts.filter(p=>p.status==="draft").length;
 $("statCats").textContent=data.categories.length;
 const tags=new Set(data.posts.flatMap(p=>p.tags||[]));$("statTags").textContent=tags.size;
 renderPosts();renderCategories();renderTags();renderLinks();
 $("pageTitle").value=data.page.title;$("pageContent").value=data.page.content;
 $("adminName").value=data.settings.admin;$("panelTitle").value=data.settings.panel;
 loadTheme();
}
renderAll();
