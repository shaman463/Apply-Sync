import { useEffect, useState } from "react";
import "../styles/Resume.css";

const Resume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setStatus("idle");
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [selectedFile]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatus("missing");
      return;
    }

    setStatus("uploaded");
  };

  const isPdf = Boolean(
    selectedFile?.type === "application/pdf" ||
      selectedFile?.name?.toLowerCase().endsWith(".pdf")
  );

  return (
    <div className="resume-page">
      <div className="resume-card">
        <h1 className="resume-title">Upload your resume</h1>
        <p className="resume-subtitle">
          Choose a PDF or DOC/DOCX file to continue.
        </p>
        <form className="resume-form" onSubmit={handleSubmit}>
          <label className="resume-input">
            <span className="resume-input-label">Resume file</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
          {selectedFile && (
            <p className="resume-file">Selected: {selectedFile.name}</p>
          )}
          {status === "missing" && (
            <p className="resume-warning">Please select a resume file first.</p>
          )}
          {status === "uploaded" && (
            <p className="resume-success">Resume added successfully.</p>
          )}
          {status === "uploaded" && previewUrl && (
            <div className="resume-preview">
              {isPdf ? (
                <iframe
                  title="Resume preview"
                  src={previewUrl}
                  className="resume-preview-frame"
                />
              ) : (
                <div className="resume-preview-info">
                  <p>Preview is available for PDF files only.</p>
                  <div className="resume-preview-actions">
                    <a href={previewUrl} target="_blank" rel="noreferrer">
                      Open file
                    </a>
                    <a href={previewUrl} download={selectedFile?.name || "resume"}>
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="resume-submit">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default Resume;
