import { useState, useMemo, useEffect, useCallback } from "react";
import DataTable from "./DataTable";
import Transition from "./Transition";
import { Skeleton } from "@mui/material";
import "../css/Products.css";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { SquarePen, Trash2 } from "lucide-react";
import api from "../api/axios";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import "../css/Movements.css";

const Movements = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshData = useCallback(() => {
    setLoading(true);
    api('/api/movements')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setProducts([]);
        setLoading(false);
      })
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

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
      accessorKey: "product_name",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <Inventory2Icon style={{width: 16}} /> Product
        </span>
      )
    },
    {
      accessorKey: "type",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <SwapHorizIcon style={{width: 16}}/> Type
        </span>
      ),
      cell: (info) => {
        const value = info.getValue();

        const baseStyle = {
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "6px 12px",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.5px",
          userSelect: "none",
        }
        
        if (value == "in") {
          return (
            <div style={{
              ...baseStyle,
              color: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              border: "1.2px solid rgba(99, 102, 241, 0.2)"
            }}>
              <ArrowDownToLine size={14} strokeWidth={2.5}/>
              In
            </div>
          )
        }

        return (
          <div style={{
            ...baseStyle,
            color: "rgba(255, 45, 85, 1)",
            backgroundColor: "rgba(255, 45, 85, 0.1)",
            border: "1.2px solid rgba(255, 45, 85, 0.2)"
          }}>
            <ArrowUpFromLine size={14} strokeWidth={2.5}/>
            Out
          </div>
        )
      }
    },
    {
      accessorKey: "quantity",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <ProductionQuantityLimitsIcon style={{width: 16}}/> Quantity
        </span>
      )
    },
    {
      accessorKey: "date",
      header: () => (
        <span style={{display: "flex", alignItems: "center"}}>
          <CalendarTodayIcon style={{width: 16}}/> Date
        </span>
      )
    },
    {
      enableSorting: false,
      header: "Actions",
      cell: (info) => {
        const product = info.row.original;
        return (
          <div style={{display: "flex", justifyContent:"left"}}>
            <Trash2 
              size={16} 
              style={{color:"red", boxShadow: "0 0 4px 0px rgba(0, 0, 0, 0.4)", width: "26.5px", height: "27px", padding: "6px", borderRadius: "8px", cursor: "pointer"}}
              onClick={() => info.table.options.meta?.handleDelete(product.id)}
            />
          </div>
        )
      }
    }
  ], []);

  const animatedTitle = useMemo(() => {
      return "Mouvements".split("").map((char, index) => (
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
      }, []);

  const movementsFields = useMemo(() => [
    { name: "product_name", label: "Product Name", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "type", label: "Type", type: "select", options: [
        { value: "in", label: "In"},
        { value: "out", label: "Out"}
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
          data={products}
          columns={columns}
          exportFileName="movements"
          refreshData={refreshData}
          buttonText="Movement"
          searchPlaceholder="Search movements"
          paginationTitle="movements"
          endpoint="movements"
          productsFields={movementsFields}
          formTitle="Add Movement"
        />
      )}
      <Footer />
    </div>
  )

};

export default Transition(Movements);