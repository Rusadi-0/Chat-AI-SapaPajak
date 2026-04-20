/* =========================
   ELEMENT
========================= */
const chatWidget = document.getElementById("chatWidget");
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("msg");
const sendBtn = document.querySelector(".chat-input button");
const suggestions = document.getElementById("quickSuggestions");

/* =========================
   STATE
========================= */
let welcomeShown = false;
let isLoading = false;

/* =========================
   TOGGLE CHAT
========================= */
function toggleChat() {
  chatWidget.classList.toggle("active");

  if (chatWidget.classList.contains("active")) {
    setTimeout(() => {
      showWelcomeMessage();
    }, 300);
  }
}

/* =========================
   ENTER TO SEND
========================= */
document.addEventListener("DOMContentLoaded", () => {
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      send();
    }
  });
});

/* =========================
   HIDE QUICK SUGGESTIONS
========================= */
function hideSuggestions() {
  if (!suggestions) return;

  suggestions.classList.add("hide");

  setTimeout(() => {
    suggestions.style.display = "none";
  }, 300);
}

/* =========================
   QUICK SUGGESTION
========================= */
function useSuggestion(text) {
  if (isLoading) return;

  hideSuggestions();
  input.value = text;
  send();
}

/* =========================
   WELCOME MESSAGE
========================= */
function showWelcomeMessage() {
  if (welcomeShown) return;
  welcomeShown = true;

  chatBox.innerHTML += `
    <div class="bot">
      <div class="bot-avatar">
        <img src="../img/bot.ico" />
      </div>
      <div class="bubble">
        Halo, saya <b>Chat AI SapaPajak</b>. Apa yang bisa saya bantu?
      </div>
    </div>
  `;

  scrollBottom();
}

/* =========================
   SCROLL SMOOTH
========================= */
function scrollBottom() {
  requestAnimationFrame(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

/* =========================
   SET LOADING
========================= */
function setLoading(state) {
  isLoading = state;

  input.disabled = state;
  sendBtn.disabled = state;

  input.style.cursor = state ? "not-allowed" : "text";

  if (!state) input.focus();
}

/* =========================
   TYPE EFFECT (AI NGETIK)
========================= */
function typeText(element, text, speed = 15) {
  let i = 0;
  element.innerHTML = "";

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      scrollBottom();
      setTimeout(typing, speed);
    }
  }

  typing();
}

/* =========================
   SEND MESSAGE
========================= */
async function send() {
  if (isLoading) return;

  const message = input.value.trim();
  if (!message) return;

  setLoading(true);
  hideSuggestions();

  // USER MESSAGE
  chatBox.innerHTML += `
    <div class="user">
      <div class="bubble">${message}</div>
    </div>
  `;

  input.value = "";
  scrollBottom();

  // BOT LOADING
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "bot";
  loadingDiv.id = "loading";

  loadingDiv.innerHTML = `
    <div class="bot-avatar">
      <img src="../img/bot.ico" />
    </div>
    <div class="bubble typing">
      <span></span><span></span><span></span>
    </div>
  `;

  chatBox.appendChild(loadingDiv);
  scrollBottom();

  try {
    // delay kecil biar natural
    await new Promise(resolve => setTimeout(resolve, 300));

    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    document.getElementById("loading")?.remove();

    // BOT RESPONSE WRAPPER
    const wrapper = document.createElement("div");
    wrapper.className = "bot";

    wrapper.innerHTML = `
      <div class="bot-avatar">
        <img src="../img/bot.ico" />
      </div>
    `;

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);

    // 🔥 efek ngetik
    typeText(bubble, data.reply);

  } catch (err) {
    document.getElementById("loading")?.remove();

    chatBox.innerHTML += `
      <div class="bot">
        <div class="bot-avatar">
          <img src="../img/bot.ico" />
        </div>
        <div class="bubble">Server error 😵</div>
      </div>
    `;

    console.error(err);
  }

  setLoading(false);
  scrollBottom();
}