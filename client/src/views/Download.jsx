import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket"; // Shared socket connection
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Download() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const url = `${import.meta.env.VITE_SERVER_URL}`;

  useEffect(() => {
    socket.connect();

    const fetchFile = async () => {
      try {
        const res = await axios.get(`${url}/file/${id}`);
        setFileName(res.data.fileName);
        setFile(res.data.fileData);
        socket.emit("downloadFile", { fileId: id });
      } catch (err) {
        setError("File not available or uploader is disconnected.");
      }
    };

    fetchFile();

    socket.on("fileNotAvailable", (message) => {
      setError(message);
      setFile(null);
    });

    socket.on("fileNotFound", (message) => {
      setError(message);
      setFile(null);
    });

    return () => {
      socket.off("fileNotAvailable");
      socket.off("fileNotFound");
      socket.disconnect();
    };
  }, [id]);

  const handleDownload = () => {
    if (file) {
      const link = document.createElement("a");
      link.href = file;
      link.download = fileName;
      link.click();
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow p-4 text-center"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <h4 className="mb-3">Download File</h4>

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <div className="alert alert-success">
              <strong>File Found:</strong> {fileName}
            </div>
            <button className="btn btn-primary mt-2" onClick={handleDownload}>
              <i className="bi bi-download"></i> Download File
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Download;
