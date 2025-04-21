export const FileList = ({ files }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="preview-files">
      <h3>Прикрепленные файлы:</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Скачать файл ${file.split("/").pop()}`}
            >
              {file.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
