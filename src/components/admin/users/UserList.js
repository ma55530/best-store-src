import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppContext } from "../../../AppContext"


export default function UserList(){

    const [users, setUsers] = useState([])
    const {userCredentials, setUserCredentials} = useContext(AppContext)
    const navigate = useNavigate()


    //pagination funcionality
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 5

    async function getUsers() {

        const url = process.env.REACT_APP_WEBAPI_URL + "/users?_page=" + currentPage + "&_limit=" + pageSize

        try {
            const response = await fetch(url ,{
                method: "GET", 
                headers:{
                    "Authorization" : "Bearer " + userCredentials.accessToken
                }
            })

            let totalCount = response.headers.get('X-Total-Count')
            console.log("X Total-count: " + totalCount)
            let pages = Math.ceil(totalCount/pageSize)
            setTotalPages(pages)

            const data = await response.json()

            if(response.ok){
                setUsers(data)
            }
            else if(response.status === 401){
                setUserCredentials(null)
                navigate("/")
            }
            else{
                alert("Unable to read the data: " + data)
            }
        } catch (error) {
            alert("Unable to connect to the server")
        }
    }

    useEffect(() => {
        getUsers()
    }, [currentPage])

    let paginationButtons = []
    for(let i = 1; i <=totalPages; i++){
        paginationButtons.push(
            <li className={i === currentPage ? "page-item active": "page-item"} key={i}>
                <a class="page-link" href={"?page=" + i} onClick={event => {
                    event.preventDefault()

                    setCurrentPage(i)
                }}>{i}</a>
            </li>
        )
    }

    return(
        <div className="container my-4">
            <h2 className="text-center mb-5">List of Users</h2>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((user, index) => {
                            return(
                                <tr key={index}>
                                    <td>{user.id}</td>
                                    <td>{user.firstname}</td>
                                    <td>{user.lastname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role === "admin" ? <span class="badge text-bg-warning">Admin</span> 
                                        : <span class="badge text-bg-success">Client</span>}</td>
                                    <td>
                                        <Link className="btn btn-primary btn-sm" to={"/admin/users/details/" + user.id}
                                            role="button">Details</Link>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>

            <ul className="pagination">{paginationButtons}</ul>
        </div>
    )
}