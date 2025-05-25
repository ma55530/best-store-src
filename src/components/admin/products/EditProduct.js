import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../AppContext";
import { supabase } from '../../../supabaseClient';

export default function EditProduct(){

    const [initialData, setInitialData] = useState(null);
    const params = useParams();
    const navigate = useNavigate();
    const { userCredentials, setUserCredentials } = useContext(AppContext);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        getProduct();
    }, [params.id]);

    function getProduct() {
        supabase
            .from('Products')
            .select('*')
            .eq('id', params.id)
            .single()
            .then(({ data, error }) => {
                if (error || !data) {
                    alert('Unable to read the product details');
                } else {
                    setInitialData(data);
                }
            });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const product = Object.fromEntries(formData.entries());
        let newImageFilename = initialData.imageFilename;
        const imageFile = formData.get('image');
        // If a new image is uploaded
        if (imageFile && imageFile.name) {
            // Delete the old image from Supabase Storage
            if (initialData.imageFilename) {
                await supabase.storage.from('images').remove([initialData.imageFilename]);
            }
            // Upload the new image to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(imageFile.name, imageFile, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: imageFile.type
                });
            if (uploadError) {
                alert('Image upload failed: ' + uploadError.message);
                return;
            }
            newImageFilename = imageFile.name;
        }
        if (!product.name || !product.brand || !product.category || !product.price || !product.description) {
            alert('Please fill out all the fields');
            return;
        }
        try {
            const { error } = await supabase
                .from('Products')
                .update({
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    price: product.price,
                    description: product.description,
                    imageFilename: newImageFilename
                })
                .eq('id', params.id);
            if (error) {
                alert('Unable to edit product');
            } else {
                navigate('/admin/products');
            }
        } catch {
            alert('Unable to connect to the server');
        }
    }
    return(
        <div className="container my-4">
            <div className="row">
                <div className="col-md-8 mx-auto rounded border p-4">
                    <h2 className="text-center mb-5">Edit Product</h2>

                    <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">ID</label>
                    <div className="col-sm-8">
                        <input readOnly className="form-control-plaintext" defaultValue={params.id}/>
                    </div> 
            {
                initialData &&
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Name</label>
                    <div className="col-sm-8">
                        <input className="form-control" name="name" defaultValue={initialData.name}/>
                        <span className="text-danger">{validationErrors.name}</span>
                    </div>                    
                </div>
                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Brand</label>
                    <div className="col-sm-8">
                        <input className="form-control" name="brand" defaultValue={initialData.brand}/>
                        <span className="text-danger">{validationErrors.brand}</span>
                    </div>                    
                </div>
                
                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Category</label>
                    <div className="col-sm-8">
                        <select className="form-select" name="category" defaultValue={initialData.category}>
                            <option value='Other'>Other</option>
                            <option value='Phones'>Phones</option>
                            <option value='Computers'>Computers</option>
                            <option value='Accessories'>Accessories</option>
                            <option value='Printers'>Printers</option>
                            <option value='Cameras'>Cameras</option>
                        </select>
                        <span className="text-danger">{validationErrors.category}</span>
                    </div>                    
                </div>

                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Price</label>
                    <div className="col-sm-8">
                        <input className="form-control" name="price" type="number" step="0.01" min="1" defaultValue={initialData.price}/>
                        <span className="text-danger">{validationErrors.price}</span>
                    </div>                    
                </div>

                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Description</label>
                    <div className="col-sm-8">
                        <textarea className="form-control" name="description" rows = "4" defaultValue={initialData.description}/>
                        <span className="text-danger">{validationErrors.description}</span>
                    </div>                    
                </div>
                <div className="row mb-3">
                    <div className="offset sm-4 col-sm-8">
                        <img src={process.env.REACT_APP_SUPABASE_IMAGE_URL + "/" + initialData.imageFilename} width="150" alt="..." />
                    </div>                    
                </div>
                
                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Image</label>
                    <div className="col-sm-8">
                        <input className="form-control" type="file" name="image"/>
                        <span className="text-danger">{validationErrors.image}</span>
                    </div>                    
                </div>

                <div className="row mb-3">
                    <label className="col-sm-4 col-form-label">Created At</label>
                    <div className="col-sm-8">
                        <input readOnly className="form-control-plaintext" defaultValue={initialData.createdAt.slice(0,10)}/>
                    </div>                    
                </div>
                <div className="row mb-3">
                   <div className="offset-sm-4 col-sm-4 d-grid">
                    <button type="submit" className="btn btn-primary">Submit</button>
                    </div> 
                    <div className="col-sm-4 d-grid">
                        <Link className="btn btn-secondary" to='/admin/products' role="button">Cancel</Link>
                    </div>            
                </div>
            </form>
            }
                </div>
            </div>
        </div>
        </div> 
    )
}
