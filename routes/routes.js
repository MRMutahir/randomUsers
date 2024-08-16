
import { randomUsers } from "./randomUsers.js";
const routes = async (app) => {
  app.get("/", (req, res) => {
    res.send("Welcome to Node Server");
  });
  //   app.use("/api/v1/", userRoutes);
  // app.use("/api/v1/auth", authRoutes);
  // app.use("/api/v1/auth/verifications", verificationRoutes);
  // app.use("/api/v1/users", authenticate, userRoutes);
  // app.use("/api/v1/users/work", authenticate, userWorkRoutes);
  // app.use("/api/v1/users/education", authenticate, educationRoutes);
  // app.use("/api/v1/users/aggregation", authenticate, userAggregationRoutes);
  app.use("/api/v1/random/users", randomUsers);
  app.use((req, res, next) => {
    res.send("Route does not exist");
  });
};

export { routes };
