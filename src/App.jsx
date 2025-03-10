import { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify'; // Import toast components
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection via input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Process the file by sending it to the backend using fetch
  const processFile = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    const processingToastId = toast.info('Processing...', { autoClose: false }); // Persistent toast

    const formData = new FormData();
    formData.append('file', file); // Must match backend's multer field name

    try {
      const response = await fetch('https://pdf-word-image-to-texts-converter-backend.vercel.app/upload', {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });

      const data = await response.json(); // Parse JSON response
      console.log(data)
      if (!response.ok) {
        // Handle backend errors (e.g., validation errors)
        const errorMessage = data.message || 'Upload failed';
        throw new Error(errorMessage);
      }

      // Assuming the backend returns { text: "extracted text" } on success
      const extractedText = data.text;

      if (!extractedText) {
        throw new Error('No text returned from server');
      }

      // Download the extracted text as a file
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.split('.')[0]}_extracted.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Text extracted and downloaded successfully!');
    } catch (error) {

    // Handle Joi validation errors or other backend errors

      toast.error(error.message || 'An unexpected error occurred. Please try again.');

      
    } finally {
      setIsProcessing(false);
      toast.dismiss(processingToastId); // Dismiss the "Processing..." toast
    }
  };

  return (
    <div className="app">
      <h1>OCR Converter</h1>
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p>Drag and drop a PDF, Word, or Image file here</p>
        <p>or</p>
        <button className="browse-btn" onClick={handleBrowseClick}>
          Browse Files
        </button>
        <input
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {file && <p>Selected file: {file.name}</p>}
      </div>
      <button
        onClick={processFile}
        disabled={!file || isProcessing}
        className={isProcessing ? 'processing' : ''}
      >
        {isProcessing ? 'Processing...' : 'Process File'}
      </button>
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
       <footer className="footer">
        Made with Love <span className="heart">💚</span> by Ngole Lawson{' '}
        <a href="https://linkedin.com/in/ngole" target="_blank" rel="noopener noreferrer">
          @linkedin
        </a>
      </footer>
    </div>
  );
}

export default App;