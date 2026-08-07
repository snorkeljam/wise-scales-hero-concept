(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var heroNav = document.getElementById("heroNav");
  if (heroNav) {
    function onNavScroll() {
      if (window.scrollY > 60) heroNav.classList.add("is-scrolled");
      else heroNav.classList.remove("is-scrolled");
    }
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
  }

  var revealSections = document.querySelectorAll(".rich-section");
  if (revealSections.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealSections.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      }, { threshold: 0.18 });
      revealSections.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  var countEls = document.querySelectorAll(".num[data-count-to]");
  function formatCount(n) { return n.toLocaleString("en-US"); }
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var startTime = null;
    if (el._countRAF) cancelAnimationFrame(el._countRAF);
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(Math.round(target * eased)) + suffix;
      if (progress < 1) {
        el._countRAF = requestAnimationFrame(step);
      } else {
        el._countRAF = null;
      }
    }
    el._countRAF = requestAnimationFrame(step);
  }
  if (countEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      countEls.forEach(function (el) {
        el.textContent = formatCount(parseInt(el.getAttribute("data-count-to"), 10)) + (el.getAttribute("data-suffix") || "");
      });
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
          } else {
            if (entry.target._countRAF) cancelAnimationFrame(entry.target._countRAF);
            entry.target.textContent = "0";
          }
        });
      }, { threshold: 0.4 });
      countEls.forEach(function (el) { countObserver.observe(el); });
    }
  }

  var video = document.getElementById("bgVideo");
  var videoToggle = document.getElementById("videoToggle");
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var isSlowConnection = !!(conn && (conn.saveData || /2g/.test(conn.effectiveType || "")));
  if (video) {
    if (isSlowConnection) {
      video.remove();
      if (videoToggle) videoToggle.remove();
    } else {
      if (reduceMotion) {
        video.pause();
      }
      if (videoToggle) {
        function syncToggle() {
          var paused = video.paused;
          videoToggle.classList.toggle("is-paused", paused);
          videoToggle.setAttribute("aria-pressed", String(paused));
          videoToggle.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
        }
        videoToggle.addEventListener("click", function () {
          if (video.paused) { video.play(); } else { video.pause(); }
        });
        video.addEventListener("play", syncToggle);
        video.addEventListener("pause", syncToggle);
        syncToggle();
      }
    }
  } else if (videoToggle) {
    videoToggle.remove();
  }

  var phrases = [
    "worry.",
    "not washing clothes.",
    "anger.",
    "shame.",
    "not washing hands.",
    "not enough to drink.",
    "going to sleep thirsty.",
    "interrupted plans."
  ];
  var phraseIdx = 0;
  var el = document.getElementById("rotator");
  if (reduceMotion) {
    el.textContent = phrases[0];
  } else {
    setInterval(function () {
      el.classList.add("leaving");
      setTimeout(function () {
        phraseIdx = (phraseIdx + 1) % phrases.length;
        el.textContent = phrases[phraseIdx];
        el.classList.remove("leaving");
        el.classList.add("entering");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.classList.remove("entering"); });
        });
      }, 380);
    }, 3800);
  }

  var WISE4 = [
    { question: "How often did you worry that you would not have enough water for all of your needs?" },
    { question: "How often did you have to change schedules or plans because of problems with water?" },
    { question: "How often were you not able to wash your hands after dirty activities because of problems with water?" },
    { question: "How often did you not have as much water to drink as you would have liked?" }
  ];
  var overlay = document.getElementById("wiseOverlay");

  if (overlay) {
    if (reduceMotion) {
      overlay.innerHTML = WISE4.map(function (item) {
        return "<div class=\"wise-item is-visible\">" +
          "<p class=\"wise-question\">" + item.question + "</p>" +
          "</div>";
      }).join("");
    } else {
      function buildSequence() {
        overlay.innerHTML = "";
        var wiseIdx = 0;
        function typeItem() {
          var item = WISE4[wiseIdx];
          var block = document.createElement("div");
          block.className = "wise-item";
          block.innerHTML = "<p class=\"wise-question\"><span class=\"cursor\"></span></p>";
          overlay.appendChild(block);
          requestAnimationFrame(function () { block.classList.add("is-visible"); });
          var questionEl = block.querySelector(".wise-question");
          var chars = item.question.split("");
          var ci = 0;
          (function typeChar() {
            ci++;
            questionEl.innerHTML = item.question.slice(0, ci) + "<span class=\"cursor\"></span>";
            if (ci < chars.length) {
              setTimeout(typeChar, 32);
            } else {
              setTimeout(function () {
                questionEl.innerHTML = item.question;
                wiseIdx++;
                if (wiseIdx < WISE4.length) {
                  setTimeout(typeItem, 900);
                } else {
                  setTimeout(buildSequence, 7000);
                }
              }, 300);
            }
          })();
        }
        typeItem();
      }
      buildSequence();
    }
  }
})();
