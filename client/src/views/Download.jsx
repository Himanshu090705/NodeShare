import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket"; // Shared socket connection
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Download() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const url = `${import.meta.env.VITE_SERVER_URL}`;

  useEffect(() => {
    socket.connect();

    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${url}/file/${id}`);
        setFiles(res.data.files);
        socket.emit("downloadFile", { fileId: id });
      } catch (err) {
        setError("Files not available or uploader is disconnected.");
      }
    };

    fetchFiles();

    socket.on("fileNotAvailable", (message) => {
      setError(message);
      setFiles([]);
    });

    socket.on("fileNotFound", (message) => {
      setError(message);
      setFiles([]);
    });

    return () => {
      socket.off("fileNotAvailable");
      socket.off("fileNotFound");
      socket.disconnect();
    };
  }, [id]);

  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.fileData;
    link.download = file.fileName;
    link.click();
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow p-4 text-center">
            <h4 className="mb-3">Download Files</h4>

            {error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              files.map((file, index) => (
                <div key={index} className="alert alert-success">
                  <strong>File Found:</strong> {file.fileName}
                  <div>
                    <button
                      className="btn btn-primary mt-2 w-100"
                      onClick={() => handleDownload(file)}
                    >
                      <i className="bi bi-download"></i> Download File
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;
