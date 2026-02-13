import { useEffect, useState } from "react";
import "../styles/Resume.css";

const Resume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setStatus("idle");
    setScoreData(null);
    setErrorMessage("");
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatus("missing");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch(`${apiBaseUrl}/api/resume/score`, {
        method: "POST",
        body: formData
      });

      const responseText = await response.text();
      let payload = null;
      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch (error) {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || responseText || "Upload failed.");
      }

      setScoreData(payload.score || null);
      setStatus("uploaded");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Unable to score resume.");
    }
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
          Choose a PDF or DOCX file to continue.
        </p>
        <form className="resume-form" onSubmit={handleSubmit}>
          <label className="resume-input">
            <span className="resume-input-label">Resume file</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
          </label>
          {selectedFile && (
            <p className="resume-file">Selected: {selectedFile.name}</p>
          )}
          {status === "missing" && (
            <p className="resume-warning">Please select a resume file first.</p>
          )}
          {status === "loading" && (
            <p className="resume-info">Scoring your resume...</p>
          )}
          {status === "error" && (
            <p className="resume-warning">{errorMessage}</p>
          )}
          {status === "uploaded" && (
            <p className="resume-success">Resume added successfully.</p>
          )}
          {status === "uploaded" && scoreData && (
            <div className="resume-score">
              <div className="resume-score-header">
                <span>Overall score</span>
                <strong>{scoreData.overall_score}</strong>
              </div>
              <div className="resume-score-grid">
                <div>
                  <span>Structure</span>
                  <strong>{scoreData.structure_score}</strong>
                </div>
                <div>
                  <span>Clarity</span>
                  <strong>{scoreData.clarity_score}</strong>
                </div>
                <div>
                  <span>Impact</span>
                  <strong>{scoreData.impact_score}</strong>
                </div>
                <div>
                  <span>Technical</span>
                  <strong>{scoreData.technical_depth_score}</strong>
                </div>
                <div>
                  <span>Professionalism</span>
                  <strong>{scoreData.professionalism_score}</strong>
                </div>
                <div>
                  <span>ATS</span>
                  <strong>{scoreData.ats_score}</strong>
                </div>
              </div>
            </div>
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
