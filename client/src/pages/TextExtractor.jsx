import React, { useState } from "react";
import axios from "axios";

const TextExtractor = () => {
    
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
//   const [extractedText, setExtractedText] = useState(null);

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleUpload = async () => {

    if (!image) return alert("Please select an image first!");

    const formData = new FormData();
    formData.append("image", image);

    try {

    // const response = await axios.post("http://localhost:5000/ocr", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    // });

    const response = await axios.post(

        `${import.meta.env.VITE_BACKEND_URL}/ocr`, 
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
        
    );

    //   setExtractedText(response.data.text);
      setExtractedText(response.data);

    } catch (error) {

      console.error("Upload Error:", error);
      alert("Failed to process image.");

    }

  };

  return (
    <div>
      <h2>Upload Product Image for OCR</h2>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload}>Extract Text</button>
      <h3>Extracted Text:</h3>
      {/* <pre>{extractedText}</pre> */}
      <pre>{JSON.stringify(extractedText, null, 2)}</pre>
    </div>
  );
};

// const TextExtractor = () => {

  
//     return (
//       <div>
//         CHECK
//       </div>
//     );
//   };

export default TextExtractor;
