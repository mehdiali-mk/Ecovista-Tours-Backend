import test from "node:test";
import assert from "node:assert/strict";

import {
  buildConnectionString,
  resolveDnsServers,
} from "../configs/connectDB.js";

test("buildConnectionString replaces the password placeholder safely", () => {
  const uri = buildConnectionString(
    "mongodb+srv://user:<db_password>@cluster.mongodb.net/test",
    "secret-pass",
  );

  assert.equal(uri, "mongodb+srv://user:secret-pass@cluster.mongodb.net/test");
});

test("buildConnectionString throws when a database URL is missing", () => {
  assert.throws(() => buildConnectionString(undefined, "secret-pass"), {
    message: /DATABASE_CONNECTION_STRING|MONGODB_URI/i,
  });
});

test("resolveDnsServers reads explicit DNS servers without depending on NODE_ENV", () => {
  const result = resolveDnsServers("8.8.8.8, 8.8.4.4");
  assert.deepEqual(result, ["8.8.8.8", "8.8.4.4"]);
});
