import { useContext} from "react"
import { Navigate  } from "react-router-dom"
import { AppContext } from "../AppContext"

export function AdminRoute(props){

    const {userCredentials} = useContext(AppContext)
    
    if(!userCredentials || userCredentials.user.role !== "admin"){
        return <Navigate to="/" />
    }
    return props.children
}

export function AuthenticatedUserRoute({children}){
    const {userCredentials}  = useContext(AppContext)

    if(!userCredentials){
        return <Navigate to="/" />
    }

    return children
}

export function ClientOnlyRoute({ children }) {
    const { userCredentials } = useContext(AppContext)

    if(!userCredentials || userCredentials.user.role === "admin"){
        return <Navigate to="/" />
    }
    return children
}

export function NonAdminRoute({ children }) {
    const { userCredentials } = useContext(AppContext)

    // Allow access to non-logged in users and non-admin users
    if(userCredentials?.user.role === "admin"){
        return <Navigate to="/" />
    }
    return children
}

export function VisitorRoute({children}){
    const {userCredentials}  = useContext(AppContext)

    if(!userCredentials || userCredentials.user.role !== "admin"){
        return <Navigate to="/" />
    }

    return children
}