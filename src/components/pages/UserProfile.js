import { useContext, useState } from "react"
import { AppContext } from "../../AppContext"
import { useNavigate} from "react-router-dom"

export default function UserProfile(){

    const [action, setAction] = useState("default")
    return(
        <div className="container my-4">
            <div className="row">
                { (action === "default") &&
                    <div className="col-lg-8 mx-auto rounded border p-4">
                    <h2 className="mb-3">User Profile</h2>
                    <hr/>
                    <Details />
                    <hr/>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => {
                        setAction("update_profile")
                    }}>Update Profile</button>
                    <button className="btn btn-warning btn-sm" onClick={() => {
                        setAction("update_password")
                    }}>Update Password</button>
                </div>}

                {(action === "update_profile") &&
                    <div className="col-lg-8 mx-auto rounded border p-4">
                    <h2 className="mb-3 text-center">Update Profile</h2>
                    <hr />
                    <UpdateProfile/>
                    <hr />
                    <div className="text-center">
                        <button type="button" className="btn btn-link text-decoration none" onClick={() => {
                            setAction("default")
                        }}>Back to profile</button>
                    </div>
                </div>}

                {(action === "update_password") &&
                <div className="col-lg-5 col-md-8 mx-auto rounded border p-4">
                    <h2 className="mb-3 text-center">Update Password</h2>
                    <hr/>
                    <UpdatePassword/>
                    <hr/>
                    <div className="text-center">
                        <button type="button" className="btn btn-link text-decoration none" onClick={() => {
                            setAction("default")
                        }}>Back to profile</button>
                    </div>
                </div>}
            </div>
        </div>
    )
}   

function Details(){

    const {userCredentials} = useContext(AppContext)

    return(
        <>
            <div className="row mb-3">
                <div className="col-sm-3">First name</div>
                <div className="col-sm-6">{userCredentials.user.firstname}</div>
            </div>
            <div className="row mb-3">
                <div className="col-sm-3">Last name</div>
                <div className="col-sm-6">{userCredentials.user.lastname}</div>
            </div>
            <div className="row mb-3">
                <div className="col-sm-3">Email</div>
                <div className="col-sm-6">{userCredentials.user.email}</div>
            </div>
            <div className="row mb-3">
                <div className="col-sm-3">Phone number</div>
                <div className="col-sm-6">{userCredentials.user.phone}</div>
            </div>
            <div className="row mb-3">
                <div className="col-sm-3">Address</div>
                <div className="col-sm-6">{userCredentials.user.address}</div>
            </div>
            <div className="row mb-3">
                <div className="col-sm-3">User role</div>
                <div className="col-sm-6">{userCredentials.user.role === "admin" ? "Admin" : "Client"}</div>
            </div>
        </>
    )
}

function UpdateProfile(){

    const {userCredentials, setUserCredentials} = useContext(AppContext)
    const navigate = useNavigate()

    async function handleSubmitUpdateProfile(event){
        event.preventDefault()

        const formData = new FormData(event.target)
        const user = Object.fromEntries(formData.entries())

        if(!user.firstname || !user.lastname || !user.email){
            alert("Please fill all the required fields!")
            return
        }

        try{
            const response = await fetch(process.env.REACT_APP_WEBAPI_URL + "/users/" + userCredentials.user.id,{
                method: "PATCH",
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userCredentials.accessToken
                },
                body: JSON.stringify(user) 
            })

            const data = await response.json()

            if(response.ok){
                alert("User Profile updated correctly")
                console.log("server response: ", data)
                setUserCredentials({...userCredentials, user: data})
                return
            }
            else if (response.status === 401){
                setUserCredentials(null)
                navigate("/auth/login")
            }
            else{
                alert("Unable to update the profile: " + data) 
            }

        }catch(error){
            alert("Unable to connect to the server")
        }
    }

    return(
        <form onSubmit={handleSubmitUpdateProfile}>
            <div className="row mb-3">
                <label className="col-sm-4 col-form-label">First Name *</label>
                <div className="col-sm-8">
                    <input className="form-control" name="firstname" defaultValue={userCredentials.user.firstname}/>
                </div>
            </div>
            <div className="row mb-3">
                <label className="col-sm-4 col-form-label">Last Name *</label>
                <div className="col-sm-8">
                    <input className="form-control" name="lastname" defaultValue={userCredentials.user.lastname}/>
                </div>
            </div>
            <div className="row mb-3">
                <label className="col-sm-4 col-form-label">Email *</label>
                <div className="col-sm-8">
                    <input className="form-control" name="email" defaultValue={userCredentials.user.email}/>
                </div>
            </div>
            <div className="row mb-3">
                <label className="col-sm-4 col-form-label">Phone</label>
                <div className="col-sm-8">
                    <input className="form-control" name="phone" defaultValue={userCredentials.user.phone}/>
                </div>
            </div>
            <div className="row mb-3">
                <label className="col-sm-4 col-form-label">Addres</label>
                <div className="col-sm-8">
                    <input className="form-control" name="address" defaultValue={userCredentials.user.address}/>
                </div>
            </div>
            
            <div className="text-end">
                <button type="submit" className="btn btn-primary">Submit</button>
            </div>
        </form>
    )
}

function UpdatePassword(){
    const {userCredentials, setUserCredentials} = useContext(AppContext)
    const navigate = useNavigate()

    async function handleSubmit(event){
        event.preventDefault()

        const password = event.target.password.value
        const confirm_password = event.target.confirm_password.value
        const current_password = event.target.current_password.value

        // Validation checks
        if(!current_password || !password || !confirm_password){
            alert("Please fill all password fields")
            return
        }
        if(password !== confirm_password){
            alert("The new passwords do not match!")
            return
        }
        if(current_password === password){
            alert("New password must be different from current password")
            return
        }

        // First verify current password
        try {
            const verifyResponse = await fetch(process.env.REACT_APP_WEBAPI_URL + "/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userCredentials.user.email,
                    password: current_password
                })
            })

            if (!verifyResponse.ok) {
                alert("Current password is incorrect")
                return
            }

            // If current password verified, proceed with password update
            const response = await fetch(process.env.REACT_APP_WEBAPI_URL + "/users/" + userCredentials.user.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + userCredentials.accessToken
                },
                body: JSON.stringify({ password })
            })

            const data = await response.json()

            if(response.ok){
                alert("Password updated successfully")
                event.target.reset()
            } else if(response.status === 401){
                setUserCredentials(null)
                navigate("/auth/login")
            } else {
                alert("Unable to update the password: " + data)
            }
        } catch (error) {
            alert("Unable to connect to the server")
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Current Password *</label>
                <input 
                    className="form-control" 
                    name="current_password" 
                    type="password"
                    required 
                />
            </div>

            <div className="mb-3">
                <label className="form-label">New Password *</label>
                <input 
                    className="form-control" 
                    name="password" 
                    type="password"
                    required 
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Confirm New Password *</label>
                <input 
                    className="form-control" 
                    name="confirm_password" 
                    type="password"
                    required 
                />
            </div>

            <div className="text-end">
                <button type="submit" className="btn btn-warning">Submit</button>
            </div>
        </form>
    )
}