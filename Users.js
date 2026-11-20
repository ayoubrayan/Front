import { useState, useMemo, useEffect, useCallback} from "react";
import DataTable from "./DataTable";
import Transition from "./Transition";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import { Skeleton } from "@mui/material";
import "../css/Products.css";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { SquarePen, Trash2 } from "lucide-react";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import api from "../api/axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshData = useCallback(() => {
    setLoading(true);
    api.get('/api/users')
    .then(res => {
      setUsers(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Fetch error:", err);
      setUsers([]);
      setLoading(false);
    })
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <FingerprintIcon style={{width: 16}}/> ID
        </span>
      )
    },
    {
      accessorKey: "name",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <PersonIcon style={{width: 16}} /> Name
        </span>
      )
    },
    {
      accessorKey: "email",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <EmailIcon style={{width: 16}}/> Email
        </span>
      )
    },
    {
      accessorKey: "role",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <SupervisedUserCircleIcon style={{width: 16}}/> Role
        </span>
      )
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div style={{display: "flex", justifyContent:"left"}}>
            <Trash2 
              size={16} 
              style={{color:"red", boxShadow: "0 0 4px 0px rgba(0, 0, 0, 0.4)", width: "26.5px", height: "27px", padding: "6px", borderRadius: "8px", cursor: "pointer"}}
              onClick={() => info.table.options.meta?.handleDelete(user.id)}
            />
          </div>
        )
      }
    }
  ], []);

  const animatedTitle = useMemo(() => 
    "Utilisateurs".split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, x: -18, letterSpacing: "0px" }}
          animate={{ opacity: 1, x: 0, letterSpacing: "2px" }}
          transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
          style={{ fontWeight: "bold", display: "inline-block" }}
        >
          {char}
        </motion.span>
        ))
    , []);

  const usersFields = useMemo(() => [
    { name: "name", label: "Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password"},
    { name: "role", label: "Role", type: "select", options: [
        { value: "admin", label: "Admin"},
        { value: "user", label: "User"}
      ]
    }
  ], []);

  return (
    <div className="products">
      <div className="notification-table">
        <span className="notification">
          <h1>{ animatedTitle }</h1>
        </span>
      </div>
      {loading ? (
        <Skeleton 
          variant="rectangular" 
          height={400}
          animation="wave"
          style={{marginTop: "5vh", borderRadius: "26px"}}
        />
      ) : (
        <DataTable 
          data={users}
          columns={columns}
          exportFileName="users"
          refreshData={refreshData}
          buttonText="User"
          searchPlaceholder="Search users"
          paginationTitle="users"
          endpoint="users"
          productsFields={usersFields}
          formTitle="Add User"
        />
      )}
      <Footer />
    </div>
  )

};

export default Transition(Users);