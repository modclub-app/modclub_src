import { modclub_provider } from "../../declarations/modclub_provider";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with modclub_provider actor, calling the greet method
  const greeting = await modclub_provider.greet(name);

  document.getElementById("greeting").innerText = greeting;
});

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileId = document.getElementById("fileId").value.toString();
  const fileTitle = document.getElementById("fileTitle").value.toString();
  const file = document.getElementById("fileUpload").value;

  // Interact with modclub_provider actor, calling the greet method
  const greeting = await modclub_provider.greet(name);

  document.getElementById("greeting").innerText = greeting;
});

document.getElementById("contentBtn").addEventListener("click", async () => {
  const contentId = document.getElementById("contentId").value.toString();
  const contentTitle = document.getElementById("contentTitle").value.toString();
  const content = document.getElementById("content").value.toString();

  // Interact with modclub_provider actor, calling the greet method
  const result = await modclub_provider.submitText(
    contentId,
    content,
    contentTitle
  );
  alert("Content submitted");
  document.getElementById("contentId").value = "";
  document.getElementById("contentTitle").value = "";
  document.getElementById("content").value = "";
});

async function imageToUint8Array(image, imageType) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  return toBlob(context.canvas, imageType);
}

const handleFileChange = (e) => {
  const { files } = e.target;
  if (files.length > 0) {
    const f = files[0];
    const reader = new FileReader();
    reader.onload = function (evt) {
      console.log(evt.target.result);
      const metadata = `name: ${f.name}, type: ${f.type}, size: ${f.size}, contents:`;
      console.log(metadata);
      const data =
        typeof evt.target.result == "string" ? evt.target.result : null;
      setPic(data);
      setPicType(f.type);
    };
    reader.readAsDataURL(f);
  }
};

function toBlob(canvas, type, quality = 1) {
  return new Promise((resolve) =>
    canvas.toBlob(
      (canvasBlob) => {
        canvasBlob.arrayBuffer().then((arrayBuffer) => {
          resolve([...new Uint8Array(arrayBuffer)]);
        });
      },
      type,
      quality
    )
  );
}
