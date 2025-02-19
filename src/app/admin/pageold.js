'use client'



const AdministrationPage = () => {
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [price, setPrice] = useState('');
//   const [category, setCategory] = useState('');
//   const [image, setImage] = useState('');
//   const [parent, setParent] = useState('');
//   const [catName, setCatName] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [uploadStatus, setUploadStatus] = useState("");

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const handleAddRecord = async (e) => {
//     e.preventDefault();
//     const productsRef = ref(rtdb, 'products');
//     // Pushing a new record
//     const newProductRef = push(productsRef);
//     set(newProductRef, {
//       name: name,
//       price: price,
//       description: description,
//       category: category,
//       image: image
//     })
//       .then(() => {
//         console.log('Product added successfully');
//       })
//       .catch((error) => {
//         console.error('Error adding product: ', error);
//       });
//   }

//   const handleAddCategory = async (e) => {
//     e.preventDefault();
//     const catRef = ref(rtdb, 'category');
//     // Pushing a new record
//     const newCatRef = push(catRef);
//     set(newCatRef, {
//       name: catName,
//       parent: parent
//     })
//       .then(() => {
//         fetchCategories();
//         console.log('Category added successfully');
//       })
//       .catch((error) => {
//         console.error('Error adding category: ', error);
//       });
//   }

//   const fetchCategories = async () => {
//     try {
//       const categoriesRef = ref(rtdb, "category");
//       const snapshot = await get(categoriesRef);

//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         console.log(data)
//         const categoryArray = Object.entries(data).filter(([key, value]) => value.parent === '' || value.parent === undefined)
//           .map(([key, value]) => ({
//             id: key,
//             ...value,
//           }));
//         setCategories(categoryArray);
//       } else {
//         console.log("No categories found.");
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImage(file);
// console.log(file)
//       // Preview the image
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleUpload = async (e) => {
//     // e.prevent.default();
//     if (!selectedImage) {
//       setUploadStatus("Please select an image first.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", selectedImage);

//     try {
//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         setUploadStatus("Image uploaded successfully!");
//       } else {
//         setUploadStatus("Failed to upload the image.");
//       }
//     } catch (error) {
//       console.error("Error uploading the image:", error);
//       setUploadStatus("Error uploading the image.");
//     }
//   };

  return (
    <div>
      {/* <h1>Add a new product</h1>
      <form onSubmit={handleAddRecord}>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value='' >
            -- Избери категория --
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div>
          <h4>Image Preview:</h4>
          <img src={preview} alt="Preview" style={{ maxWidth: "300px" }} />
        </div>
      )}
      <button onClick={handleUpload}>Upload</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
        <input
          type="text"
          placeholder="Image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit">Add Record</button>
      </form>
      <br></br>
      <h1>Add a new category</h1>
      <form onSubmit={handleAddCategory}>
        <select
          id="category-select"
          value={parent}
          onChange={(e) => setParent(e.target.value)}
        >
          <option value='' >
            -- Избери категория --
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Name"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
        />
        <button type="submit">Add Record</button>
      </form> */}
      
    </div>
  );
};

export default AdministrationPage;
