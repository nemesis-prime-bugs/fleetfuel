import * as Label from "@radix-ui/react-label";
import * as Switch from "@radix-ui/react-switch";

import type { StorageMode } from "@fleetfuel/shared";

export function StorageModeCard(props: {
  mode: StorageMode;
  onModeChange: (mode: StorageMode) => void;
  baseUrl: string;
  onBaseUrlChange: (v: string) => void;
}) {
  const isServer = props.mode === "server";

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>Storage mode</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Local = on-device. Server = sync with backend (requires login).
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Label.Root htmlFor="modeSwitch" style={{ fontSize: 13, color: "#374151" }}>
            {isServer ? "Server" : "Local"}
          </Label.Root>
          <Switch.Root
            id="modeSwitch"
            checked={isServer}
            onCheckedChange={(checked) => props.onModeChange(checked ? "server" : "local")}
            style={{
              width: 44,
              height: 24,
              backgroundColor: isServer ? "#111827" : "#d1d5db",
              borderRadius: 9999,
              position: "relative",
              border: "none",
            }}
          >
            <Switch.Thumb
              style={{
                display: "block",
                width: 20,
                height: 20,
                backgroundColor: "white",
                borderRadius: 9999,
                transition: "transform 150ms",
                transform: `translateX(${isServer ? 20 : 2}px)`,
              }}
            />
          </Switch.Root>
        </div>
      </div>

      {isServer && (
        <div style={{ marginTop: 12 }}>
          <Label.Root htmlFor="baseUrl" style={{ fontSize: 13, color: "#374151" }}>
            Server base URL
          </Label.Root>
          <input
            id="baseUrl"
            value={props.baseUrl}
            onChange={(e) => props.onBaseUrlChange(e.target.value)}
            placeholder="http://192.168.1.50:3000"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
            Tip: Use your laptop server URL (Phase-1).
          </div>
        </div>
      )}
    </div>
  );
}
