import React, { createContext, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#10b981",
        color: "#fff",
        padding: "16px",
        borderRadius: "8px",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        background: "#ef4444",
        color: "#fff",
        padding: "16px",
        borderRadius: "8px",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 4000,
      position: "top-right",
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
        padding: "16px",
        borderRadius: "8px",
      },
    });
  };

  const value: NotificationContextType = {
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      <Toaster />
      {children}
    </NotificationContext.Provider>
  );
};
