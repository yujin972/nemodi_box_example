import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  WEBGL
 } from './webgl'

if (WEBGL.isWebGLAvailable()) {
  
  // 장면
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // 카메라 추가
  const fov = 120;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov,aspect,near,far);

  camera.position.x = 0;
  camera.position.y = 0.1;
  camera.position.z = 1.8;
  camera.lookAt(new THREE.Vector3(0,0,0));

  // 렌더러 추가
  const renderer = new THREE.WebGLRenderer({
    alpha : true,
    antialias : true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 도형 추가
  const geometry = new THREE.SphereGeometry(0.5,32,16);
  const material = new THREE.MeshStandardMaterial({
    color : 0xffffff
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.rotation.y = 0.5;
  cube.position.y = 0.5;
  scene.add(cube);

  // 바닥 추가
  const planeGeometry = new THREE.PlaneGeometry(20,20,1,1);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff
  });
  const plane = new THREE.Mesh(planeGeometry,planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.y = -0.2;
  scene.add(plane);

  // 빛
  const ambientLight = new THREE.AmbientLight(0xffffff,0.1);
  //scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1,1,1);
  const dlHelper = new THREE.DirectionalLightHelper(directionalLight,0.2,0x0000ff);
  //scene.add(dlHelper);
  //scene.add(directionalLight);

  const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xff0000, 1);
  //scene.add(hemisphereLight);

  const pointLight = new THREE.PointLight(0xffffff,1);
  //scene.add(pointLight);
  pointLight.position.set(-2,0.5,0.5);
  const plHelper = new THREE.PointLightHelper(pointLight,0.1);
  //scene.add(plHelper);

  const rectLight = new THREE.RectAreaLight(0xffffff, 2, 1, 1);
  //scene.add(rectLight);
  rectLight.position.set(0.5,0.5,1);
  rectLight.lookAt(0,0,0);

  const spotLight = new THREE.SpotLight(0xffffff, 0.5);
  scene.add(spotLight);

  //const pointLight = new THREE.PointLight(0xffffbb, 1);
  //pointLight.position.set(0,2,12);
  //scene.add(pointLight);
 

  function render(time){
    renderer.render(scene, camera);
  }
  requestAnimationFrame(render);


  // OrbitControls 추가 (카메라 조작 가능)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 애니메이션 루프
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  //반응형 처리
  function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize',onWindowResize);

} else {
  var warning = WEBGL.getWebGLErrorMessage()
  document.body.appendChild(warning)
}
