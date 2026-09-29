Motion Fall Lab — local vendor files

This folder intentionally contains local, pinned runtime modules so the demo does not depend on a CDN at runtime.

Pinned modules
- three.module.js and three.core.js: Three.js 0.186.1 ES module build
- cannon-es.js: cannon-es 0.20.0 ES module build
- OrbitControls.js: Three.js examples control module, pinned with Three.js 0.186.1
- RoomEnvironment.js: Three.js examples procedural studio environment, pinned with Three.js 0.186.1
- RGBELoader.js and HDRLoader.js: Three.js examples HDR pipeline and its local dependency
- GLTFLoader.js: optional Three.js GLB/GLTF character loader
- utils/BufferGeometryUtils.js and utils/SkeletonUtils.js: local GLTFLoader dependencies

Attribution and licensing
- Three.js and its examples modules are distributed under the MIT License.
  https://github.com/mrdoob/three.js/blob/dev/LICENSE
- cannon-es is distributed under the MIT License.
  https://github.com/pmndrs/cannon-es/blob/master/LICENSE

If updating a vendor file, update the version notes above and the service-worker cache version in ../sw.js. Keep import specifiers local or mapped by the import map in ../index.html; do not restore CDN imports for production/offline builds.
