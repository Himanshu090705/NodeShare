import { useState, useEffect } from "react";
import { socket } from "../socket";
import { QRCode } from "react-qr-code";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { SERVER_URL } from "../../../config";
import { supabase } from "../../../server/db/connect";
import axios from "axios";

function Upload() {
  const [fileId, setFileId] = useState("");
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("");
  const [availableFormats, setAvailableFormats] = useState([]);
  const url = `${SERVER_URL}/api`;

  const formatOptions = {
    "image/jpeg": ["png", "heic", "webp", "pdf", "svg"],
    "image/png": ["jpeg", "heic", "webp", "pdf", "svg"],
    "image/heic": ["jpeg", "png", "webp", "svg"],
    "image/webp": ["png", "jpeg", "pdf", "svg", "heic"],
    "image/svg+xml": ["webp", "jpeg", "png", "heic"],
    "application/octet-stream": ["jpeg", "png", "webp", "pdf", "svg"],
    "video/mp4": ["mp3", "wav"],
    "audio/mpeg": ["wav"],
    "audio/wav": ["mp3"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      "txt",
      "pdf",
    ],
    "application/msword": ["pdf"],
    "text/plain": ["pdf"],
    "application/pdf": ["txt", "docx", "jpg"],
    "application/xml": ["json"],
    "text/xml": ["json"],
    "application/json": ["xml"],
  };

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
    const mimeType = selectedFiles[0].type;
    setFiles(selectedFiles);
    uploadFiles(selectedFiles);
    setAvailableFormats(formatOptions[mimeType]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const mimeType = droppedFiles[0].type;
    setFiles(droppedFiles);
    uploadFiles(droppedFiles);
    setAvailableFormats(formatOptions[mimeType]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFormatChange = async (e) => {
    const selectedFormat = e.target.value;
    setFormat(selectedFormat);

    if (!files[0]) {
      console.error("No file selected");
      return;
    }

    if (!availableFormats.includes(selectedFormat)) {
      console.error("Invalid format selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("format", selectedFormat);

    try {
      const response = await axios.post(`${url}/convert`, formData, {
        responseType: "blob",
      });
      if (response) {
        const blob = response.data; // this is your blob
        const contentDisposition = response.headers["content-disposition"];
        let filename = "downloaded-file"; // default filename

        // Try to extract filename from Content-Disposition header
        const filenameMatch =
          contentDisposition && contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }

        // Create File object
        const file = new File([blob], filename, { type: blob.type });
        const fileArray = Array.from(file);
        fileArray.push(file);
        await uploadFiles(fileArray);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFiles = async (filesToUpload) => {

    const user = await supabase.auth.getUser();
    const id = user.data.user.id;
    const subscriptions = await supabase
      .from("subscriptions")
      .select()
      .eq("userId", id);
    const data = subscriptions.data[0];

    if(data.tokens != "Unlimited") {
      let t = Number.parseInt(data.tokens, 10);
      if(t === 0) {
        window.alert("Your Limit has been exceeded")
        return;
      }
    }

    const fileDataArray = filesToUpload.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (event) => {
          resolve({
            fileName: file.name,
            fileData: event.target.result,
          });
        };
        reader.readAsDataURL(file); // Ensure this is called
      });
    });

    Promise.all(fileDataArray).then((fileData) => {
      socket.emit("uploadFiles", { files: fileData });
    });

    if (data.tokens !== "Unlimited") {
      let tokens = Number.parseInt(data.tokens, 10); // Convert tokens to a number
      tokens = tokens - filesToUpload.length;
      const response = await supabase
        .from("subscriptions")
        .update({ tokens: tokens.toString() })
        .eq("userId", id);
    }
  };

  const handleCopyLink = () => {
    const link = `${SERVER_URL}/file/${fileId}`;
    navigator.clipboard.writeText(link);
    document.getElementById("copy-button").innerText = "Copied!";
    document.getElementById("copy-button").classList.remove("btn-primary");
    document.getElementById("copy-button").classList.add("btn-success");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-between">
        <div className="upload-box col-12 col-md-5">
          <div
            className="card shadow p-4"
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
                      value={`${SERVER_URL}/file/${fileId}`}
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
                  {availableFormats.length > 0 && (
                    <select
                      value={format}
                      className="form-select mt-2"
                      onChange={handleFormatChange}
                    >
                      <option value="default">Share as</option>
                      {availableFormats.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {fmt.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="mt-2 border p-1">
                    <center>
                      <small>Or Scan this QR Code</small>
                      <div>
                        <QRCode
                          size={256}
                          style={{
                            height: "8rem",
                            width: "8rem",
                          }}
                          value={`${SERVER_URL}/file/${fileId}`}
                          viewBox={`0 0 256 256`}
                        />
                      </div>
                    </center>
                  </div>
                </div>
              </div>
            )}
            <center>
              <b>You can drag and drop multiple files also</b>
            </center>
          </div>
        </div>
        <div className="upload-box col-12 col-md-5">
          {fileId ? (
            <>
              <h1>Now sharing your files directly from your device</h1>
              <p className="fs-5 mt-5 text-secondary">
                ⚠️ Please note: Closing this page means you stop sharing! Simply
                keep this page open in the background to keep sharing.
              </p>
            </>
          ) : (
            <>
              <h1>Share files directly from your device to anywhere</h1>
              <p className="fs-5 mt-5 text-secondary">
                Transfer files directly from your device to another without
                uploading or storing anything online, ensuring full privacy and
                security.
              </p>
            </>
          )}

          <div className="border rounded bg-white mt-5 p-0">
            <table className="table-box table mt-1 mb-1">
              <tbody className="text-white bg-black ">
                <tr>
                  <td>
                    <h5>
                      <i className="fa-solid fa-infinity"></i> No file size
                      limit
                    </h5>
                  </td>
                  <td className="">
                    <h5>
                      <i className="fa-solid fa-bolt"></i> Blazingly fast
                    </h5>
                  </td>
                </tr>
                <tr className="mt-5">
                  <td className="">
                    <h5>
                      <i className="fa-solid fa-right-left"></i> Peer-to-peer
                    </h5>
                  </td>
                  <td className="">
                    <h5>
                      <i className="fa-solid fa-file-invoice"></i>
                      {"  "}
                      End-to-end encrypted
                    </h5>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
