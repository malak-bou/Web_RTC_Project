//FINAL FINAL 
const toggleOptions = document.querySelectorAll(".visibility-toggle .option");
const publicSection = document.querySelector(".public");
const privateSection = document.querySelector(".private");
const chatSidebar = document.getElementById("chatSidebar");
const toggleChatBtn = document.getElementById("toggleChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const userName = localStorage.getItem("userName") || "You";


toggleOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    // Remove active class from all and add to clicked
    toggleOptions.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");

    // Show/hide sections based on selection
    if (opt.dataset.visibility === "public") {
      publicSection.style.display = "block";
      privateSection.style.display = "none";
    } else {
      publicSection.style.display = "none";
      privateSection.style.display = "flex"; // keep flex for centered input
    }

    // Optional: update filter variable
    currentVisibility = opt.dataset.visibility;
    applyFilters && applyFilters(); // call if you already have this function
  });
});

// Initialize default view
if (document.querySelector(".visibility-toggle .option.active").dataset.visibility === "public") {
  publicSection.style.display = "block";
  privateSection.style.display = "none";
} else {
  publicSection.style.display = "none";
  privateSection.style.display = "flex";
}


// handl the form 
document.addEventListener("DOMContentLoaded", () => {
  const addRoomBtn = document.querySelector(".add-room-btn");
  const modal = document.getElementById("createRoomModal");
  const cancelBtn = document.getElementById("cancelModal");

  console.log(addRoomBtn, modal, cancelBtn); // debug, doit afficher les éléments

  addRoomBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });
});


// Handle form submit
createRoomForm.addEventListener("submit", async e => {
  e.preventDefault();

  const roomName = document.getElementById("roomName").value.trim();
  const roomType = document.getElementById("roomType").value;
  const roomStatus = document.getElementById("roomStatus").value; // public/private

  const token = localStorage.getItem("token"); // récupère le token du login

  try {
    const apiUrl = window.location.origin;
    const res = await fetch(`${apiUrl}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        name: roomName,
        type: roomType,
        status: roomStatus
      })
    });

    const result = await res.json();

    if (res.ok) {
      if (roomStatus === "private") {
        alert(`Share this room ID with a friend: ${result.roomId}`);
      }
      modal.style.display = "none";
      createRoomForm.reset();

      // Rafraîchir la liste des rooms
      loadRooms();
    } else {
      console.log(result.message);
    }
  } catch (err) {
    console.error(err);
  }
});



const floatingProfile = document.getElementById("floatingProfile");
const profileAvatar = document.getElementById("profileAvatar");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");
const userNameEl = document.getElementById("userName");


async function loadUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const apiUrl = window.location.origin;

    const res = await fetch(`${apiUrl}/profile`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    const data = await res.json();
    const user = data.user;

    // Fill avatar + name
    profileAvatar.textContent = user.name.charAt(0).toUpperCase();
    userNameEl.textContent = user.name;

  } catch (err) {
    console.error("Failed to load profile:", err);
  }
}
loadUserProfile();

// Toggle dropdown
profileAvatar.addEventListener("click", () => {
  profileDropdown.classList.toggle("hidden");
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "../index.html";
});

// Close dropdown if clicking outside
document.addEventListener("click", (e) => {
  if (!floatingProfile.contains(e.target)) {
    profileDropdown.classList.add("hidden");
  }
});


// pour visibility toggle private/public
const socket = io(window.location.origin);

// Track if we're player 1 (first to join room)
let isFirstPlayer = false;
let playerJoined = false;

// Socket.io connection monitoring for debugging
socket.on("connect", () => {
  console.log("✅ Connected to signaling server:", window.location.origin);
});

socket.on("disconnect", () => {
  console.warn("⚠️ Disconnected from signaling server");
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket.io connection error:", error);
});

let currentRoomId = null;
let currentRoomType = null; // Store the current room type
let mySymbol = null; // "X" or "O" - assigned by server


const homeView = document.getElementById("homeView");
const meetingView = document.getElementById("meetingView");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const leaveBtn = document.getElementById("leaveBtn");

let localStream;
let peerConnection;

let micEnabled = true;
let camEnabled = true;

async function getRTCConfig() {
  const res = await fetch("/webrtc/ice");
  const iceServers = await res.json();
  return { iceServers };
}



async function startCall(roomId, roomType = null) {
  currentRoomId = roomId;
  currentRoomType = roomType; // Store room type

  homeView.classList.add("hidden");
  meetingView.classList.remove("hidden");

  chatSidebar.classList.add("hidden");

  chatMessages.innerHTML = "";
  chatInput.value = "";

  // Show/hide game button based on room type
  if (gameBtn) {
    if (currentRoomType === "game") {
      gameBtn.style.display = "block";
    } else {
      gameBtn.style.display = "none";
    }
  }

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localVideo.srcObject = localStream;

  const rtcConfig = await getRTCConfig();
  peerConnection = new RTCPeerConnection(rtcConfig);

  // Connection state monitoring for debugging
  peerConnection.onconnectionstatechange = () => {
    console.log("Connection state:", peerConnection.connectionState);
    if (peerConnection.connectionState === "failed") {
      console.error("WebRTC connection failed - check firewall/NAT settings");
    } else if (peerConnection.connectionState === "connected") {
      console.log("✅ WebRTC connection established!");
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === "failed") {
      console.error("ICE connection failed - TURN server may be needed");
    }
  };

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = event => {
    console.log("✅ Received remote stream");
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      console.log("Sending ICE candidate");
      socket.emit("ice-candidate", {
        roomId: currentRoomId,
        candidate: event.candidate
      });
    } else {
      console.log("ICE gathering complete");
    }
  };

  // Error handling
  peerConnection.onerror = (error) => {
    console.error("PeerConnection error:", error);
  };

  // 🚀 JOIN SIGNALING ROOM
  console.log("Joining room:", currentRoomId);
  if (!playerJoined) {
    isFirstPlayer = true;
    playerJoined = true;
  }
  socket.emit("join-room", { roomId: currentRoomId });
}




/* =====================
   MICROPHONE TOGGLE
===================== */
micBtn?.addEventListener("click", () => {
  if (!localStream) return;
  const audioTrack = localStream.getAudioTracks()[0];
  if (!audioTrack) return;
  
  micEnabled = !micEnabled;
  audioTrack.enabled = micEnabled;

  micBtn.textContent = micEnabled ? "🎤 Mute" : "🎤 Unmute";
  micBtn.classList.toggle("active", !micEnabled);
});

/* =====================
   CAMERA TOGGLE
===================== */
camBtn?.addEventListener("click", () => {
  if (!localStream) return;
  const videoTrack = localStream.getVideoTracks()[0];
  if (!videoTrack) return;
  
  camEnabled = !camEnabled;
  videoTrack.enabled = camEnabled;

  camBtn.textContent = camEnabled ? "📹 Stop Video" : "📹 Start Video";
  camBtn.classList.toggle("active", !camEnabled);
});

/* =====================
   LEAVE MEETING
===================== */
leaveBtn.addEventListener("click", () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  localVideo.srcObject = null;
  remoteVideo.srcObject = null;

  meetingView.classList.add("hidden");
  homeView.classList.remove("hidden");

  micEnabled = true;
  camEnabled = true;

  micBtn.textContent = "Mute";
  camBtn.textContent = "Stop Video";
  micBtn.classList.remove("active");
  camBtn.classList.remove("active");
  socket.disconnect();
  socket.connect();
  currentRoomId = null;
  currentRoomType = null;
  playerJoined = false;
  isFirstPlayer = false;
  mySymbol = null;
  
  // Close chat and games
  if (chatSidebar) chatSidebar.classList.add("hidden");
  if (gameContainer) {
    gameContainer.classList.add("hidden");
    gameContainer.innerHTML = "";
  }
  currentGame = null;
});

/* =====================
   DRAG LOCAL VIDEO
===================== */
const localVid = document.getElementById('localVideo');

let isDragging = false;
let offsetX, offsetY;

localVid.addEventListener('mousedown', e => {
  isDragging = true;
  offsetX = e.clientX - localVid.getBoundingClientRect().left;
  offsetY = e.clientY - localVid.getBoundingClientRect().top;
  localVid.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  localVid.style.cursor = 'grab';
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  // Prevent going out of video area
  const rect = localVid.getBoundingClientRect();
  const parentRect = localVid.parentElement.getBoundingClientRect();
  x = Math.max(0, Math.min(x, parentRect.width - rect.width));
  y = Math.max(0, Math.min(y, parentRect.height - rect.height));

  localVid.style.left = x + 'px';
  localVid.style.top = y + 'px';
});

const roomsList = document.getElementById("roomsList");

async function loadRooms() {
  const token = localStorage.getItem("token");

  try {
    const apiUrl = window.location.origin;
    const res = await fetch(`${apiUrl}/rooms`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const rooms = await res.json();

    roomsList.innerHTML = ""; // vide la liste

    rooms.forEach(room => {
      const div = document.createElement("div");
      div.classList.add("friend-card");
      div.dataset.roomId = room.roomId;
      div.dataset.roomName = room.name.toLowerCase();
      div.dataset.roomType = room.type.toLowerCase();
      div.innerHTML = `
        <div class="top">
          <div class="avatar">${room.name[0].toUpperCase()}</div>
          <div class="info">
            <span class="name">${room.name}</span>
            <p class="subtitle">${room.type}</p>
          </div>
        </div>
        <div class="bottom">
          <span class="tag">${room.type}</span>
        </div>
      `;
      div.addEventListener("click", () => {
        startCall(room.roomId, room.type);
      });
      roomsList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
  }
}

// Charge les rooms au démarrage
loadRooms();

joinRoomBtn.addEventListener("click", async () => {
  const roomId = document.getElementById("roomCodeInput").value.trim();
  

  const token = localStorage.getItem("token");

  try {
    const apiUrl = window.location.origin;
    const res = await fetch(`${apiUrl}/join-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ roomId })
    });

    const result = await res.json();

    if (!res.ok) {
      return console.log(result.message);
    }

    // ✅ stocke la room jointe
    localStorage.setItem("currentRoom", JSON.stringify(result.room));

    // ✅ démarre directement la room avec le type
    startCall(result.room.roomId, result.room.type);

  } catch (err) {
    console.error(err);
  }
});


const filterButtons = document.querySelectorAll(".filter-chip");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // retire active de tous et ajoute au bouton cliqué
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.dataset.type.toLowerCase();

    document.querySelectorAll(".friend-card").forEach(card => {
      if (type === "all" || card.dataset.roomType === type) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
});
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const activeFilter = document.querySelector(".filter-chip.active").dataset.type.toLowerCase();

  document.querySelectorAll(".friend-card").forEach(card => {

    const matchSearch = card.dataset.roomName.includes(query) ||
      card.dataset.roomType.includes(query) ||
      card.dataset.roomId.includes(query);

    const matchFilter = (activeFilter === "all" || card.dataset.roomType === activeFilter);

    card.style.display = (matchSearch && matchFilter) ? "flex" : "none";
  });
});


socket.on("ready", async () => {
  console.log("✅ Ready to create offer - second user joined");
  isFirstPlayer = true; // First to join becomes player 1
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Sending offer");

    socket.emit("offer", {
      roomId: currentRoomId,
      offer
    });
  } catch (error) {
    console.error("Error creating offer:", error);
  }
});

socket.on("offer", async (offer) => {
  console.log("✅ Received offer, creating answer");
  try {
    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("Sending answer");

    socket.emit("answer", {
      roomId: currentRoomId,
      answer
    });
  } catch (error) {
    console.error("Error handling offer:", error);
  }
});

socket.on("answer", async (answer) => {
  await peerConnection.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (candidate) => {
  try {
    if (candidate) {
      await peerConnection.addIceCandidate(candidate);
      console.log("Added ICE candidate");
    }
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
});

socket.on("room-full", () => {
  leaveBtn.click();
});

/* =====================
   CHAT FUNCTIONALITY
===================== */


toggleChatBtn?.addEventListener("click", () => {
  if (chatSidebar.classList.contains("hidden")) {
    chatSidebar.classList.remove("hidden");
  } else {
    chatSidebar.classList.add("hidden");
  }
});

closeChatBtn?.addEventListener("click", () => {
  chatSidebar.classList.add("hidden");
});

function addChatMessage(message, sender, isOwn = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${isOwn ? "own" : "other"}`;
  messageDiv.innerHTML = `
    <div class="sender">${sender}</div>
    <div>${message}</div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn?.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message && currentRoomId) {
    socket.emit("chat-message", {
      roomId: currentRoomId,
      message,
      sender: userName
    });
    addChatMessage(message, userName, true);
    chatInput.value = "";
  }
});

chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendChatBtn.click();
  }
});

socket.on("chat-message", ({ message, sender }) => {
  addChatMessage(message, sender, false);
});

/* =====================
   SCREEN SHARING
===================== */
const screenShareBtn = document.getElementById("screenShareBtn");
let screenShareStream = null;
let isScreenSharing = false;

screenShareBtn?.addEventListener("click", async () => {
  try {
    if (!isScreenSharing) {
      // Start screen sharing
      screenShareStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in peer connection
      const videoTrack = screenShareStream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === "video"
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Show screen share in local video
      localVideo.srcObject = screenShareStream;
      isScreenSharing = true;
      screenShareBtn.textContent = "🖥️ Stop Sharing";
      screenShareBtn.classList.add("active");

      // Handle when user stops sharing via browser UI
      videoTrack.onended = () => {
        stopScreenShare();
      };
    } else {
      stopScreenShare();
    }
  } catch (error) {
    console.error("Error sharing screen:", error);
  }
});

function stopScreenShare() {
  if (screenShareStream) {
    screenShareStream.getTracks().forEach(track => track.stop());
    screenShareStream = null;
  }

  // Get back camera stream
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === "video"
      );
      
      if (sender) {
        sender.replaceTrack(videoTrack);
      }

      localStream = stream;
      localVideo.srcObject = stream;
      isScreenSharing = false;
      screenShareBtn.textContent = "🖥️ Share Screen";
      screenShareBtn.classList.remove("active");
    })
    .catch(error => {
      console.error("Error getting camera back:", error);
    });
}

/* =====================
   GAMES FUNCTIONALITY
===================== */
const gameBtn = document.getElementById("gameBtn");
const gameModal = document.getElementById("gameModal");
const cancelGameModal = document.getElementById("cancelGameModal");
const gameContainer = document.getElementById("gameContainer");
let currentGame = null;
let isPlayer1 = false;
let gameState = {};

socket.on("player-assign", ({ symbol, isPlayer1: assignedIsPlayer1 }) => {
  mySymbol = symbol; // "X" or "O"
  isPlayer1 = assignedIsPlayer1; // Update isPlayer1 based on server assignment
  console.log(`You are assigned as ${symbol} (Player ${isPlayer1 ? 1 : 2})`);
});


gameBtn?.addEventListener("click", () => {
  // Only allow games in game-type rooms
  if (currentRoomType !== "game") {
    alert("Games are only available in Game-type rooms!");
    return;
  }
  gameModal.style.display = "flex";
});

cancelGameModal?.addEventListener("click", () => {
  gameModal.style.display = "none";
});

// Game selection
document.querySelectorAll(".game-option").forEach(option => {
  option.addEventListener("click", () => {
    // Double check room type
    if (currentRoomType !== "game") {
      alert("Games are only available in Game-type rooms!");
      gameModal.style.display = "none";
      return;
    }
    
    const gameType = option.dataset.game;
    if (currentRoomId) {
      socket.emit("game-select", { roomId: currentRoomId, gameType });
      startGame(gameType);
      gameModal.style.display = "none";
    }
  });
});

socket.on("game-select", ({ gameType }) => {
  startGame(gameType);
  gameModal.style.display = "none";
});

function startGame(gameType) {
  // Player role is already assigned by server via "player-assign" event
  // mySymbol and isPlayer1 are set when joining the room

  gameContainer.classList.remove("hidden");
  gameContainer.innerHTML = "";



  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.classList.add("close-game-btn");
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "10px";
  closeBtn.style.fontSize = "24px";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", () => {
    gameContainer.classList.add("hidden");
    gameContainer.innerHTML = "";
    currentGame = null;
  });
  gameContainer.appendChild(closeBtn);
  switch (gameType) {
    case "tictactoe":
      initTicTacToe();
      break;
    case "snake":
      initSnake();
      break;
    case "pong":
      initPong();
      break;
  }
  currentGame = gameType;
}

function initTicTacToe() {
  // Reset game state
  gameState = {
    board: Array(9).fill(""),
    currentPlayer: "X", // X always starts
    gameOver: false,
    winner: null
  };

  const gameDiv = document.createElement("div");
  gameDiv.style.display = "flex";
  gameDiv.style.flexDirection = "column";
  gameDiv.style.alignItems = "center";
  gameDiv.style.gap = "20px";
  
  const gameInfo = document.createElement("div");
  gameInfo.className = "game-info";
  
  // Update status based on current player and my symbol
  const statusText = mySymbol 
    ? `You are ${mySymbol} - ${gameState.currentPlayer === mySymbol ? "Your turn!" : "Waiting for opponent..."}`
    : "Waiting for player assignment...";
  
  gameInfo.innerHTML = `
    <h2>Tic-Tac-Toe</h2>
    <div class="game-status" id="gameStatus">${statusText}</div>
  `;

  const board = document.createElement("div");
  board.className = "tic-tac-toe";
  board.style.display = "grid";
  board.style.gridTemplateColumns = "repeat(3, 100px)";
  board.style.gridTemplateRows = "repeat(3, 100px)";
  board.style.gap = "4px";
  board.style.background = "var(--bg-control)";
  board.style.padding = "4px";
  board.style.borderRadius = "8px";
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.className = "ttt-cell";
    cell.dataset.index = i;
    cell.style.background = "var(--bg-card)";
    cell.style.border = "none";
    cell.style.fontSize = "48px";
    cell.style.cursor = "pointer";
    cell.style.display = "flex";
    cell.style.alignItems = "center";
    cell.style.justifyContent = "center";
    cell.style.borderRadius = "4px";
    cell.style.color = "var(--text-main)";
    cell.addEventListener("click", () => handleTTTMove(i));
    board.appendChild(cell);
  }

  gameDiv.appendChild(gameInfo);
  gameDiv.appendChild(board);
  gameContainer.appendChild(gameDiv);
}

function handleTTTMove(index) {
  if (gameState.gameOver || gameState.board[index] !== "") {
    return;
  }

  // Check if player is assigned
  if (!mySymbol) {
    alert("Waiting for player assignment...");
    return;
  }

  // Check if it's this player's turn
  if (gameState.currentPlayer !== mySymbol) {
    alert(`It's not your turn! Current player: ${gameState.currentPlayer}`);
    return;
  }

  // Make the move
  gameState.board[index] = gameState.currentPlayer;
  updateTTTBoard();

  // Check for winner
  const winner = checkTTTWinner();
  if (winner) {
    gameState.gameOver = true;
    gameState.winner = winner;
    const statusEl = document.getElementById("gameStatus");
    if (statusEl) {
      if (winner === "draw") {
        statusEl.textContent = "It's a draw!";
      } else if (winner === mySymbol) {
        statusEl.textContent = "🎉 You win!";
      } else {
        statusEl.textContent = `${winner} wins!`;
      }
    }
  } else {
    // Switch turns
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    const statusEl = document.getElementById("gameStatus");
    if (statusEl) {
      statusEl.textContent = gameState.currentPlayer === mySymbol 
        ? `Your turn! (You are ${mySymbol})` 
        : `Waiting for ${gameState.currentPlayer}... (You are ${mySymbol})`;
    }
  }

  // Send move to opponent
  socket.emit("game-move", {
    roomId: currentRoomId,
    gameType: "tictactoe",
    moveData: { 
      board: [...gameState.board], 
      currentPlayer: gameState.currentPlayer, 
      gameOver: gameState.gameOver,
      winner: gameState.winner || null
    }
  });
}

function updateTTTBoard() {
  const cells = document.querySelectorAll(".ttt-cell");
  cells.forEach((cell, index) => {
    cell.textContent = gameState.board[index];
    cell.disabled = gameState.board[index] !== "" || gameState.gameOver;
  });
}

function checkTTTWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (gameState.board[a] && gameState.board[a] === gameState.board[b] && 
        gameState.board[a] === gameState.board[c]) {
      return gameState.board[a];
    }
  }

  if (gameState.board.every(cell => cell !== "")) {
    return "draw";
  }

  return null;
}

socket.on("game-move", ({ gameType, moveData }) => {
  if (gameType === "tictactoe") {
    // Update game state from opponent's move
    gameState.board = [...moveData.board];
    gameState.currentPlayer = moveData.currentPlayer;
    gameState.gameOver = moveData.gameOver || false;
    gameState.winner = moveData.winner || null;
    
    // Update the board display
    updateTTTBoard();
    
    // Update status message
    const statusEl = document.getElementById("gameStatus");
    if (statusEl && mySymbol) {
      if (gameState.gameOver) {
        if (gameState.winner === "draw") {
          statusEl.textContent = "It's a draw!";
        } else if (gameState.winner === mySymbol) {
          statusEl.textContent = "🎉 You win!";
        } else {
          statusEl.textContent = `${gameState.winner} wins!`;
        }
      } else {
        // It's either my turn or opponent's turn
        statusEl.textContent = gameState.currentPlayer === mySymbol 
          ? `Your turn! (You are ${mySymbol})` 
          : `Waiting for ${gameState.currentPlayer}... (You are ${mySymbol})`;
      }
    }
  }
});

function initSnake() {
  gameContainer.innerHTML = `
    <div class="game-info">
      <h2>Snake Game</h2>
      <div class="game-status">Use arrow keys to play</div>
    </div>
    <canvas class="snake-canvas" width="400" height="400" id="snakeCanvas"></canvas>
    <div class="snake-controls">
      <button class="snake-btn" onclick="alert('Use arrow keys to control')">How to Play</button>
    </div>
  `;
  // Simple snake game implementation would go here
  console.log("Snake game - Coming soon! Use arrow keys when implemented.");
}

function initPong() {
  gameContainer.innerHTML = `
    <div class="game-info">
      <h2>Pong</h2>
      <div class="game-status">Use W/S keys to move your paddle</div>
    </div>
    <canvas class="pong-canvas" width="600" height="400" id="pongCanvas"></canvas>
  `;
  // Simple pong game implementation would go here
  console.log("Pong game - Coming soon! Use W/S keys when implemented.");
}
