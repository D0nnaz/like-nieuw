console.log("JS is connected");
const socket = io();
let liked = localStorage.getItem("liked") === "true";
let page = window.location.pathname.substring(1); 

function updateButtonState() {
  const button = document.getElementById("like-button");
  button.className = liked ? "liked" : "";
  button.textContent = liked ? "Unlike" : "Like";
   button.style.color = liked ? "#7b00e6" : "#7b00e6";
}

document.getElementById("like-button").addEventListener("click", () => {
  liked = !liked;
  updateButtonState();
  localStorage.setItem("liked", liked.toString());

  if (liked) {
    socket.emit("incrementLike", page); 
  } else {
    socket.emit("decrementLike", page); 
  }
});

socket.on("updateLikes", (data) => {
  document.getElementById("like-count").textContent = data.likeCount;
});

socket.emit("getLikeCount", page); 

updateButtonState();


