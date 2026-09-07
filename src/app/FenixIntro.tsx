<div className="feather-world" aria-hidden="true">
  <div className="feather-core" />

  {Array.from({ length: 42 }).map((_, i) => (
    <span
      key={i}
      className="feather feather-a"
      style={
        {
          "--i": i,
          "--angle": `${i * 8.57}deg`,
          "--delay": `${i * -0.08}s`,
        } as React.CSSProperties
      }
    />
  ))}

  {Array.from({ length: 28 }).map((_, i) => (
    <span
      key={`b-${i}`}
      className="feather feather-b"
      style={
        {
          "--i": i,
          "--angle": `${i * 12.85}deg`,
          "--delay": `${i * -0.11}s`,
        } as React.CSSProperties
      }
    />
  ))}
</div>
