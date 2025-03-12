import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';

import { WEBGL } from './webgl'

if (WEBGL.isWebGLAvailable()) {
  
  // 장면
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // 카메라
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2;

  // 렌더러
  const renderer = new THREE.WebGLRenderer({
    alpha : true,
    antialias : true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  // 빛
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0,2,12);
  scene.add(pointLight);

  //텍스처 추가
  const textureLoader = new THREE.TextureLoader();
  const textureBaseColor = textureLoader.load('../static/img/Stone_Path_008_basecolor.jpg');
  const textureNormalMap = textureLoader.load('../static/img/Stone_Path_008_normal.jpg');
  const textureHeightMap = textureLoader.load('../static/img/Stone_Path_008_height.png');
  const textureRoughnessMap = textureLoader.load('../static/img/Stone_Path_008_roughness.jpg');
  


  // 도형 추가
  const geometry = new THREE.SphereGeometry(0.3,32,16);
  const material01 = new THREE.MeshStandardMaterial({
    map : textureBaseColor,
  });
  const obj01 = new THREE.Mesh(geometry, material01);
  obj01.position.x = -1.5,
  scene.add(obj01);

  const material02 = new THREE.MeshStandardMaterial({
    map : textureBaseColor,
    normalMap : textureNormalMap,
  });
  const obj02 = new THREE.Mesh(geometry, material02);
  obj02.position.x = -0.5,
  scene.add(obj02);
;
  const material03 = new THREE.MeshStandardMaterial({
    map : textureBaseColor,
    normalMap : textureNormalMap,
    displacementMap : textureHeightMap,
    displacementScale : 0.05
  });
  const obj03 = new THREE.Mesh(geometry, material03);
  obj03.position.x = +0.5,
  scene.add(obj03);

  const material04 = new THREE.MeshStandardMaterial({
    map : textureBaseColor,
    normalMap : textureNormalMap,
    displacementMap : textureHeightMap,
    displacementScale : 0.05,
    roughnessMap : textureRoughnessMap,
    roughness : 0.8,
  });
  const obj04 = new THREE.Mesh(geometry, material04);
  obj04.position.x = +1.5,
  scene.add(obj04);

 
  function render(time){
    time *= 0.001;

    obj01.rotation.y += 0.01;
    obj02.rotation.y += 0.01;
    obj03.rotation.y += 0.01;
    obj04.rotation.y += 0.01;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);


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
