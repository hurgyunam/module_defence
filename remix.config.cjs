/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  tailwind: true, // ← 이거 있어야 Tailwind 빌드됨
};
