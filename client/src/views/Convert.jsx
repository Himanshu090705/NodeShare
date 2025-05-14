import { useState } from "react";
import axios from "axios";
import { supabase } from "../../../server/db/connect";
import { SERVER_URL } from "../../../config";

const Convert = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const url1 = `${SERVER_URL}/api`;

  const formatOptions = {
    "image/jpeg": ["png", "heic", "webp", "pdf", "svg"],
    "image/png": ["jpeg", "heic", "webp", "pdf", "svg"],
    "image/heic": ["jpeg", "png", "webp", "svg"],
    "image/webp": ["png", "jpeg", "pdf", "svg", "heic"],
    "image/svg+xml": ["webp", "png"],
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const mimeType = selectedFile?.type;
    if (formatOptions[mimeType]) {
      setAvailableFormats(formatOptions[mimeType]);
      setFormat(formatOptions[mimeType][0]);
      setErrorMessage("");
    } else {
      setAvailableFormats([]);
      setFormat("");
      setErrorMessage("Unsupported file type. Please upload a valid file.");
    }
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = await supabase.auth.getUser();
    const id = user.data.user.id;
    const subscriptions = await supabase
      .from("subscriptions")
      .select()
      .eq("userId", id);
    const data = subscriptions.data[0];

    if (data.tokens != "Unlimited") {
      let t = Number.parseInt(data.tokens, 10);
      if (t === 0) {
        window.alert("Your Limit has been exceeded");
        return;
      }
    }
    if (!file) return alert("Please upload a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post(`${url1}/convert`, formData, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `converted.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setErrorMessage("Conversion failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="convert-container convert-body">
      <header className="convert-header">
        <h1>File Converter</h1>
        <p>Convert your files to various formats quickly and easily!</p>
      </header>

      <main className="convert-main">
        <section className="convert-section">
          <h2>Convert Your Files</h2>
          <p className="convert-para">
            Supported formats include images, audio, video, and more.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              onChange={handleFileChange}
              className="convert-input-file"
            />
            {errorMessage && (
              <p className="convert-error-message">{errorMessage}</p>
            )}
            {availableFormats.length > 0 && (
              <select
                value={format}
                onChange={handleFormatChange}
                className="convert-select"
              >
                <option value="" disabled>
                  Select a format
                </option>
                {availableFormats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className={`convert-button ${
                loading || !format ? "convert-disabled" : ""
              }`}
              disabled={loading || !format}
            >
              {loading ? "Converting..." : "Convert"}
            </button>
          </form>
        </section>

        <section className="convert-supported-section">
          <h2>Supported File Types</h2>
          <ul>
            <li>Images: JPEG, PNG, HEIC, WEBP, SVG</li>
            <li>Documents: PDF, DOCX, TXT</li>
            <li>Audio: MP3, WAV</li>
            <li>Video: MP4</li>
            <li>Data: JSON, XML</li>
          </ul>
          <p>More formats coming soon!</p>
        </section>
      </main>
    </div>
  );
};

export default Convert;
