export function UploadButton({ icon, accept, onChange, title }) {
  return (
    <label className="upload-btn" title={title}>
      <span>{icon}</span>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: "none" }}
      />
    </label>
  );
}
