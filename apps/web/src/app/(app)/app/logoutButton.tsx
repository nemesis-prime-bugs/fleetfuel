"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          window.location.href = "/login";
        }
      }}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #ddd",
        background: "white",
        cursor: loading ? "wait" : "pointer",
      }}
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
