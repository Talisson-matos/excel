// src/components/FileUploader.tsx

import React from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <label htmlFor="file-upload">Selecione uma planilha Excel:</label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx,.xls,.csv,.xlsb,.ods"
        onChange={handleChange}
      />
    </div>
  );
};

export default FileUploader;
