import { LayoutDashboard,
     Package,
      ArrowLeftRight,
       Users,
        LogOut
     } from 'lucide-react';
import '../css/Sidebar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    }

    const avatar = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "?";

    return (
        <div className="sidebar">
            <div className='logo'>
                <Package size={24} />
                <svg width="160" height="32" xmlns="http://www.w3.org/2000/svg">
                    <text 
                        x="12.5" 
                        y="25" 
                        font-size="20" 
                        font-family="Outfit, sans-serif" 
                        font-weight="700" 
                        fill="white"
                        letter-spacing="2"
                    >
                        DIEEPEC FBS
                    </text>
                </svg>
            </div>

            <div className='menu'>
                <p>MENU</p>
                <ul onCopy={(e) => e.preventDefault()}>
                    <li className={location.pathname === "/" ? 'active' : ''} style={{overflow:"hidden"}}>
                        <Link to="/" data-tooltip="Dashboard"><LayoutDashboard stroke="white" size={20}/> <span style={{margin:0, padding: 0}}>Dashboard</span></Link>
                    </li>
                    <li className={location.pathname === "/products" ? 'active' : ''} >
                        <Link to="/products" data-tooltip="Products"><Package stroke="white" size={20}/> <span style={{margin:0, padding: 0}}>Produits</span></Link>
                    </li>
                    <li className={location.pathname === "/movements" ? 'active' : ''} >
                        <Link to="/movements" data-tooltip="Movements"><ArrowLeftRight stroke="white" size={20}/> <span style={{margin:0, padding: 0}}>Mouvements</span></Link>
                    </li>
                    <li className={location.pathname === "/users" ? 'active' : ''} >
                        <Link to="/users" data-tooltip="Users"><Users stroke="white" size={20}/> <span>Utilisateurs</span></Link>
                    </li>
                </ul>
            </div>

            <div className='profile'>
                <div className='profile-info'>
                    <div className='avatar'>
                        {avatar}
                    </div>
                    <div className='profile-name'>
                        <p>{user?.name}</p>
                        <p>{user?.role || "user"}</p>
                    </div>
                </div>
                <div 
                    className='logout'
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                >
                    <LogOut stroke="currentColor" size={18} />
                    <p>Sign out</p>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;