import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import useFileStore from "../store/fileStore";
import "./FileDrop.css";

function FileDrop() {
  const setFileData = useFileStore((state) => state.setFileData);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        setFileData(file);
      });
    },
    [setFileData],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div {...getRootProps()} className="drop-container">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag n drop some files here, or click to select files</p>
      )}
    </div>
  );
}
export default FileDrop;
