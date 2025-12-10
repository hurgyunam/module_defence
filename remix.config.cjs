/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  tailwind: true, // ← 이거 있어야 Tailwind 빌드됨
  routeExtensions: [".js", ".jsx", ".ts", ".tsx"],

  browserNodeBuiltinsPolyfill: {
    modules: {
      url: true, // Pixi.js 내부에서 사용
      path: true, // 혹시 모를 path 모듈 사용 대비
      util: true, // 일부 Pixi 환경에서 util 필요할 수 있음
    },
  },
};
