import { useContext } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { supabase } from '../../supabaseClient';
import bcrypt from 'bcryptjs';

export default function Register(){

    const navigate = useNavigate()
    const {userCredentials, setUserCredentials} = useContext(AppContext)

    if(userCredentials){
        return <Navigate to="/" />
    }
    async function handleSubmit(event){
        event.preventDefault()

        let formData = new FormData(event.target)
        let user = Object.fromEntries(formData.entries())

        if(!user.firstname || !user.lastname || !user.email || !user.password){
            alert("Please fill all required fields!")
            return
        }

        if(user.password !== user.confirm_password){
            alert("Make sure the passwords match!")
            return
        }

        delete user.confirm_password

        try {
            // Hash the password before storing
            const salt = bcrypt.genSaltSync(12);
            const hashedPassword = bcrypt.hashSync(user.password, salt);

            // Insert user into your own users table (omit id, let Supabase/Postgres auto-generate it)
            const { data, error } = await supabase.from('Users').insert([
                {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    password: hashedPassword
                }
            ]);
            if (error) {
                alert("Unable to register: " + (error.message || JSON.stringify(error)))
            } else {
                alert("Registration successful! You can now log in.");
                navigate("/auth/login");
            }
        } catch (error) {
            alert("Unable to connect to the server")
        }
    }
    return(
        <div className="container my-4">
            <div className="row">
                <div className="col-lg-8 mx-auto rounded border p-4">
                    <h2 className="text-center mb-5">Create new Account</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">First Name *</label>
                            <div className="col-sm-8">
                                <input className="form-control" name="firstname" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Last Name *</label>
                            <div className="col-sm-8">
                                <input className="form-control" name="lastname" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Email *</label>
                            <div className="col-sm-8">
                                <input className="form-control" name="email" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Phone</label>
                            <div className="col-sm-8">
                                <input className="form-control" name="phone" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Address</label>
                            <div className="col-sm-8">
                                <input className="form-control" name="address" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Password *</label>
                            <div className="col-sm-8">
                                <input className="form-control" type="password" name="password" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Confirm Password *</label>
                            <div className="col-sm-8">
                                <input className="form-control" type="password" name="confirm_password" />
                            </div>
                        </div>

                        <div className="row">
                            <div className="offset-sm-4 col-sm-4 d-grid">
                                <button type="submit" className="btn btn-primary">Register</button>
                            </div>
                            <div className="col-sm-4 d-grid">
                                <Link className="btn btn-outline-primary" to="/" role="button">Cancel</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}