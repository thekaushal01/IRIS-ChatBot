document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("userInput");
    const imageUpload = document.getElementById("imageUpload");
    const imagePreview = document.getElementById("image-preview");
  
    function addMessage(content, isUser = true) {
      const message = document.createElement("div");
      message.classList.add(isUser ? "user-message" : "bot-message");
      message.innerHTML = content;
      chatBox.appendChild(message);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    window.sendMessage = async function () {
      const imageInput = imageUpload.files[0];
      const textInput = userInput.value.trim();
  
      if (!imageInput && !textInput) {
        alert("Please upload an image or enter a message.");
        return;
      }
  
      const formData = new FormData();
      if (imageInput) formData.append("image", imageInput);
      if (textInput) formData.append("text", textInput);
  
      if (textInput) addMessage(`<strong>You:</strong> ${textInput}`);
  
      // Show uploaded image in static preview
      if (imageInput) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(imageInput);
      }
  
      //userInput.value = "";
  
      try {
        const res = await fetch("http://127.0.0.1:8000/chat", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        addMessage(`<strong>Bot:</strong> ${data.response}`, false);
      } catch (err) {
        console.error(err);
        addMessage(`<strong>Bot:</strong> Something went wrong.`, false);
      }
    };
  
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  });
