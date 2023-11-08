import { useRef, useState } from "react";
import { Media, Image, Icon } from "react-bulma-components";
import { Principal } from "@dfinity/principal";
import { ImageData } from "../../../../utils/types";
import placeholder from "../../../../../assets/user_placeholder.png";
import { getUrlFromArray } from "../../../../utils/util";
import { useActors } from "../../../../hooks/actors";

const EditProviderLogo = ({
  principalID,
  selectedProvider,
  setImageUploadedMsg,
}) => {
  const { modclub } = useActors();
  const inputFile = useRef(null);
  const [logoBeingUploaded, setLogoBeingUploaded] = useState<boolean>(false);
  const [logoPicSrc, setLogoPicSrc] = useState("");
  const handleUploadProviderLogo = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const flToUpload = files[0];
      const reader = new FileReader(); //.readAsArrayBuffer();
      let imageData: ImageData;
      reader.onload = async (evt) => {
        const data =
          typeof evt.target.result == "string" ? evt.target.result : null;
        const buffer = await flToUpload.arrayBuffer();
        imageData = {
          src: data,
          picUInt8Arr: Array.from(new Uint8Array(buffer)),
          type: flToUpload.type,
        };

        try {
          setLogoBeingUploaded(true);
          await modclub.updateProviderLogo(
            Principal.fromText(principalID),
            imageData.picUInt8Arr,
            imageData.type
          );
          const imgSrcFromImgData = getUrlFromArray(
            imageData.picUInt8Arr,
            imageData.type
          );
          const updatedImg = [
            {
              data: imageData.picUInt8Arr,
              imageType: imageData.type,
              src: imgSrcFromImgData,
            },
          ];
          setLogoPicSrc(imgSrcFromImgData);
          selectedProvider.image = updatedImg;
          setImageUploadedMsg({
            success: true,
            value: "Logo uploaded Successfully!",
          });
        } catch (e) {
          setImageUploadedMsg({
            success: false,
            value: "Error in uploading logo. Try again.",
          });
        }
        setLogoBeingUploaded(false);
        setTimeout(() => setImageUploadedMsg(), 3000);
      };
      reader.readAsDataURL(flToUpload);
    }
  };

  return (
    <>
      <input
        style={{ display: "none" }}
        ref={inputFile}
        onChange={(e) => handleUploadProviderLogo(e)}
        accept="image/*"
        type="file"
      />
      <Media justifyContent="center" onClick={() => inputFile.current.click()}>
        <Image
          src={
            logoPicSrc
              ? logoPicSrc
              : selectedProvider.image[0]?.src
              ? selectedProvider.image[0].src
              : placeholder
          }
          alt="profile"
          size={128}
          className="is-clickable is-hover-reduced"
          style={{ overflow: "hidden", opacity: logoBeingUploaded ? 0.2 : 1 }}
        />
        {logoBeingUploaded ? (
          <div
            className="loader is-loading"
            style={{ position: "absolute", top: "50%" }}
          ></div>
        ) : (
          !selectedProvider.image[0]?.src && (
            <div
              style={{
                position: "absolute",
                backgroundColor: "rgba(0, 0, 0, .5)",
                width: 128,
                height: 128,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <Icon color="white">
                <span className="material-icons">backup</span>
              </Icon>
              <p>Click to add Logo</p>
            </div>
          )
        )}
      </Media>
    </>
  );
};

export default EditProviderLogo;
