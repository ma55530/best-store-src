import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../AppContext";
import { supabase } from '../../../supabaseClient';

export default function UserDetails() {
    const [user, setUser] = useState({});
    const params = useParams();
    const { userCredentials, setUserCredentials } = useContext(AppContext);
    const navigate = useNavigate();

    async function getUserDetails() {
        try {
            const { data, error } = await supabase
                .from('Users')
                .select('*')
                .eq('id', params.id)
                .single();
            if (error || !data) {
                alert("Unable to read data: " + (error?.message || "User not found"));
            } else {
                setUser(data);
            }
        } catch (error) {
            alert("Unable to connect to the server");
        }
    }

    useEffect(() => {
        getUserDetails();
        // eslint-disable-next-line
    }, [params.id]);

    return (
        <div className="container my-4">
            <h2 className="mb-3">User Details</h2>
            <hr />
            <div className="row mb-3">
                <div className="col-8">ID</div>
                <div className="col-4">{user.id}</div>
            </div>
            <div className="row mb-3">
                <div className="col-8">First name</div>
                <div className="col-4">{user.firstname}</div>
            </div>
            <div className="row mb-3">
                <div className="col-8">Last name</div>
                <div className="col-4">{user.lastname}</div>
            </div>
            <div className="row mb-3">
                <div className="col-8">Email</div>
                <div className="col-4">{user.email}</div>
            </div>
            <div className="row mb-3">
                <div className="col-8">Phone</div>
                <div className="col-4">{user.phone}</div>
            </div>
            <div className="row mb-3">
                <div className="col-8">Address</div>
                <div className="col-4">{user.address}</div>
            </div>
            <div className="row mb-3">
                <div className="col-8">Role</div>
                <div className="col-4">
                    {!user.id ? "" : user.role === "admin" ? (
                        <span className="badge text-bg-warning">Admin</span>
                    ) : (
                        <span className="badge text-bg-success">Client</span>
                    )}
                </div>
            </div>
            <hr />
            <Link
                className="btn btn-secondary btn-sm"
                to="/admin/users"
                role="button"
                style={!user.id ? { pointerEvents: 'none', backgroundColor: '#ccc', borderColor: '#ccc', color: '#888' } : {}}
                tabIndex={!user.id ? -1 : 0}
                aria-disabled={!user.id ? 'true' : 'false'}
            >
                Back
            </Link>
        </div>
    );
}