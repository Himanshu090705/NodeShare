import { useState, useEffect } from "react";
import { socket } from "../socket";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

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

  const handleCopyLink = () => {
    const link = `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_CLIENT_PORT}/file/${fileId}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="mt-5 d-flex justify-content-evenly align-items-center pt-5">
      <div className="left w-25">
        <div
          className="card shadow p-4"
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <h4 className="text-center mb-3">Transfer a File</h4>
          <input
            type="file"
            className="form-control mb-3"
            onChange={handleFileUpload}
          />

          {fileId && (
            <div className="alert alert-success mt-3" role="alert">
              <strong>File is ready to send!</strong>
              <div className="mt-2">
                <small>Share this link:</small>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_CLIENT_PORT}/file/${fileId}`}
                    readOnly
                  />
                  <button className="btn btn-primary" onClick={handleCopyLink}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="right w-25 ">
        {fileId ? (
          <>
            <h1>Now sharing your files directly from your device</h1>
            <p className="fs-5 mt-5">
              ⚠️ Please note: Closing this page means you stop sharing! Simply
              keep this page open in the background to keep sharing.
            </p>
          </>
        ) : (
          <>
            <h1>Share files directly from your device to anywhere</h1>
            <p className="fs-5 mt-5">
              Transfer files of any size directly from your device to another
              without uploading or storing anything online, ensuring full
              privacy and security.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Upload;
