import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const UserDataContext = createContext(null)

export const UserDataProvider = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [userData, setUserData] = useState(null)
    const [authToken, setAuthToken] = useState(null)

    useEffect(() => {
        const authtoken = Cookies.get('authtoken')
        setAuthToken(authtoken)
        console.log('authtoken', authtoken)
    }, [])

    useEffect(() => {
        if (authToken) {
            const user = jwtDecode(authToken);
            setUserData(user)
        } else {
            setUserData(null)
        }
    }, [authToken])

    const logOut = () => {
        setUserData(null)
        setAuthToken(null)
        Cookies.remove('authtoken')
    }

    useEffect(() => {
        console.log('context userData', userData)
    }, [userData])

    useEffect(() => {
        if (userData?.email) {
            if ((location.pathname.includes('register') || location.pathname.includes('login'))) {
                if (userData?.role === 'admin') {
                    location.href = '/admin'
                } else {
                    navigate('/')
                }
            }
        }
    }, [location.pathname, userData])

    return (
        <UserDataContext.Provider value={{ userData, setUserData, authToken, setAuthToken, logOut }} >
            {props.children}
        </UserDataContext.Provider>
    )
}