console.log("Its working");

let theme = localStorage.getItem("theme");

if (theme == null) {
  setTheme("light");
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
