const posterRig = document.querySelector("[data-poster]");
const poster = document.querySelector(".portrait-scene");
const heroShell = document.querySelector(".hero-shell");
const boot = document.querySelector("[data-boot]");
const canvas = document.querySelector(".signal-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let motionApi = null;
const motionReady = import("https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm")
  .then((module) => {
    motionApi = module;
    return module;
  })
  .catch(() => null);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Matrix Text Scramble
const scrambleText = (element) => {
  const originalText = element.textContent;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  let iteration = 0;
  
  const interval = setInterval(() => {
    element.textContent = originalText.split("").map((letter, index) => {
      if(index < iteration) {
        return originalText[index];
      }
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
    
    if(iteration >= originalText.length) {
      clearInterval(interval);
    }
    
    iteration += 1 / 5;
  }, 45);
};

window.addEventListener("load", () => {
  const bootSpan = document.querySelector(".boot-box span");
  const bootStrong = document.querySelector(".boot-box strong");
  
  if (bootStrong) {
    bootStrong.textContent = "CORE SYSTEMS ONLINE";
  }

  if (!reducedMotion) {
    if(bootSpan) scrambleText(bootSpan);
    if(bootStrong) setTimeout(() => scrambleText(bootStrong), 800);
  }
  window.setTimeout(() => boot?.classList.add("is-done"), reducedMotion ? 50 : 2800);
});

const revealItems = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (motionApi && !reducedMotion) {
        motionApi.animate(entry.target, { opacity: [0, 1], y: [28, 0], scale: [0.985, 1] }, { duration: 0.72, easing: [0.22, 1, 0.36, 1] });
      }
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 55, 360)}ms`;
  revealObserver.observe(item);
});

if (heroShell && poster && !reducedMotion) {
  heroShell.addEventListener("pointermove", (event) => {
    const heroRect = heroShell.getBoundingClientRect();
    const rect = poster.getBoundingClientRect();
    const heroX = clamp((event.clientX - heroRect.left) / heroRect.width, 0, 1);
    const heroY = clamp((event.clientY - heroRect.top) / heroRect.height, 0, 1);
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    heroShell.style.setProperty("--cursor-x", `${heroX * 100}%`);
    heroShell.style.setProperty("--cursor-y", `${heroY * 100}%`);
    poster.style.setProperty("--mx", `${x * 100}%`);
    poster.style.setProperty("--my", `${y * 100}%`);

    if (window.innerWidth > 900) {
      poster.style.setProperty("--tilt-x", `${(x - 0.5) * 3.4}deg`);
      poster.style.setProperty("--tilt-y", `${(0.5 - y) * 2.6}deg`);
    }
  });

  heroShell.addEventListener("pointerleave", () => {
    heroShell.style.setProperty("--cursor-x", "50%");
    heroShell.style.setProperty("--cursor-y", "42%");
    poster.style.setProperty("--mx", "50%");
    poster.style.setProperty("--my", "45%");
    poster.style.setProperty("--tilt-x", "0deg");
    poster.style.setProperty("--tilt-y", "0deg");
  });
}

const counters = document.querySelectorAll("[data-count]");
const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const start = performance.now();
  const duration = reducedMotion ? 1 : 1500;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const suffix = element.getAttribute("data-suffix") || "";
    element.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.45 }
);

counters.forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll(".magnetic").forEach((element) => {
  if (reducedMotion) return;
  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });
  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

document.querySelectorAll(".hud-card, .project-card, .connect-panel, .glass-card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

const initCanvas = () => {
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];

  const resize = () => {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const count = Math.min(90, Math.floor(window.innerWidth / 18));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24 * window.devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.24 * window.devicePixelRatio,
      r: (Math.random() * 1.8 + 0.7) * window.devicePixelRatio
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(83, 220, 255, 0.55)";
    ctx.strokeStyle = "rgba(139, 84, 255, 0.14)";
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 150 * window.devicePixelRatio) {
          ctx.globalAlpha = 1 - distance / (150 * window.devicePixelRatio);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });
    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize);
};

initCanvas();

motionReady.then((motion) => {
  if (!motion || reducedMotion) return;
  motion.animate(".hero-copy h1", { opacity: [0, 1], x: [-34, 0] }, { duration: 0.9, delay: 1.15, easing: "ease-out" });
  motion.animate(".poster-rig", { opacity: [0, 1], rotateZ: [-2, 0], scale: [0.94, 1] }, { duration: 0.9, delay: 1.05, easing: [0.22, 1, 0.36, 1] });
  motion.animate(".command-stack .hud-card", { opacity: [0, 1], x: [24, 0] }, { duration: 0.75, delay: motion.stagger(0.11, { start: 1.28 }) });
});

// Dynamic GitHub Fetching
const fetchGitHubRepos = async () => {
  const container = document.getElementById("github-repos");
  if (!container) return;

  try {
    const response = await fetch("https://api.github.com/users/abhinavshrivastava950/repos?sort=updated&per_page=10");
    if (!response.ok) throw new Error("Failed to fetch GitHub repos");
    const allRepos = await response.json();

    // Filter out junk/config repos
    const repos = allRepos.filter(repo => 
      repo.name !== "mini-air-drop" && 
      repo.name !== "abhinavshrivastava950"
    ).slice(0, 4);

    container.innerHTML = ""; // Clear loading text

    repos.forEach((repo) => {
      const article = document.createElement("article");
      article.className = "project-card";
      article.setAttribute("data-reveal", "");
      
      const langSpan = document.createElement("span");
      langSpan.textContent = repo.language ? repo.language.toUpperCase() : "CODE";
      
      const title = document.createElement("h3");
      title.textContent = repo.name;
      
      const desc = document.createElement("p");
      desc.textContent = repo.description || "Open source repository maintained by Abhinav Shrivastava.";
      
      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Repo";

      article.appendChild(langSpan);
      article.appendChild(title);
      article.appendChild(desc);
      article.appendChild(link);
      
      container.appendChild(article);
      
      revealObserver.observe(article);
    });
  } catch (error) {
    console.error("GitHub fetch error:", error);
    container.innerHTML = "<p style='opacity:0.5;'>Unable to load live repositories at this time.</p>";
  }
};

document.addEventListener("DOMContentLoaded", fetchGitHubRepos);

// Advanced Custom Animations

// 1. Cinematic Cursor Follower
if (!reducedMotion && window.innerWidth > 760) {
  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const updateCursor = () => {
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    if (cursorDot && cursorRing) {
      cursorDot.style.transform = `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))`;
      cursorRing.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px))`;
    }
    requestAnimationFrame(updateCursor);
  };
  requestAnimationFrame(updateCursor);

  document.querySelectorAll("a, button, .magnetic, .flip-card").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursorDot?.classList.add("hovered");
      cursorRing?.classList.add("hovered");
    });
    el.addEventListener("mouseleave", () => {
      cursorDot?.classList.remove("hovered");
      cursorRing?.classList.remove("hovered");
    });
  });
}

// Scroll Progress Bar & Parallax
const scrollProgressBar = document.getElementById("scroll-progress-bar");
let isScrolling = false;

window.addEventListener("scroll", () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      if (scrollProgressBar) {
        scrollProgressBar.style.width = scrollPercent + "%";
      }

      // Portrait Parallax
      if (!reducedMotion && poster) {
        const parallaxOffset = scrollTop * 0.15;
        poster.style.transform = `rotateX(var(--tilt-y)) rotateY(var(--tilt-x)) translateY(${parallaxOffset}px)`;
      }
      
      isScrolling = false;
    });
    isScrolling = true;
  }
});

// Interactive Terminal Easter Egg
const terminalInput = document.getElementById("terminal-input");
const terminalBody = document.getElementById("terminal-body");

if (terminalInput && terminalBody) {
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = terminalInput.value.trim().toLowerCase();
      terminalInput.value = "";
      
      const promptLine = document.createElement("p");
      promptLine.innerHTML = `<span style="color: #00e5ff;">$</span> ${command}`;
      terminalBody.appendChild(promptLine);

      const responseLine = document.createElement("p");
      
      switch (command) {
        case "help":
          responseLine.innerHTML = "Available commands: <span class='highlight'>whoami</span>, <span class='highlight'>warfront</span>, <span class='highlight'>clear</span>, <span class='highlight'>contact</span>";
          break;
        case "whoami":
          const whoamiResponses = [
            "Querying central database... Match found: Abhinav Shrivastava. Classification: AI & OSINT Architect.",
            "Accessing dossier... Subject is the Founder of Warfront.live, specializing in scalable data pipelines and autonomous intelligence.",
            "Identity Confirmed: Canopy by Founders Inc Builder. Known for executing high-velocity product shipping.",
            "SYNAPSE // EVOLVE. Entity recognized as a full-stack innovator operating at the intersection of AI, Web3, and Open Source."
          ];
          responseLine.innerHTML = whoamiResponses[Math.floor(Math.random() * whoamiResponses.length)];
          break;
        case "warfront":
          responseLine.innerHTML = "Initializing Warfront.live connection... <a href='https://warfront.live' target='_blank' style='color:#00e5ff;'>[Click to Launch]</a>";
          break;
        case "contact":
          responseLine.innerHTML = "Opening communication channel... <a href='mailto:abhinavshrivastava950@gmail.com' style='color:#00e5ff;'>abhinavshrivastava950@gmail.com</a>";
          break;
        case "clear":
          terminalBody.innerHTML = "";
          break;
        case "":
          break;
        default:
          responseLine.innerHTML = `<span class='error'>Command not found: ${command}. Type 'help' for available commands.</span>`;
      }
      
      if (command !== "clear" && command !== "") {
        terminalBody.appendChild(responseLine);
      }
      
      // Auto-scroll to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  });
}
