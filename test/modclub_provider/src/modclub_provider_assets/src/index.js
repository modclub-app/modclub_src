import { modclub_provider } from "../../declarations/modclub_provider";

var imageData, imageType;
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileId = document.getElementById("fileId").value.toString();
  const fileTitle = document.getElementById("fileTitle").value.toString();
  await modclub_provider.submitImage(
    fileId,
    imageData.data,
    imageType,
    fileTitle
  );
});

document.getElementById("registerBtn").addEventListener("click", async () => {
  const appName = document.getElementById("appName").value.toString();
  const appDesc = document.getElementById("appDesc").value.toString();
  await modclub_provider.register(appName, appDesc);
});

document.getElementById("ruleBtn").addEventListener("click", async () => {
  const rule = document.getElementById("rule").value.toString();
  await modclub_provider.addRule(rule);
});

document.getElementById("settingsBtn").addEventListener("click", async () => {
  const minVotes = Number(document.getElementById("minVotes").value.toString());
  const minStaked = Number(
    document.getElementById("minStaked").value.toString()
  );
  await modclub_provider.updateSettings(minVotes, minStaked);
});

document.getElementById("contentBtn").addEventListener("click", async () => {
  const contentId = document.getElementById("contentId").value.toString();
  const contentTitle = document.getElementById("contentTitle").value.toString();
  const content = document.getElementById("content").value.toString();

  // Interact with modclub_provider actor, calling the greet method
  const result = await modclub_provider.submitText(contentId, content, [
    contentTitle,
  ]);
  alert("Content submitted");
  document.getElementById("contentId").value = "";
  document.getElementById("contentTitle").value = "";
  document.getElementById("content").value = "";
});

document
  .getElementById("fileUpload")
  .addEventListener("change", handleFileChange);

async function imageToUint8Array(image, imageType) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  return toBlob(context.canvas, imageType);
}

async function convertImage(src, srcImgType) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = src;
    image.onload = async () => {
      resolve(imageToUint8Array(image, srcImgType));
    };
  });
}

function handleFileChange(e) {
  const { files } = e.target;
  if (files.length > 0) {
    const f = files[0];
    const reader = new FileReader();
    reader.onload = async function (evt) {
      console.log(evt.target.result);
      const metadata = `name: ${f.name}, type: ${f.type}, size: ${f.size}, contents:`;
      console.log(metadata);
      const data =
        typeof evt.target.result == "string" ? evt.target.result : null;

      const imgResult = data
        ? { data: await convertImage(data), imageType: f.type }
        : undefined;

      console.log({ imgResult });
      imageData = imgResult;
      imageType = f.type;
    };
    reader.readAsDataURL(f);
  }
}

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
