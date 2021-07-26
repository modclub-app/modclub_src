import { modclub } from "../../declarations/modclub";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with modclub actor, calling the greet method
  const greeting = await modclub.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
