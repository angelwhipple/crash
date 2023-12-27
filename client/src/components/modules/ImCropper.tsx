import React, { useState, useEffect } from "react";
import { socket } from "../../client-socket";
import { get, post } from "../../utilities";
import { RouteComponentProps, useNavigate } from "@reach/router";
import "./ImCropper.css";
import {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  ReactCrop,
  type Crop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import helpers from "./helpers";

type Props = RouteComponentProps & {
  inputImg: File;
  setCrop: any;
  setFile: any;
};

const MIN_DIMENSION = 200;
const ASPECT_RATIO = 1;

const ImCropper = (props: Props) => {
  const [src, setSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();

  const cropImage = async () => {
    const image = document.getElementById("cropper-photo") as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = MIN_DIMENSION;
    canvas.height = MIN_DIMENSION;
    helpers.drawCropCanvas(image, canvas, convertToPixelCrop(crop!, image.width, image.height));

    const dataUrl = canvas.toDataURL("image/jpeg");
    props.setFile(await helpers.fileFromURL(dataUrl, props.inputImg!.name));
    props.setCrop({
      show: false,
      input: props.inputImg,
      previewSrc: dataUrl,
    });
  };

  useEffect(() => {
    if (props.inputImg) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) setSrc(event.target.result as string);
      };
      reader.readAsDataURL(props.inputImg);

      const elem = document.getElementById("cropper-photo") as HTMLImageElement;
      elem.onload = (event) => {
        if (elem.naturalWidth < MIN_DIMENSION || elem.naturalHeight < MIN_DIMENSION) {
          console.log(`Image must be atleast ${MIN_DIMENSION} x ${MIN_DIMENSION} pixels`); // error handle
          setSrc("");
        } else {
          const cropObj = makeAspectCrop(
            { unit: "%", width: 25 },
            ASPECT_RATIO,
            elem.width,
            elem.height
          );
          const centeredCrop = centerCrop(cropObj, elem.width, elem.height);
          setCrop(centeredCrop);
        }
      };
    }
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h4>Crop image</h4>
          <ReactCrop
            crop={crop}
            circularCrop
            keepSelection
            aspect={ASPECT_RATIO}
            minWidth={MIN_DIMENSION}
            onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
          >
            <img id="cropper-photo" src={src} alt="Croppable Photo" className="cropper-photo"></img>
          </ReactCrop>
          <div className="action-container">
            <button
              className="default-button u-pointer"
              onClick={() => props.setCrop({ show: false })}
            >
              back
            </button>
            <button className="default-button u-pointer" onClick={async () => await cropImage()}>
              done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImCropper;
