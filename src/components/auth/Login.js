import { useContext, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { sessionStorage } from '../../utils/sessionStorage';
import { supabase } from '../../supabaseClient';
import bcrypt from 'bcryptjs';

export default function Login(){
    const navigate = useNavigate()
    const {userCredentials, setUserCredentials} = useContext(AppContext)
    
    
    const [isLoading, setIsLoading] = useState(false);

    if(userCredentials){
        const returnUrl = sessionStorage.get('returnUrl');
        if (returnUrl) {
            sessionStorage.remove('returnUrl');
            return <Navigate to={returnUrl} />
        }
        return <Navigate to="/" />
    }

    async function handleSubmit(event){
        event.preventDefault()
        setIsLoading(true);

        let email = event.target.email.value
        let password = event.target.password.value

        if(!email || !password){
            alert("Please fill the login form")
            setIsLoading(false);
            return
        }

        try {
            // Fetch user from your own users table
            const { data, error } = await supabase
                .from('Users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                alert("User not found or error: " + (error?.message || ""));
            } else if (!bcrypt.compareSync(password, data.password)) {
                alert("Incorrect password");
            } else {
                setUserCredentials({ user: data });
                const returnUrl = sessionStorage.get('returnUrl');
                sessionStorage.remove('returnUrl');
                navigate(returnUrl || "/");
            }
        } catch (error) {
            alert("Unable to connect to the server")
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <div className="container my-4">
            <div className="mx-auto rounded border p-4" style={{width:"400px"}}>
                <h2 className="text-center mb-5">Welcome, please login</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input className="form-control" name="email"></input>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input className="form-control" type="password" name="password"></input>
                    </div>

                    <div className="row">
                        <div className="col d-grid">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Logging in...
                                    </span>
                                ) : 'Login'}
                            </button>
                        </div>
                        <div className="col d-grid">
                            <Link className="btn btn-outline-primary" to="/" role="button">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}