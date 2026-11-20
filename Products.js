import { useState, useMemo, useEffect, useCallback } from "react";
import DataTable from "./DataTable";
import Transition from "./Transition";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Skeleton } from "@mui/material";
import "../css/Products.css";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { SquarePen, Trash2 } from "lucide-react";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import api from "../api/axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshData = useCallback(() => {
    setLoading(true);
    api('/api/products')
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
  }, [refreshData]);

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: () => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <FingerprintIcon style={{ width: 16 }} /> ID
        </span>
      )
    },
    {
      accessorKey: "name",
      header: () => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <Inventory2Icon style={{ width: 16 }} /> Name
        </span>
      )
    },
    {
      accessorKey: "price",
      header: () => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <MonetizationOnIcon style={{ width: 16 }} /> Price
        </span>
      )
    },
    {
      accessorKey: "stock",
      header: () => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <WarehouseIcon style={{ width: 16 }} /> Stock
        </span>
      ),
      cell: (info) => {
        const stock = info.getValue();
        const minStock = info.row.original.min_stock;
        const isLow = stock < minStock;
        return (
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <span>{stock}</span>
            {isLow && (
              <span
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  border: "1.5px solid #f87171",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  userSelect: "none"
                }}
              >Low</span>
            )}
          </div>
        )
      } 
    },
    {
      accessorKey: "min_stock",
      header: () => (
        <span style={{ display: "flex", alignItems: "center" }}>
          <WarningAmberIcon style={{ width: 16 }} /> Min Stock
        </span>
      )
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: (info) => {
        const product = info.row.original;
        return (
          <div style={{ display: "flex", justifyContent: "left"}}>
            <Trash2
              size={16}
              style={{ color: "red", boxShadow: "0 0 4px 0px rgba(0, 0, 0, 0.4)", width: "26.5px", height: "27px", padding: "6px", borderRadius: "8px", cursor: "pointer" }}
              onClick={() => info.table.options.meta?.handleDelete(product.id)}
            />
          </div>
        )
      }
    }
  ], []);

  const animatedTitle = "Produits".split("").map((char, index) => (
    <motion.span
      key={index}
      initial={{ opacity: 0, x: -18, letterSpacing: "0px" }}
      animate={{ opacity: 1, x: 0, letterSpacing: "2px" }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
      style={{ fontWeight: "bold", display: "inline-block" }}
    >
      {char}
    </motion.span>
  ));

  const productsFields = [
    { name: "name", label: "Name", type: "text" },
    { name: "price", label: "Price", type: "number" },
    { name: "stock", label: "Stock", type: "number" },
    { name: "min_stock", label: "Min Stock", type: "number" }
  ];

  return (
    <div className="products">
      <div className="notification-table">
        <span className="notification">
          <h1>{animatedTitle}</h1>
        </span>
      </div>
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={400}
          animation="wave"
          style={{ marginTop: "5vh", borderRadius: "26px" }}
        />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          exportFileName="products"
          refreshData={refreshData}
          buttonText="Product"
          searchPlaceholder="Search products"
          paginationTitle="products"
          endpoint="products"
          productsFields={productsFields}
          formTitle="Add Product"
        />
      )}
      <Footer />
    </div>
  )

};

export default Transition(Products);