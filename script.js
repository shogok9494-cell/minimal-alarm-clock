const clockEl = document.getElementById('clock');
const alarmInput = document.getElementById('alarm-time');
const toggleBtn = document.getElementById('toggle-btn');
const statusEl = document.getElementById('status');

let alarmActive = false;
let alarmTime = null;
let ringing = false;

function pad(n) {
  return String(n).padStart(2, '0');
}

function tick() {
  const now = new Date();
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  clockEl.textContent = `${h}:${m}:${s}`;

  if (alarmActive && !ringing) {
    const current = `${h}:${m}`;
    if (current === alarmTime && now.getSeconds() === 0) {
      triggerAlarm();
    }
  }
}

function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.0);
}

function triggerAlarm() {
  ringing = true;
  beep();
  statusEl.textContent = '起きろ！';
  statusEl.style.color = '#e94560';
  alert(`アラーム！ ${alarmTime}`);
  resetAlarm();
}

function resetAlarm() {
  alarmActive = false;
  ringing = false;
  alarmTime = null;
  toggleBtn.textContent = 'セット';
  toggleBtn.classList.remove('active');
  statusEl.textContent = '待機中';
  statusEl.style.color = '#aaa';
}

toggleBtn.addEventListener('click', () => {
  if (alarmActive) {
    resetAlarm();
    return;
  }

  const val = alarmInput.value;
  if (!val) {
    statusEl.textContent = '時刻を選んで';
    statusEl.style.color = '#e94560';
    return;
  }

  alarmTime = val;
  alarmActive = true;
  toggleBtn.textContent = 'キャンセル';
  toggleBtn.classList.add('active');
  statusEl.textContent = `${val} にアラーム`;
  statusEl.style.color = '#2ecc71';
});

setInterval(tick, 1000);
tick();
