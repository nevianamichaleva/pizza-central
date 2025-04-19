'use client';
import { useState } from 'react';

export default function CloudinaryUpload(props) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const cloudName = "dcspxxx2c";
  const unsignedPreset = "unsigned_preset";

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", unsignedPreset);

    try {
      const res = await fetch( `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        // const imageId = Date.now();
        // const dbRef = ref(rtdb, 'images/' + imageId);
        // await set(dbRef, {
        //   url: data.secure_url,
        //   uploadedAt: new Date().toISOString()
        // });
        props.setImage(data.secure_url); 
        console.log(data.secure_url)
        // alert("Image uploaded and saved to Firebase!");
      } else {
        console.error("Грешка при качване на снимка:", data);
        // alert("Cloudinary upload failed.");
      }
    } catch (error) {
      console.error("Грешка при качване на снимка:", error);
      // alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Качване...' : 'Прикачи'}
      </button>
    </div>
  );
}
