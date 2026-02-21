// lagu.js
export const songs = [
  {title:"Surat Cinta Untuk Starla",src:"starla.mp3",emoji:"💌"},
  {title:"Selamat Tinggal",src:"selamat-tinggal.mp3",emoji:"👋"},
  {title:"Seluruh Nafas Ini",src:"s.mp3",emoji:"🌬️"},
  {title:"Duka",src:"d.mp3",emoji:"🌧️"},
  {title:"Pedih",src:"p.mp3",emoji:"💔"},
  {title:"Bukti",src:"b.mp3",emoji:"📜"},
  {title:"Diary Depresiku",src:"di.mp3",emoji:"📔"},
  {title:"Sekuat Hatimu",src:"se.mp3",emoji:"💪"},
  {title:"Bernafas Tanpamu",src:"1.mp3",emoji:"🌊"},
  {title:"Tak Pernah Ternilai",src:"2.mp3",emoji:"⭐"},
  {title:"Saat Kau Telah Mengerti",src:"3.mp3",emoji:"🌸"},
  {title:"Baik Baik Sayang",src:"https://image2url.com/r2/default/audio/1771619660220-081c591d-e164-4cbc-818a-fe3671497f38.mp3",emoji:"🌺"},
  {title:"Yank",src:"https://image2url.com/r2/default/audio/1771626404446-67166325-1c0c-4d80-93ff-2ce5873b595b.mp3",emoji:"💛"},
  {title:"Tobat Maksiat",src:"https://image2url.com/r2/default/audio/1771627039637-ff746660-0cf2-4e20-8d38-96452bdeee5c.mp3",emoji:"🙏"},
  {title:"Nenek-ku Pahlawanku",src:"https://image2url.com/r2/default/audio/1771627305197-c993ddc0-567f-4d63-bf2e-58af7b79e2d5.mp3",emoji:"👵"},
  {title:"Puaskah",src:"https://image2url.com/r2/default/audio/1771627423608-9415b1d0-ff7c-4def-9b76-edd7821ce344.mp3",emoji:"❓"},
  {title:"Harusnya Aku",src:"https://image2url.com/r2/default/audio/1771627545709-a3250a04-8b0b-4200-8457-9dccc75602fc.mp3",emoji:"😔"},
  {title:"Montagem Perigosa",src:"https://image2url.com/r2/default/audio/1771644598296-98535e8d-1289-44b9-9816-aa53b4018e25.mp3",emoji:"🔥"},
  {title:"Loucura Letal (Slowed)",src:"https://image2url.com/r2/default/audio/1771648040907-1037e0e1-c14a-483b-adf0-45c5f87e33ff.mp3",emoji:"🌀"},
];

const audio = document.getElementById("audio");
const npTitle = document.getElementById("npTitle");
const npCover = document.getElementById("npCover");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const listEl = document.getElementById("list");
const btnPlay = document.getElementById("btnPlay");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnMode = document.getElementById("btnMode");
const btnLike = document.getElementById("btnLike");
const btnLogout = document.getElementById("logout");
const loginScreen = document.getElementById("loginScreen");
const btnLogin = document.getElementById("btnLogin");
const btnGuest = document.getElementById("btnGuest");
const volumeSlider = document.getElementById("volume");
const userBadge = document.getElementById("userBadge");
const toastEl = document.getElementById("toast");
const songCountEl = document.getElementById("songCount");

let idx = 0;
let isPremium = false;
let isPlaying = false;
let mode = 0; // 0=normal, 1=repeat all, 2=repeat one, 3=shuffle
const modeEmojis = ["🔁","🔁","🔂","🔀"];
const modeNames = ["Normal","Repeat All","Repeat One","Shuffle"];
let liked = new Set();

// TOAST
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// LOGIN
function checkLogin() {
  const status = localStorage.getItem("mlUser");
  if (status) {
    isPremium = status === "premium";
    loginScreen.classList.add('hidden');
    updateBadge();
  }
}

function updateBadge() {
  if (isPremium) {
    userBadge.textContent = 'Premium';
    userBadge.className = 'badge-premium';
    btnMode.style.display = 'flex';
  } else {
    userBadge.textContent = 'Free';
    userBadge.className = 'badge-free';
    btnMode.style.display = 'none';
  }
}

btnLogin.onclick = () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value;
  if (u === "admin" && p === "123") {
    localStorage.setItem("mlUser", "premium");
    isPremium = true;
    loginScreen.classList.add('hidden');
    updateBadge();
    showToast("✨ Selamat datang, Premium!");
  } else {
    document.querySelector('.login-box').style.animation = 'none';
    setTimeout(() => { document.querySelector('.login-box').style.animation = 'shake 0.4s ease'; }, 10);
    showToast("❌ Username atau password salah");
  }
};

btnGuest.onclick = () => {
  localStorage.setItem("mlUser", "guest");
  isPremium = false;
  loginScreen.classList.add('hidden');
  updateBadge();
  showToast("👋 Masuk sebagai tamu");
};

btnLogout.onclick = () => {
  localStorage.removeItem("mlUser");
  audio.pause();
  isPlaying = false;
  btnPlay.textContent = '▶';
  npCover.classList.remove('playing');
  loginScreen.style.opacity = '0';
  loginScreen.classList.remove('hidden');
  setTimeout(() => { loginScreen.style.opacity = '1'; }, 10);
};

checkLogin();

// PLAYER
function loadSong(i) {
  idx = i;
  audio.src = songs[i].src;
  audio.volume = volumeSlider.value;
  npTitle.textContent = songs[i].title;
  npCover.textContent = songs[i].emoji;
  npCover.className = 'np-cover icon-' + i;
  renderList();
  updateMediaSession();
}

function setPlaying(val) {
  isPlaying = val;
  btnPlay.textContent = val ? '⏸' : '▶';
  if (val) npCover.classList.add('playing');
  else npCover.classList.remove('playing');
  // animate bars
  document.querySelectorAll('.bar').forEach(b => {
    b.style.animationPlayState = val ? 'running' : 'paused';
  });
}

btnPlay.onclick = () => {
  if (audio.paused) {
    audio.play().then(() => setPlaying(true));
  } else {
    audio.pause();
    setPlaying(false);
  }
};

btnPrev.onclick = () => {
  idx = (idx - 1 + songs.length) % songs.length;
  loadSong(idx);
  audio.play().then(() => setPlaying(true));
};

function nextSong() {
  if (mode === 2) { audio.currentTime = 0; audio.play(); return; }
  if (mode === 3) { idx = Math.floor(Math.random() * songs.length); }
  else { idx++; if (idx >= songs.length) { if (mode === 1) idx = 0; else { setPlaying(false); return; } } }
  loadSong(idx);
  audio.play().then(() => setPlaying(true));
}

btnNext.onclick = () => {
  if (mode === 3) idx = Math.floor(Math.random() * songs.length);
  else { idx = (idx + 1) % songs.length; }
  loadSong(idx);
  audio.play().then(() => setPlaying(true));
};

audio.onended = nextSong;

btnMode.onclick = () => {
  if (!isPremium) { showToast("🔒 Fitur eksklusif Premium"); return; }
  mode = (mode + 1) % 4;
  btnMode.textContent = modeEmojis[mode];
  btnMode.classList.toggle('mode-active', mode !== 0);
  showToast("Mode: " + modeNames[mode]);
};

btnLike.onclick = () => {
  if (liked.has(idx)) {
    liked.delete(idx);
    btnLike.textContent = '🤍';
    showToast("Dihapus dari favorit");
  } else {
    liked.add(idx);
    btnLike.textContent = '❤️';
    showToast("Ditambah ke favorit");
  }
};

// PROGRESS
audio.ontimeupdate = () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent = formatTime(audio.duration);
};

progressTrack.onclick = (e) => {
  const rect = progressTrack.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
};

function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2,'0');
  return m + ':' + sec;
}

volumeSlider.oninput = () => { audio.volume = volumeSlider.value; };

// LIST
function renderList() {
  listEl.innerHTML = '';
  songCountEl.textContent = songs.length + ' lagu';
  songs.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'song-row' + (i === idx ? ' active' : '');
    div.innerHTML = `
      <span class="song-num">${i === idx ? '' : i + 1}</span>
      <div class="song-icon icon-${i}">${s.emoji}</div>
      <div class="song-details">
        <div class="song-name">${s.title}</div>
        <div class="song-meta">MusikLite</div>
      </div>
      <div class="song-playing-indicator">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    `;
    div.onclick = () => {
      loadSong(i);
      audio.play().then(() => setPlaying(true));
    };
    listEl.appendChild(div);
  });

  // Scroll active into view smoothly
  const active = listEl.querySelector('.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// MEDIA SESSION
function updateMediaSession() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: songs[idx].title,
      artist: 'MusikLite',
      album: 'Playlist'
    });
    navigator.mediaSession.setActionHandler('play', () => { audio.play(); setPlaying(true); });
    navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); setPlaying(false); });
    navigator.mediaSession.setActionHandler('previoustrack', () => btnPrev.onclick());
    navigator.mediaSession.setActionHandler('nexttrack', () => btnNext.onclick());
  }
}

// SHAKE ANIM
const style = document.createElement('style');
style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`;
document.head.appendChild(style);

loadSong(0);
