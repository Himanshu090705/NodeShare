import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket"; // Shared socket connection
import axios from "axios";

function Download() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const url = `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_HOST}:${import.meta.env.VITE_SERVER_PORT}`;

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
    <>
      <h2>Download File</h2>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <p>File Name: {fileName}</p>
          <button onClick={handleDownload}>Download</button>
        </>
      )}
    </>
  );
}

export default Download;
