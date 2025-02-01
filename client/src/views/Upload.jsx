import { useState, useEffect } from "react";
import { socket } from "../socket";

function Upload() {
  const [fileId, setFileId] = useState("");
  useEffect(() => {
    socket.connect();

    const onFileUploaded = ({ fileId }) => {
      setFileId(fileId);
    };

    socket.on("fileUploaded", onFileUploaded);

    return () => {
      socket.off("fileUploaded", onFileUploaded);
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      socket.emit("uploadFile", {
        fileName: file.name,
        fileData: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      Upload file:
      <input type="file" onChange={handleFileUpload} />
      {fileId && (
        <p>
          Share this link:
          <a href={`/file/${fileId}`}>
            {import.meta.env.VITE_PROTOCOL}://{import.meta.env.VITE_HOST}:
            {import.meta.env.VITE_CLIENT_PORT}/file/{fileId}
          </a>
        </p>
      )}
    </>
  );
}

export default Upload;
