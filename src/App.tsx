import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import AppRoutes from "./routes/AppRoutes";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
