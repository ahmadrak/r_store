const test = require("node:test");
const assert = require("node:assert/strict");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("anonymous requests are rejected", () => {
  const res = response();
  let nextCalled = false;
  ensureAuthenticated({ isAuthenticated: () => false }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("authenticated requests pass", () => {
  const res = response();
  let nextCalled = false;
  ensureAuthenticated({ isAuthenticated: () => true }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test("non-admin users cannot access admin endpoints", () => {
  const res = response();
  let nextCalled = false;
  ensureAdmin({ user: { role: "user" } }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("admins can access admin endpoints", () => {
  const res = response();
  let nextCalled = false;
  ensureAdmin({ user: { role: "admin" } }, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});
