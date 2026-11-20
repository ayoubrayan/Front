import { useState, useEffect, useCallback, useContext } from "react";
import { SquareChevronUp, Download, Upload, Plus } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "animate.css";
import { IconButton, Menu } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const DataTable = ({
  data,
  columns,
  pageSizes = [5, 10, 20, 50],
  exportFileName,
  refreshData,
  buttonText,
  searchPlaceholder,
  paginationTitle,
  endpoint,
  productsFields,
  formTitle
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [tempDate, setTempDate] = useState(null);
  const { user } = useContext(require("../context/AuthContext").AuthContext);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleUpdate = async (rowId, fieldName, newValue, oldValue) => {
      try {
        let formattedValue = newValue;

        if (newValue instanceof Date) {
          const pad = (num) => num.toString().padStart(2, "0");
          formattedValue = `${newValue.getFullYear()}-${pad(newValue.getMonth() + 1)}-${pad(newValue.getDate())} ${pad(newValue.getHours())}:${pad(newValue.getMinutes())}:${pad(newValue.getSeconds())}`;
        }

        if (String(formattedValue) === String(oldValue)) {
          setEdit(null);
          return;
        }

        await api.patch(`/api/${endpoint}/${rowId}`, {
          [fieldName]: formattedValue
        });

        Swal.fire({
          icon: "success",
          title: "Updated successfully",
          timer: 1200,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        
        setEdit(null);
        refreshData();

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage
        });
      }
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: `Delete ${endpoint.slice(0, -1)}?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/${endpoint}/${id}`);

           Swal.fire({
            icon: "success",
            title: "Deleted successfully",
            timer: 1200,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });

          refreshData();
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || "Something went wrong";

          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage
          });
        }
      }
    });
  };

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    defaultColumn: {
      size: 150,
      minSize: 100,
      maxSize: 400
    },
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      handleDelete: (id) =>  handleDelete(id)
    },
    initialState: {
      pagination: { pageSize: pageSizes[0] }
    }
  });

  const exportToExcel = useCallback(() => {
    const rows = table.getFilteredRowModel().rows.map(r => r.original);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    worksheet["!cols"] = columns.map(() => ({ wch: 15 }));

    const dateStr = new Date().toLocaleDateString().replaceAll("/", "-");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `${exportFileName}_${dateStr}.xlsx`);

  }, [table, columns, exportFileName]);

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: "Import Excel/CSV",
      input: "file",
      inputAttributes: { accept: ".xlsx, .xls, .csv" },
      showCancelButton: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      },
      customClass: {
        popup: 'stunning-popup',
        input: 'stunning-input',
        confirmButton: 'stunning-confirm',
        cancelButton: 'stunning-cancel',
        title: "stunning-title"
      }
    });

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        if (!jsonData.length) throw new Error("File is empty");

        const requiredFields = productsFields.map(f => f.name);
        const isValid = jsonData.every(row => requiredFields.every(field => field in row));
        if (!isValid) throw new Error(`Invalid format. Columns must include: ${requiredFields.join(", ")}`);

        Swal.fire({ title: "Importing...", didOpen: () => Swal.showLoading() });

        await api.post(`/api/${endpoint}/bulk`, jsonData);

        Swal.fire("Success", "Data imported successfully", "success");
        refreshData();

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        Swal.fire("Error", errorMessage, "error");
      }
    };
    reader.readAsArrayBuffer(file);
  }; 

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = table.getFilteredRowModel().rows.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  const [formData, setFormData] = useState({});

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/api/${endpoint}`, formData);
      setIsModalOpen(false);

      Swal.fire({
        icon: "success",
        title: "Created successfully",
        showConfirmButton: false,
        timer: 1500,
        showClass: { popup: "animate__animated animate__fadeInUp animate__faster"},
        hideClass: { popup: "animate__animated animate__fadeOutDown animate__faster"}
      });

      setFormData({});
      setIsModalOpen(false);
      refreshData();

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
      
      setIsModalOpen(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        showClass: { popup: "animate__animated animate__fadeInUp animate__faster" },
        hideClass: { popup: "animate__animated animate__fadeOutDown animate__faster" }
      });
      console.error(err);
    }
  };

  return (
    <>
      <div className="products-table">
        <div className="table-controls">
          <TextField
            label={ searchPlaceholder }
            variant="outlined"
            className="search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {search && (
                    <IconButton
                      onClick={() => setSearch("")}
                      edge="end"
                      size="small"
                      sx={{
                        opacity: search ? 1 : 0,
                        transform: search ? "scale(1)" : "scale(0.8)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: "240px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:focus-within": { width: "400px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                transition: "all 0.25s ease",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5f5" },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 3px rgba(99,102,241,0.15)"
                },
                "& input": { padding: "12px" }
              },
              "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748b" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
              "& .MuiInputAdornment-root svg": {
                color: "#94a3b8",
                transition: "color 0.25s ease"
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiInputAdornment-root svg": {
                color: "#6366f1"
              }
            }}
          />

          <div style={{display: "flex", gap: "10px"}}>
            {isAdmin && (
              <button onClick={() => setIsModalOpen(true)} className="add-btn">
                <Plus size={16}/>
                  Add { buttonText }
              </button>
            )}

            {isAdmin && (
              <button onClick={exportToExcel} className="export-btn">
                <Download size={16} />
              </button>
            )}

            {isAdmin && (
              <button onClick={handleImport} className="import-btn">
                <Upload size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={(e) => {
                        if(!header.column.getCanSort()) return;
                        if(header.column.getIsResizing()) return;
                        header.column.getToggleSortingHandler()?.(e);
                      }}
                      style={{ 
                        cursor: header.column.getCanSort() ? "pointer" : "default",
                        userSelect: "none",
                        position: "relative",
                        width: header.getSize()
                      }}
                      className="group" 
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ 
                          fontSize: "14px", 
                          fontWeight: 600, 
                          color: header.column.getIsSorted() ? "#1e293b" : "#64748b",
                          transition: "color 0.2s ease" 
                        }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                        <div style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          opacity: header.column.getIsSorted() ? 1 : 0.3, 
                          transition: "opacity 0.3s ease"
                        }}>
                          <motion.div
                            animate={{
                              color: header.column.getIsSorted() === "asc" ? "#6366f1" : "#94a3b8",
                              scale: header.column.getIsSorted() === "asc" ? 1.3 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <SquareChevronUp size={11} strokeWidth={3} />
                          </motion.div>
                          <motion.div
                            animate={{
                              color: header.column.getIsSorted() === "desc" ? "#6366f1" : "#94a3b8",
                              scale: header.column.getIsSorted() === "desc" ? 1.2 : 1,
                              rotate: 180
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <SquareChevronUp size={11} strokeWidth={3} />
                          </motion.div>
                        </div>
                        )}
                      </div>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          header.getResizeHandler()?.(e);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          header.getResizeHandler()?.(e);
                        }}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          width: "6px",
                          cursor: "col-resize",
                          userSelect: "none",
                          touchAction: "none"
                        }}
                      >
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} style={{ width: cell.column.getSize() }} onDoubleClick={() => {
                          const colId = cell.column.id.toLowerCase();
                          if (colId === 'id' || colId === 'actions') return;
                          setEdit(cell.id);
                        }}>
                          {edit === cell.id ? (
                            cell.column.id.toLowerCase() === "date" ? (
                              <DatePicker
                                portalId="root"
                                autoFocus
                                selected={tempDate ? tempDate : new Date(cell.getValue())}
                                onChange={(date) => {
                                  setTempDate(date);
                                  handleUpdate(row.original.id, cell.column.id.toLowerCase(), date, cell.getValue());
                                }}
                                onClickOutside={() => setEdit(null)}
                                popperPlacement="left-end"
                                showTimeSelect
                                showTimeSelectOnly={false}
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="yyyy-MM-dd HH:mm aa"
                                timeFormat="HH:mm aa"
                              />
                            ) : cell.column.id.toLowerCase() === "type" ? (
                              <FormControl fullWidth size="small">
                                <Select
                                autoFocus
                                defaultValue={cell.getValue()}
                                renderValue={(selected) => {
                                  if(selected === "in") return "In";
                                  if(selected === "out") return "Out";
                                  return selected;
                                }}
                                onChange={(e) => handleUpdate(row.original.id, cell.column.id.toLowerCase(), e.target.value, cell.getValue())}
                                onBlur={() => setEdit(null)}
                                sx={{
                                  backgroundColor: "#f8faff",
                                  borderRadius: "12px",
                                  boxShadow: "0 0 0 3px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.08)",
                                  fontFamily: "inherit",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  letterSpacing: "0.01em",
                                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "1.5px solid #6366f1 !important",
                                    borderRadius: "12px"
                                  },
                                  "& .MuiSelect-select": {
                                    padding: "10px 12px !important"
                                  }
                                }}
                              >
                                <MenuItem value="in"
                                  sx={{
                                    borderRadius: "10px",
                                    margin: "2px 4px",
                                    padding: "8px 12px",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#4f46e5",
                                    "&:hover": {
                                      backgroundColor: "rgba(99, 102, 241, 0.08)"
                                    },
                                    "&.Mui-selected, &.Mui-selected:hover": {
                                      backgroundColor: "rgba(99, 102, 241, 0.12)",
                                      color: "#4338ca"
                                    }
                                  }}
                                ><ArrowDownToLine size={16} strokeWidth={2.5}/>In</MenuItem>
                                <MenuItem value="out"
                                  sx={{
                                    borderRadius: "10px",
                                    margin: "2px 4px",
                                    padding: "8px 12px",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#e11d48",
                                    "&:hover": {
                                      backgroundColor: "rgba(241, 29, 72, 0.08)",
                                    },
                                    "&.Mui-selected, &.Mui-selected:hover": {
                                      backgroundColor: "rgba(225, 29, 72, 0.12)",
                                      color: "#be123c"
                                    }
                                  }}
                                ><ArrowUpFromLine size={16} strokeWidth={2.5}/>Out</MenuItem>
                              </Select>
                              </FormControl> ) : cell.column.id.toLowerCase() === "role" ? (
                                <FormControl fullWidth size="small">
                                  <Select
                                    autoFocus
                                    defaultValue={cell.getValue()}
                                     renderValue={(selected) => {
                                      if(selected === "in") return "In";
                                      if(selected === "out") return "Out";
                                      return selected;
                                    }}
                                    onChange={(e) => handleUpdate(row.original.id, cell.column.id.toLowerCase(), e.target.value, cell.getValue())}
                                    onBlur={() => setEdit(null)}
                                    sx={{
                                      backgroundColor: "#f8faff",
                                      borderRadius: "12px",
                                      boxShadow: "0 0 0 3px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.08)",
                                      fontFamily: "inherit",
                                      fontSize: "14px",
                                      fontWeight: 500,
                                      color: "#1e293b",
                                      letterSpacing: "0.01em",
                                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        border: "1.5px solid #6366f1 !important",
                                        borderRadius: "12px"
                                      },
                                      "& .MuiSelect-select": {
                                        padding: "10px 12px !important"
                                      }
                                    }}
                                  >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                  </Select>
                                </FormControl>
                              ) : (
                              <input
                                type={cell.column.id.toLowerCase() === "price" || cell.column.id.toLowerCase() === "stock" || cell.column.id.toLowerCase() === "min_stock" || cell.column.id.toLowerCase() === "quantity" ? "number" : cell.column.id.toLowerCase() === "email" ? "email" : "text"}
                                autoFocus
                                defaultValue={cell.getValue()}
                                onBlur={(e) => handleUpdate(row.original.id, cell.column.id.toLowerCase(), e.target.value, cell.getValue())}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdate(row.original.id, cell.column.id.toLowerCase(), e.target.value, cell.getValue());
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  padding: "10px 12px",
                                  borderRadius: "12px",
                                  border: "1.5px solid #6366f1",
                                  outline: "none",
                                  backgroundColor: "#f8faff",
                                  boxShadow: "0 0 0 3px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.08)",
                                  fontFamily: "inherit",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  color: "#1e293b",
                                  letterSpacing: "0.01em",
                                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                  caretColor: "#6366f1"
                                }}
                              />
                            )
                          ) : (flexRender(cell.column.columnDef.cell, cell.getContext()))}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem" }}>
                      No results found for "{search}"
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            Showing <strong>{start}</strong>–<strong>{end}</strong> of {total} {paginationTitle}
          </div>

          <div className="pagination-controls">
            <div className="rows-per-page">
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="page-buttons">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="pager-btn"
              >
                {"<<"}
              </button>

              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="pager-btn"
              >
                {"<"}
              </button>

              <span className="page-number">
                Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
                {table.getPageCount()}
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="pager-btn"
              >
                {">"}
              </button>

              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="pager-btn"
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
          <motion.div
          className="modal-overlay"
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{ opacity: 0}}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 50,
              filter: "blur(10px)"
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)"
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              y: 30,
              filter: "blur(8px)"
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 23
            }}
            >
              <div className="modal-header">
                  <h2>{formTitle}</h2>
                  <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                    <ClearIcon size={12} />
                  </button>
              </div>
              <div className="modal-form-container">
                {productsFields.map((field) => (
                  field.type === "select" ? 
                    (
                      <FormControl key={field.name} fullWidth>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          value={formData[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          sx={{
                            borderRadius: "12px"
                          }}
                        >
                          {field.options.map((option, ind) => (
                            <MenuItem key={ind} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                      key={field.name}
                      label={field.label}
                      type={field.type || "text"}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{
                        backgroundColor: "#f8fafc",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "& fieldset": { borderColor: "#e2e8f0" },
                          "&:hover fieldset": { borderColor: "#cbd5f5" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#6366F1",
                            boxShadow: "0 0 0 3px rgba(99,102,241,0.15)"
                          }
                        }
                      }}
                    />
                  )
                ))}
              <button onClick={handleSubmit} className="premium-submit-btn">Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
    </>
  );
};

export default DataTable;