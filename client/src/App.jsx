import useFileStore from "./store/fileStore";
import FileDrop from "./views/FileDrop";

function App() {
  const fileData = useFileStore((state) => state.fileData);
  return (
    <>
      <FileDrop />
      <div>
        You uploaded files
        {fileData.map((file, idx) => (
          <div key={idx}>File Uploaded: {file.name}</div>
        ))}
      </div>
    </>
  );
}

export default App;
