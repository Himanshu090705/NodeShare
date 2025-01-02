import { useEffect } from "react";
import useFileStore from "./store/fileStore";
import FileDrop from "./views/FileDrop";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const fileData = useFileStore((state) => state.fileData);

  useEffect(() => {
    // Listen for messages from the server
    socket.on("receive", (data) => {
      console.log(data);
    });

    return () => socket.off("receive"); // Cleanup listener
  }, []);
  const handleSendFiles = () => {
    try {
      const files = fileData.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        content: file,
      }));
      socket.emit("send", files);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <FileDrop />
      <div>
        You uploaded files
        {fileData.map((file, idx) => (
          <div key={idx}>File Uploaded: {file.name}</div>
        ))}
      </div>

      <button onClick={handleSendFiles}>Send Files</button>
    </>
  );
}

export default App;
