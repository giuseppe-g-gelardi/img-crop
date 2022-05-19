import { useEffect, useState } from 'react'
import type { ActionFunction, UploadHandler } from "@remix-run/node";
import {
  json,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { uploadImage } from "~/utils/utils.server";

import Cropper from 'react-easy-crop'
import getCroppedImg from '~/utils/getCroppedImg';

type ActionData = {
  errorMsg?: string;
  imgSrc?: string;
  imgDesc?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler: UploadHandler = composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "img") {
        return undefined;
      }
      const uploadedImage: any = await uploadImage(data)
      return uploadedImage.secure_url;
    },
    createMemoryUploadHandler()
  );

  const formData = await parseMultipartFormData(request, uploadHandler);
  const imgSrc = formData.get("img");

  async function logger(arg2: any, arg3: any): Promise<any> {
    console.log('imgSrc ______', arg2)
    console.log('imgSrc STRING', arg3)
  }

  if (!imgSrc) {
    return json({
      error: "something wrong",
    });
  }
  return json({
    imgSrc,
  },
    await logger(imgSrc, imgSrc.toString())
  );
};

export default function Index() {
  const data = useActionData<ActionData>();
  const [crop, setCrop] = useState({ x: 2, y: 2 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>()
  const [croppedImage, setCroppedImage] = useState<any>()
  const [imageToUpload, setImageToUpload] = useState<any>()

  const [file, setFile] = useState<any>()
  const [fileToCrop, setFileToCrop] = useState<any>()
  const [previewImage, setPreviewImage] = useState<any>()

  useEffect(() => {
    // console.log('file: ', file)
    
    if (!croppedImage) return;
    
    setPreviewImage(URL.createObjectURL(croppedImage))
    var newfile = new File([croppedImage], 'picture', { type: 'image/jpg', lastModified: Date.now() });
    console.log('newfile: ', newfile)

  }, [croppedImage])

  const onSelectFile = async (e: any) => {
    if (!e.target.files || e.target.files === 0) {
      setFile(undefined)
      return
    }
    setFile(e.target.files[0])
    setFileToCrop(URL.createObjectURL(e.target.files[0]))
  }

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const onCrop = async () => {
    setCroppedImage(await getCroppedImg(fileToCrop, croppedAreaPixels))
    setFile(null)
  };

  const cancelImage = () => setFile(null)

  return (
    <div className="text-center mt-56">
      <label htmlFor="img-field"></label>
      <input id="img-field" type="file" name="img" accept="image/*" onChange={onSelectFile} />
      <Form method="post" encType="multipart/form-data">
        <input
          type='hidden'
          value={''}
        />
        <button className="bg-gray-400 rounded-xl p-1" type="submit">upload to cloudinary</button>
      </Form>

      {file && (
        <>
          <div className="fixed bg-black top-0 left-0 right-0 bottom-0 z-10 opacity-50"></div>
          <div className="fixed top-0 left-0 right-0 bottom-20 z-20">
            <Cropper
              image={fileToCrop}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="fixed bottom-0 w-full h-[100px] z-20 mb-10">
            <div className="place-content-center">
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onInput={(e: any) => {
                  setZoom(e.target.value);
                }}
                className="w-1/2"
              ></input>
            </div>
            <div className="place-content-center mt-12 mb-10">
              <button
                type='button'
                className="bg-rose-400 m-5"
                onClick={() => cancelImage()}
              >
                clear image
              </button>
              <button
                type='button'
                className="bg-purple-800 m-5"
                onClick={onCrop}
              >
                Crop
              </button>
            </div>
          </div>
        </>
      )}

      {croppedAreaPixels && !data?.imgSrc ? (
        <>
          <img
            src={previewImage}
            alt=''
          />
          <button
            type="submit"
            className="bg-slate-400 m-5"
            name='_action'
            value='pfp'
          >
            upload banner
          </button>
        </>
      ) : null}

      {data?.errorMsg && <h2>{data.errorMsg}</h2>}
      {data?.imgSrc && (
        <>
          <h2>uploaded image</h2>
          <img src={data.imgSrc} alt={data.imgDesc || "Upload result"} />
        </>
      )}
    </div>
  );
}



// {/* <label htmlFor="img-desc">Image description</label>
// <input id="img-desc" type="text" name="desc" /> */}
// const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//   setCroppedArea(croppedAreaPixels);
// }, []);

// const showCroppedImage = useCallback(async () => {
//   try {
//     const croppedImage = await getCroppedImg(file, croppedArea, 0);
//     return croppedImage;
//   } catch (error) {
//     console.error(error);
//   }
// }, [croppedArea, file]);
