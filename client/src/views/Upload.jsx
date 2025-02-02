import { useState, useEffect } from "react";
import { socket } from "../socket";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Upload() {
  const [fileId, setFileId] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    socket.connect();

    const onFilesUploaded = ({ fileId }) => {
      setFileId(fileId);
    };

    socket.on("filesUploaded", onFilesUploaded);

    return () => {
      socket.off("filesUploaded", onFilesUploaded);
    };
  }, []);

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    uploadFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    uploadFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const uploadFiles = (filesToUpload) => {
    const fileDataArray = filesToUpload.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (event) => {
          resolve({
            fileName: file.name,
            fileData: event.target.result,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileDataArray).then((fileData) => {
      socket.emit("uploadFiles", { files: fileData });
    });
  };

  const handleCopyLink = () => {
    const link = `${import.meta.env.VITE_CLIENT_URL}/file/${fileId}`;
    navigator.clipboard.writeText(link);
    document.getElementById("copy-button").innerText = "Copied!";
    document.getElementById("copy-button").classList.remove("btn-primary");
    document.getElementById("copy-button").classList.add("btn-success");
  };

  return (
    <div className="mt-5 d-flex justify-content-evenly align-items-center pt-5">
      <div className="left w-25">
        <div
          className="card shadow p-4"
          style={{ maxWidth: "500px", margin: "0 auto" }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h4 className="text-center mb-3">Transfer Files</h4>
          <input
            type="file"
            className="form-control mb-3"
            multiple
            onChange={handleFileUpload}
          />

          {fileId && (
            <div className="alert alert-success mt-3" role="alert">
              <strong>Files are ready to send!</strong>
              <div className="mt-2">
                <small>Share this link:</small>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={`${import.meta.env.VITE_CLIENT_URL}/file/${fileId}`}
                    readOnly
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleCopyLink}
                    id="copy-button"
                  >
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
              Transfer files directly from your device to another without
              uploading or storing anything online, ensuring full privacy and
              security.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Upload;
