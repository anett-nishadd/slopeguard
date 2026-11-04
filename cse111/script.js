const video = document.querySelector("#hero-video");
const videoToggle = document.querySelector("#video-toggle");
const videoToggleLabel = document.querySelector(".video-toggle-label");
const videoToggleIcon = document.querySelector(".video-toggle-icon");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateVideoControl() {
  const isPaused = video.paused || reducedMotion.matches;
  videoToggle.setAttribute("aria-pressed", String(isPaused));
  videoToggleLabel.textContent = isPaused ? "Play background video" : "Pause background video";
  videoToggleIcon.textContent = isPaused ? "▶" : "Ⅱ";
}

videoToggle.addEventListener("click", async () => {
  if (video.paused) {
    try {
      await video.play();
    } catch (error) {
      videoToggleLabel.textContent = "Background video unavailable";
      return;
    }
  } else {
    video.pause();
  }

  updateVideoControl();
});

const simulationPlay = document.querySelector("#simulation-play");
const simulationReset = document.querySelector("#simulation-reset");
const simulationState = document.querySelector("#simulation-state");
const simulationPhase = document.querySelector("#simulation-phase");
const simulationDescription = document.querySelector("#simulation-description");
const simulationProgress = document.querySelector("#simulation-progress");
const simulationMetrics = {
  rain: document.querySelector("#metric-rain"),
  soil: document.querySelector("#metric-soil"),
  movement: document.querySelector("#metric-movement"),
};
const simulationBars = {
  rain: document.querySelector("#bar-rain"),
  soil: document.querySelector("#bar-soil"),
  movement: document.querySelector("#bar-movement"),
};
const simulationSteps = [
  {
    name: "Baseline sample",
    description: "Synthetic baseline readings are displayed. These values are made up for demonstration only.",
    metrics: ["LOW / DEMO", "STABLE / DEMO", "NO CHANGE / DEMO"],
    bars: [18, 30, 8],
    state: "BASELINE",
  },
  {
    name: "Changing input",
    description: "The test input changes. A real system would compare validated, site-specific measurements—not these demo values.",
    metrics: ["RISING / DEMO", "CHANGING / DEMO", "NO CHANGE / DEMO"],
    bars: [72, 56, 8],
    state: "INPUT CHANGED",
  },
  {
    name: "Sensor disconnected",
    description: "A sensor fault is injected. The demo marks the missing reading as unavailable instead of treating it as normal.",
    metrics: ["RISING / DEMO", "UNAVAILABLE", "NO CHANGE / DEMO"],
    bars: [72, 0, 8],
    state: "SENSOR FAULT",
  },
  {
    name: "Network interruption",
    description: "A communications fault is simulated. This screen does not send an alert or contact an authority.",
    metrics: ["RISING / DEMO", "UNAVAILABLE", "OFFLINE / DEMO"],
    bars: [72, 0, 0],
    state: "NETWORK FAULT",
  },
  {
    name: "Sequence complete",
    description: "This fictional sequence demonstrates interface states only. It does not assess slope stability or predict a landslide.",
    metrics: ["DEMO ONLY", "DEMO ONLY", "DEMO ONLY"],
    bars: [42, 42, 42],
    state: "DEMO COMPLETE",
  },
];
let simulationStep = -1;
let simulationTimer = null;

function showSimulationStep(index) {
  const step = simulationSteps[index];
  simulationStep = index;
  simulationPhase.textContent = step.name;
  simulationDescription.textContent = step.description;
  simulationState.textContent = step.state;
  simulationMetrics.rain.textContent = step.metrics[0];
  simulationMetrics.soil.textContent = step.metrics[1];
  simulationMetrics.movement.textContent = step.metrics[2];
  simulationBars.rain.style.width = `${step.bars[0]}%`;
  simulationBars.soil.style.width = `${step.bars[1]}%`;
  simulationBars.movement.style.width = `${step.bars[2]}%`;
  simulationProgress.style.width = `${((index + 1) / simulationSteps.length) * 100}%`;
}

function finishSimulation() {
  window.clearInterval(simulationTimer);
  simulationTimer = null;
  simulationPlay.textContent = "↻ Replay simulation";
}

function advanceSimulation() {
  if (simulationStep >= simulationSteps.length - 1) {
    finishSimulation();
    return false;
  }

  showSimulationStep(simulationStep + 1);
  if (simulationStep === simulationSteps.length - 1) {
    finishSimulation();
    return false;
  }
  return true;
}

simulationPlay.addEventListener("click", () => {
  if (reducedMotion.matches) {
    if (simulationStep >= simulationSteps.length - 1) {
      resetSimulation();
    }
    advanceSimulation();
    simulationPlay.textContent =
      simulationStep >= simulationSteps.length - 1 ? "↻ Replay simulation" : "Next test phase";
    return;
  }

  if (simulationTimer) {
    window.clearInterval(simulationTimer);
    simulationTimer = null;
    simulationPlay.textContent = "▶ Resume simulation";
    return;
  }

  if (simulationStep >= simulationSteps.length - 1) {
    resetSimulation();
  }
  advanceSimulation();
  if (simulationStep < simulationSteps.length - 1) {
    simulationPlay.textContent = "Ⅱ Pause simulation";
    simulationTimer = window.setInterval(advanceSimulation, 1900);
  }
});

function resetSimulation() {
  window.clearInterval(simulationTimer);
  simulationTimer = null;
  simulationStep = -1;
  simulationPhase.textContent = "Waiting for demo";
  simulationDescription.textContent =
    "Run a fictional scenario to see sample sensor states and fault handling. No real sensors or risk thresholds are used.";
  simulationState.textContent = "READY TO RUN";
  Object.values(simulationMetrics).forEach((metric) => {
    metric.textContent = "—";
  });
  Object.values(simulationBars).forEach((bar) => {
    bar.style.width = "0";
  });
  simulationProgress.style.width = "0";
  simulationPlay.textContent = reducedMotion.matches ? "Next test phase" : "▶ Run simulation";
}

simulationReset.addEventListener("click", resetSimulation);

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    window.clearInterval(simulationTimer);
    simulationTimer = null;
    simulationPlay.textContent =
      simulationStep >= simulationSteps.length - 1 ? "↻ Replay simulation" : "Next test phase";
  } else if (simulationStep < 0) {
    simulationPlay.textContent = "▶ Run simulation";
  }
});

resetSimulation();

video.addEventListener("play", updateVideoControl);
video.addEventListener("pause", updateVideoControl);
video.addEventListener("error", () => {
  videoToggleLabel.textContent = "Background video unavailable";
  videoToggle.disabled = true;
});

if (reducedMotion.matches) {
  video.pause();
}

videoToggle.hidden = reducedMotion.matches;

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    video.pause();
  }
  videoToggle.hidden = event.matches;
  updateVideoControl();
});

updateVideoControl();
