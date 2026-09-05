import { TOOL_LABELS, classifyAudio, type ToolLabel } from "./classifier";

const fileInput = document.querySelector<HTMLInputElement>("#file")!;
const micBtn = document.querySelector<HTMLButtonElement>("#mic")!;
const classifyBtn = document.querySelector<HTMLButtonElement>("#classify")!;
const statusEl = document.querySelector<HTMLElement>("#status")!;
const summaryEl = document.querySelector<HTMLElement>("#summary")!;
const scoresEl = document.querySelector<HTMLUListElement>("#scores")!;

let currentAudio: { sampleRate: number; samples: Float32Array } | null = null;

function setStatus(msg: string): void {
  statusEl.textContent = msg;
}

function renderScores(scores: Record<ToolLabel, number>): void {
  const top = TOOL_LABELS.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  summaryEl.innerHTML = `Top class: <strong>${top}</strong> (${(scores[top] * 100).toFixed(0)}%)`;

  scoresEl.innerHTML = "";
  const ordered = [...TOOL_LABELS].sort((a, b) => scores[b] - scores[a]);
  for (const label of ordered) {
    const li = document.createElement("li");
    const pct = Math.round(scores[label] * 100);
    li.innerHTML = `<span>${label}</span><div class="bar"><span style="width:${pct}%"></span></div><span>${pct}%</span>`;
    scoresEl.appendChild(li);
  }
}

async function decodeFile(file: File): Promise<{ sampleRate: number; samples: Float32Array }> {
  const buffer = await file.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(buffer.slice(0));
    const channel = decoded.getChannelData(0);
    return { sampleRate: decoded.sampleRate, samples: new Float32Array(channel) };
  } finally {
    await ctx.close();
  }
}

async function recordMic(seconds = 2): Promise<{ sampleRate: number; samples: Float32Array }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  return new Promise((resolve) => {
    const started = ctx.currentTime;
    processor.onaudioprocess = (event) => {
      chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      if (ctx.currentTime - started >= seconds) {
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        const length = chunks.reduce((n, c) => n + c.length, 0);
        const samples = new Float32Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          samples.set(chunk, offset);
          offset += chunk.length;
        }
        resolve({ sampleRate: ctx.sampleRate, samples });
      }
    };
    source.connect(processor);
    processor.connect(ctx.destination);
  });
}

function runClassify(): void {
  if (!currentAudio) return;
  const scores = classifyAudio(currentAudio);
  renderScores(scores);
  setStatus("Classification complete.");
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  setStatus(`Decoding ${file.name}…`);
  try {
    currentAudio = await decodeFile(file);
    classifyBtn.disabled = false;
    setStatus(`Loaded ${file.name} (${currentAudio.sampleRate} Hz, ${currentAudio.samples.length} samples).`);
  } catch (err) {
    currentAudio = null;
    classifyBtn.disabled = true;
    setStatus(err instanceof Error ? err.message : String(err));
  }
});

micBtn.addEventListener("click", async () => {
  setStatus("Recording 2 seconds…");
  classifyBtn.disabled = true;
  try {
    currentAudio = await recordMic(2);
    classifyBtn.disabled = false;
    setStatus(`Recorded ${currentAudio.samples.length} samples @ ${currentAudio.sampleRate} Hz.`);
    runClassify();
  } catch (err) {
    setStatus(err instanceof Error ? err.message : String(err));
  }
});

classifyBtn.addEventListener("click", runClassify);
