import React, { useState } from "react";
// import axios from "axios";

const TextExtractorDemo = () => {
    
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");

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

    // const response = await axios.post(

    //     `${import.meta.env.VITE_BACKEND_URL}/api/upload`, 
    //     formData,
    //     {
    //         headers: { "Content-Type": "multipart/form-data" },
    //     }
        
    // );

    const handleUpload = async () => {
      if (!image) return alert("Please select an image first!");
    
      const formData = new FormData();
      formData.append("image", image);
    
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
    
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    
        const result = await response.json(); // Convert response to JSON
        setExtractedText(result.text); // Assuming the API returns a field named "text"
    
      } catch (error) {
        console.error("Upload Error:", error);
        alert("Failed to process image.");
      }
    };

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

export default TextExtractorDemo;