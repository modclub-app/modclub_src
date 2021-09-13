import { modclub_provider } from "../../declarations/modclub_provider";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with modclub_provider actor, calling the greet method
  const greeting = await modclub_provider.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
