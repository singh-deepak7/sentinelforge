import { app } from "./app.js";

const PORT = Number(
  process.env.PORT ?? 3010
);

app.listen(PORT, () => {
  console.error(
    `SentinelForge Production Simulator listening on port ${PORT}`
  );
});