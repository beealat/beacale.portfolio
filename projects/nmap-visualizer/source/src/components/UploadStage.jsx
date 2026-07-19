import { useRef, useState, useCallback } from 'react';

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
      <path d="M12 3v12M12 3l-4 4M12 3l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UploadStage({ onFile, onLoadSample, error, busy }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    if (files && files[0]) onFile(files[0]);
  }, [onFile]);

  return (
    <div className="upload-stage">
      <h1 className="upload-stage-title">
        Turn a raw <span>Nmap</span> scan into a dashboard you can actually read
      </h1>
      <p className="upload-stage-desc">
        Drop an Nmap XML (<code>-oX</code>) or JSON export below. Everything is parsed
        and rendered in your browser — hosts, ports, OS fingerprints, and risk scoring,
        nothing leaves this tab.
      </p>

      <div
        className={`dropzone${dragOver ? ' dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="dropzone-icon"><UploadIcon /></div>
        <div className="dropzone-title">{busy ? 'Parsing scan…' : 'Drag & drop your scan file'}</div>
        <div className="dropzone-hint">.xml or .json — parsed entirely client-side</div>

        <div className="dropzone-actions">
          <button className="btn" onClick={() => inputRef.current?.click()}>Browse file</button>
          <button className="btn btn-primary" onClick={onLoadSample}>Load sample scan</button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xml,.json,application/xml,application/json,text/xml"
          className="file-input-hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <div className="upload-error">{error}</div>}

      <div className="format-note">Supports standard <code>nmap -oX</code> output, or a simplified {'{ hosts: [...] }'} JSON shape</div>
    </div>
  );
}
