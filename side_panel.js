const translateBtn = document.getElementById("translateBtn");
const textInput = document.getElementById("textInput");
const resultEl = document.getElementById("result");

translateBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();

  if (!text) {
    resultEl.innerText = "Please enter text to translate.";
    return;
  }

  resultEl.innerText = "Translating...";

  try {
    const response = await fetch("http://localhost:3000/api/v1/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const msg = `API error (${response.status})`;
      resultEl.innerText = msg;
      console.error(msg, await response.text());
      return;
    }

    const data = await response.json();
    resultEl.innerHTML = `<b>Translation:</b><br>${data.translated || "No translation returned."}`;
  } catch (error) {
    resultEl.innerText = "Failed to connect to the API.";
    console.error("Request error:", error);
  }
});
