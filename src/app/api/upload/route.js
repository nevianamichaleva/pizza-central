import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable body parsing to handle FormData
export const config = {
  api: {
    bodyParser: false, // We need to manually parse the form data
  },
};

export async function POST(req) {
  const uploadDir = path.join(process.cwd(), "public/uploads");

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create a promise to parse the form data
  const form = formidable({
    uploadDir: uploadDir, // Set the upload directory
    keepExtensions: true, // Keep file extensions
    multiples: false, // Set to true if uploading multiple files
  });

  try {
    // Manually parse the request using the formidable `parse` method
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err); // Reject with error if parsing fails
        } else {
          resolve([fields, files]); // Resolve with fields and files if parsing succeeds
        }
      });
    });
console.log(files)
    // Extract the uploaded file information
    const file = files.file[0];
    const filePath = `/uploads/${file.newFilename}`; // Relative path to access the file

    // Respond with the successful upload information
    return new Response(
      JSON.stringify({
        message: "File uploaded successfully",
        filePath,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("File upload error:", error); // Log the error for debugging
    return new Response(
      JSON.stringify({ message: "File upload failed", error: error.message }), // Include error details in the response
      { status: 500 }
    );
  }
}
