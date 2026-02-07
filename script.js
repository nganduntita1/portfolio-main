console.log("Its working");

let theme = localStorage.getItem("theme");

if (theme == null) {
  setTheme("green");
} else {
  setTheme(theme);
}

let themeDots = document.getElementsByClassName("theme-dot");

for (var i = 0; themeDots.length > i; i++) {
  themeDots[i].addEventListener("click", function () {
    let mode = this.dataset.mode;
    console.log("Option clicked:", mode);
    setTheme(mode);
  });
}

function setTheme(mode) {
  if (mode == "light") {
    document.getElementById("theme-style").href = "blue.css";
  }

  if (mode == "blue") {
    document.getElementById("theme-style").href = "default.css";
  }

  if (mode == "green") {
    document.getElementById("theme-style").href = "green.css";
  }

  if (mode == "purple") {
    document.getElementById("theme-style").href = "purple.css";
  }

  localStorage.setItem("theme", mode);
}

const projectModal = document.getElementById("projectModal");
const projectModalTitle = document.getElementById("projectModalTitle");
const projectModalDesc = document.getElementById("projectModalDesc");
const projectModalGallery = document.getElementById("projectModalGallery");
const projectModalLink = document.getElementById("projectModalLink");

function openProjectModal(card) {
  if (!projectModal || !card) return;

  const title = card.dataset.title || "Project";
  const description = card.dataset.description || "";
  const link = card.dataset.link || "#";
  const images = (card.dataset.images || "").split(",").map((item) => item.trim()).filter(Boolean);

  projectModalTitle.textContent = title;
  projectModalDesc.textContent = description;
  projectModalLink.href = link;

  projectModalGallery.innerHTML = "";
  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = `${title} preview`;
    projectModalGallery.appendChild(img);
  });

  projectModal.classList.add("is-open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove("is-open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", () => openProjectModal(card));
});

document.addEventListener("click", (event) => {
  if (!projectModal || !projectModal.classList.contains("is-open")) return;
  const target = event.target;
  if (target && target.getAttribute("data-close") === "true") {
    closeProjectModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
  }
});

////////////////NEW STUFF////////////////
let tl = new TimelineMax({ repeat: -1 });
let text = new SplitText(".headline", { type: "words" });

tl.staggerFromTo(
  text.words,
  0.75,
  { y: 20, opacity: 0 },
  { y: 0, opacity: 1, ease: Power4.easeOut },
  0.025,
  "+=1.5"
).staggerTo(
  text.words,
  1,
  { y: -20, opacity: 0, ease: Power4.easeIn },
  0.035,
  "+=2"
);
