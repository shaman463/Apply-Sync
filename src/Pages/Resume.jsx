import { useEffect, useState } from "react";
import { apiBaseUrl } from "../Services/apiBaseUrl";
import "../styles/Resume.css";

const Resume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const scoreItems = scoreData
    ? [
        { label: "Structure", value: Math.round(scoreData.structure_score || 0) },
        { label: "Clarity", value: Math.round(scoreData.clarity_score || 0) },
        { label: "Impact", value: Math.round(scoreData.impact_score || 0) },
        { label: "Technical", value: Math.round(scoreData.technical_depth_score || 0) },
        { label: "Professionalism", value: Math.round(scoreData.professionalism_score || 0) },
        { label: "ATS", value: Math.round(scoreData.ats_score || 0) }
      ]
    : [];

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
      <div className="resume-shell">
        <header className="resume-hero">
          <div>
            <span className="resume-badge">Resume Quality Engine</span>
            <h1 className="resume-title">Score your resume in seconds</h1>
            <p className="resume-subtitle">
              Upload a PDF or DOCX and get an explainable score based on structure,
              clarity, impact, technical depth, and ATS readiness.
            </p>
          </div>
          <div className="resume-hero-meta">
            <div>
              <p>Uploads</p>
              <strong>Secure</strong>
            </div>
            <div>
              <p>Scoring</p>
              <strong>Instant</strong>
            </div>
            <div>
              <p>Output</p>
              <strong>Explainable</strong>
            </div>
          </div>
        </header>

        <div className="resume-layout">
          <section className="resume-panel">
            <form className="resume-form" onSubmit={handleSubmit}>
              <label className={`resume-drop ${selectedFile ? "has-file" : ""}`}>
                <input
                  className="resume-file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
                <div className="resume-drop-body">
                  <div>
                    <span className="resume-drop-title">Drop your resume here</span>
                    <span className="resume-drop-subtitle">
                      or browse from your device
                    </span>
                  </div>
                  <span className="resume-drop-tag">PDF / DOCX</span>
                </div>
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
                    <strong>{Math.round(scoreData.overall_score || 0)}</strong>
                  </div>
                  <div className="resume-score-bars">
                    {scoreItems.map((item) => (
                      <div key={item.label} className="resume-score-row">
                        <div className="resume-score-label">
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                        <div className="resume-score-track">
                          <span style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="resume-actions">
                <button type="submit" className="resume-submit">
                  Score resume
                </button>
                <p className="resume-hint">Max size 5MB. Best results with 1-2 pages.</p>
              </div>
            </form>
          </section>

          <aside className="resume-panel resume-panel--preview">
            <div className="resume-preview-header">
              <h2>Preview</h2>
              <span>PDF render only</span>
            </div>
            {status === "uploaded" && previewUrl ? (
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
            ) : (
              <div className="resume-preview resume-preview-empty">
                <div>
                  <p>Upload a resume to see a live preview.</p>
                  <p>We do not store your document after scoring.</p>
                </div>
              </div>
            )}

            <div className="resume-tips">
              <h3>What we score</h3>
              <ul>
                <li>Clear sections and headings</li>
                <li>Action verbs with metrics</li>
                <li>Concise, skimmable bullets</li>
                <li>ATS-friendly formatting</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Resume;
