// "use client";

// import { useState } from "react";

// export default function UploadZone({ file, setFile }) {
//   const [dragOver, setDragOver] = useState(false);

//   return (
//     <div
//       onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//       onDragLeave={() => setDragOver(false)}
//       onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
//       className={`upload-zone rounded-2xl px-8 py-12 text-center mb-6 ${
//         dragOver
//           ? "upload-zone-active"
//           : file
//           ? "!border-teal !bg-teal-50/40"
//           : ""
//       }`}
//     >
//       {file ? (
//         <div className="flex flex-col items-center gap-2">
//           <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-1">
//             <svg className="w-6 h-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//           </div>
//           <p className="text-sm font-semibold text-charcoal">{file.name}</p>
//           <button
//             onClick={() => setFile(null)}
//             className="text-sm text-muted hover:text-severity-major transition-colors"
//           >
//             Remove
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
//             <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//             </svg>
//           </div>
//           <p className="text-sm font-medium text-charcoal mb-1">
//             Drag and drop your report here
//           </p>
//           <p className="text-sm text-muted mb-4">PDF or image · max 10MB</p>
//           <label className="inline-block cursor-pointer px-5 py-2.5 text-sm font-medium text-teal bg-teal-50 border border-teal-muted rounded-lg hover:bg-teal-muted transition-colors">
//             Browse files
//             <input
//               type="file"
//               accept=".pdf,image/*"
//               className="hidden"
//               onChange={(e) => setFile(e.target.files[0])}
//             />
//           </label>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";

export default function UploadZone({ selectedFiles, setSelectedFiles, text, setText }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    // Clear text when files are added
    setText("");
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    setText("");
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-ash rounded-2xl p-6 mb-6">
      {/* File drop area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`upload-zone rounded-2xl px-6 py-8 text-center mb-4 ${
          dragOver
            ? "upload-zone-active"
            : selectedFiles.length > 0
            ? "!border-teal !bg-teal-50/40"
            : ""
        }`}
      >
        {selectedFiles.length > 0 ? (
          /* Thumbnails grid */
          <div className="flex flex-wrap gap-3 justify-center">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative w-24 h-24">
                <div className="w-24 h-24 border-2 border-teal rounded-xl overflow-hidden bg-teal-50 flex items-center justify-center">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <svg className="w-8 h-8 text-teal mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs text-teal font-medium truncate w-20">{file.name}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-severity-major text-white rounded-full text-xs font-bold flex items-center justify-center hover:opacity-80 shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add more button */}
            <div className="w-24 h-24">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="fileUploadMore"
                multiple
              />
              <label
                htmlFor="fileUploadMore"
                className="w-24 h-24 border-2 border-dashed border-teal-muted rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-teal hover:bg-teal-50 transition-colors"
              >
                <span className="text-2xl text-teal">+</span>
                <span className="text-xs text-muted mt-1">Add more</span>
              </label>
            </div>
          </div>
        ) : (
          /* Empty state */
          <>
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-charcoal mb-1">
              Drag and drop your report here
            </p>
            <p className="text-sm text-muted mb-4">
              JPG, PNG recommended · PDF: paste text below
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="fileUpload"
              multiple
            />
            <label
              htmlFor="fileUpload"
              className="inline-block cursor-pointer px-5 py-2.5 text-sm font-medium text-teal bg-teal-50 border border-teal-muted rounded-lg hover:bg-teal-muted transition-colors"
            >
              Browse files
            </label>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-ash"></div>
        <span className="text-xs text-muted font-medium tracking-wider">OR PASTE TEXT</span>
        <div className="flex-1 h-px bg-ash"></div>
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value) setSelectedFiles([]);
        }}
        placeholder={`Paste report text here:\nHemoglobin 9.5 g/dL\nWBC 11.5 thousand/uL\nTSH 6.2 mIU/L`}
        rows={5}
        className="w-full border border-ash rounded-xl px-4 py-3 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none font-mono bg-white"
      />
    </div>
  );
}

