import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Snackbar,
     Alert,
      TextField,
        InputAdornment } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import "../css/Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showAlert = (message, severity) => {
        setAlert({
            open: true,
            message,
            severity,
        });
    };

    const handleClose = () => {
        setAlert((prev) => ({ ...prev, open: false }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await login(email, password);
            showAlert("Login successful", "success");
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 600);
        } catch (err) {
            showAlert("Invalid credentials", "error");
        }
    };

    return (
        <div className="login-page">
            <form onSubmit={handleLogin}>
                <h2>Welcome to DIEEPEC</h2>
                <TextField
                    variant="outlined"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon />
                            </InputAdornment>
                        )
                    }}
                />

                <TextField
                    variant="outlined"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon />
                            </InputAdornment>
                        )
                    }}
                />

                <button type="submit">Login</button>
            </form>

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleClose}
                    severity={alert.severity}
                    variant="filled"
                    componentsProps={{
                        closeButton: { title: '' }
                    }}
                    sx={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1.2px solid rgba(255,255,255,0.08)',
                        borderLeft: alert.severity === 'success'
                            ? '3px solid #6366f1'
                            : '3px solid rgba(255, 45, 85, 1)',
                        borderRadius: '16px',
                        boxShadow: alert.severity === 'success'
                            ? '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.15)'
                            : '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(236,72,153,0.15)',
                        color: '#e2e8f0',
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        '& .MuiAlert-icon': {
                            color: alert.severity === 'success' ? '#6366f1' : 'rgba(255, 45, 85, 1)',
                        },
                        '& .MuiAlert-action .MuiIconButton-root': {
                            color: '#64748b',
                            '&:hover': { color: alert.severity === "success" ? "#6366f1" : "rgba(255, 45, 85, 1)"},
                        },
                    }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Login;