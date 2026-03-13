interface StatusBannerProps {
  variant: "success" | "error" | "info";
  message: string;
  details?: string[];
}

export function StatusBanner({ variant, message, details = [] }: StatusBannerProps) {
  return (
    <div className={`status-banner status-banner--${variant}`} role="status">
      <strong>{message}</strong>
      {details.length > 0 ? (
        <ul className="status-banner__details">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
