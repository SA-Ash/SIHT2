import React, { useState, useRef } from "react";
import { Upload, FileText, X, Cloud, CheckCircle } from "lucide-react";

const UploadSection = ({ onFileUpload, uploadedFile: externalFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(externalFile);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file.type === "application/pdf" || file.type.includes("image/")) {
      if (file.size <= 50 * 1024 * 1024) {
        const fileData = {
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          type: file.type,
          file: file // Store the actual file object
        };
        setUploadedFile(fileData);
        if (onFileUpload) {
          onFileUpload(fileData);
        }
      } else {
        alert("File size exceeds 50MB limit");
      }
    } else {
      alert("Please upload PDF or image files only");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (onFileUpload) {
      onFileUpload(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full lg:flex-1 bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-200 lg:mr-4 h-max">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">
        Upload Document
      </h2>

      <div
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 h-48 sm:h-56 md:h-64 transition-all cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : uploadedFile
              ? "border-green-300 bg-green-50"
              : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,image/*"
          className="hidden"
        />

        {uploadedFile ? (
          <div className="text-center w-full">
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
              </div>
            </div>
            <p className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
              File Uploaded Successfully!
            </p>
            <div className="flex items-center justify-center bg-white rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 shadow-sm mx-auto max-w-full">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">
                {uploadedFile.name}
              </span>
              <span className="text-xs text-gray-400 ml-1 sm:ml-2 hidden sm:block">
                ({uploadedFile.size})
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium flex items-center justify-center mx-auto"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Remove File
            </button>
          </div>
        ) : (
          <>
            <div
              className={`p-3 sm:p-4 rounded-full mb-3 sm:mb-4 ${
                isDragging ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {isDragging ? (
                <Cloud className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-500" />
              ) : (
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-500" />
              )}
            </div>
            <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base text-center">
              {isDragging
                ? "Drop your file here"
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              PDF, JPG, PNG files (Max 50MB)
            </p>
          </>
        )}
      </div>

      <div className="mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          Upload Guidelines:
        </h3>
        <ul className="text-sm sm:text-base text-gray-600 space-y-1 sm:space-y-2">
          <li>• Supported formats: PDF, JPG, PNG</li>
          <li>• Maximum file size: 50MB</li>
          <li>• Ensure documents are clear and readable</li>
          <li>• Remove any password protection from PDFs</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadSection;
