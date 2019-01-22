conn = new Mongo();
try {
  db = conn.getDB(MONGO_DB_NAME);
} catch (error) {
  print(error);
}
db.dropDatabase();
db.admins.insert({"username" : "admin", "name" : "admin", "email" : "admin@nure.mx",
                  "password" : "$2a$10$GefsQxuibSa.Of2/qFbBXeWqcYLVDLDyTbP4TJCqk5W3h.COfEFfS",
                  "services" : { "dashboard" : true, "clients" : 2, "admins" : 2, "rates" : true },
                  "active" : true,
                  "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNlc2FyQG51cmUubXgiLCJpYXQiOjE1NDgwNTIwMTZ9.ZFw1pyaTDdL_XRzeidWDQxfa-Jh4wYCfaXUbjrOUtcA" });
