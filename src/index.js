import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const container = document.querySelector('.three-wrap');
const boxCanvas = document.querySelector('#box-canvas');

// 박스 파라미터와 요소들
let box = {
    params: {
        width: 60, length: 45, depth: 45, thickness: 1, flapGap: 0.3
    },
    els: {
        group: new THREE.Group(),
        backHalf: {
            width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
            length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() }
        },
        frontHalf: {
            width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
            length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() }
        }
    },
    animated: {
        openingAngle: 0,
    }
};

// 글로벌 변수
let renderer, scene, camera, orbit, lightHolder;
let textures = {}; // 텍스처를 저장할 객체

// 앱 실행
initScene();
window.addEventListener('resize', updateSceneSize);

// --------------------------------------------------
// 씬 초기화
function initScene() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: boxCanvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 10, 1000);
    camera.position.set(0, 60, 140);
    scene.add(box.els.group);
    setGeometryHierarchy();
    addLights();
    setupOrbitControls();
    createBoxElements();
    updatePanelsTransform();
    render();
    updateSceneSize();
    loadTextures();
}

// 조명 설정
function addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, 0.45);
    topLight.position.set(150, 150, 30);
    const sideLight = new THREE.PointLight(0xffffff, 0.45); 
    sideLight.position.set(50, 0, 150); 
    lightHolder = new THREE.Group();
    lightHolder.add(topLight);
    lightHolder.add(sideLight);
    scene.add(lightHolder);
}

// OrbitControls 설정
function setupOrbitControls() {
    orbit = new OrbitControls(camera, boxCanvas);
    orbit.enableZoom = true;
    orbit.enablePan = true;
    orbit.enableDamping = true;
    orbit.autoRotate = true;
    orbit.autoRotateSpeed = -1;
}

// 씬 렌더링
function render() {
    orbit.update();
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// 씬 크기 업데이트
function updateSceneSize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 상자 기하학 설정
function setGeometryHierarchy() {
    box.els.group.add(box.els.frontHalf.width.side, box.els.frontHalf.length.side, box.els.backHalf.width.side, box.els.backHalf.length.side);
    addFlapsToSides();
}

// 플랩을 각 면에 추가
function addFlapsToSides() {
    box.els.frontHalf.width.side.add(box.els.frontHalf.width.top, box.els.frontHalf.width.bottom);
    box.els.frontHalf.length.side.add(box.els.frontHalf.length.top, box.els.frontHalf.length.bottom);
    box.els.backHalf.width.side.add(box.els.backHalf.width.top, box.els.backHalf.width.bottom);
    box.els.backHalf.length.side.add(box.els.backHalf.length.top, box.els.backHalf.length.bottom);
}

// 패널의 위치 및 회전 업데이트
function updatePanelsTransform() {
    const cos = Math.cos(box.animated.openingAngle);
    const sin = Math.sin(box.animated.openingAngle);
    updatePanelPositions(cos, sin);
    updatePanelRotations();
}

// 패널 위치 업데이트
function updatePanelPositions(cos, sin) {
    box.els.frontHalf.width.side.position.set(0, 0, 0.5 * box.params.length);
    box.els.backHalf.width.side.position.set(0, 0, -0.5 * box.params.length);
    box.els.frontHalf.length.side.position.set(-0.5 * cos * box.params.width, 0, 0.5 * sin * box.params.width);
    box.els.backHalf.length.side.position.set(0.5 * cos * box.params.width, 0, -0.5 * sin * box.params.width);
}

// 패널 회전 업데이트
function updatePanelRotations() {
    box.els.frontHalf.width.side.rotation.y = box.animated.openingAngle;
    box.els.backHalf.width.side.rotation.y = -box.animated.openingAngle;
    box.els.frontHalf.length.side.rotation.y = Math.PI / 2;
    box.els.backHalf.length.side.rotation.y = -Math.PI / 2;
    setFlapRotations();
}

// 플랩 회전 설정
function setFlapRotations() {
    const angle = 29.85;
    box.els.backHalf.width.bottom.rotation.x = angle;
    box.els.backHalf.length.bottom.rotation.x = angle;
    box.els.frontHalf.width.bottom.rotation.x = -angle;
    box.els.frontHalf.length.bottom.rotation.x = angle;
    box.els.backHalf.width.top.rotation.x = 0.5;
    box.els.backHalf.length.top.rotation.x = -angle;
    box.els.frontHalf.width.top.rotation.x = -0.5;
    box.els.frontHalf.length.top.rotation.x = -angle;
    setFlapPositions();
}

// 플랩 위치 설정
function setFlapPositions() {
    const depthOffset = 0.5 * box.params.depth;
    box.els.backHalf.width.bottom.position.y = -depthOffset;
    box.els.backHalf.length.bottom.position.y = -depthOffset+1;
    box.els.frontHalf.width.bottom.position.y = -depthOffset;
    box.els.frontHalf.length.bottom.position.y = -depthOffset+1;

}

// 상자 요소 생성
function createBoxElements() {
    for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
        for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
            const half = halfIdx ? 'frontHalf' : 'backHalf';
            const side = sideIdx ? 'width' : 'length';
            const sideWidth = side === 'width' ? box.params.width : box.params.length;
            const flapWidth = sideWidth - 2 * box.params.flapGap;
            const flapHeight = 0.375 * box.params.width - 0.75 * box.params.flapGap;
            createGeometries(half, side, sideWidth, flapWidth, flapHeight);
        }
    }
    updatePanelsTransform();
}

// 텍스처 로드
function loadTextures() {

    const defaultTexture = new THREE.TextureLoader();
    const boxTexture = defaultTexture.load('./static/img/box.jpg');

    const material = new THREE.MeshStandardMaterial({ map: boxTexture, side: THREE.DoubleSide });

    box.els.group.traverse(c => { if (c.isMesh) c.material = material; });



    const textureLoader = new THREE.TextureLoader();
    const textures = {
        front: textureLoader.load('./static/img/front.jpg'),// 앞면
        back: textureLoader.load('./static/img/back.jpg'),// 뒷면
        frontTop: textureLoader.load('./static/img/top01.jpg'),// 윗면01
        backTop: textureLoader.load('./static/img/top02.jpg'),// 윗면02
        frontBottom: textureLoader.load('./static/img/bottom01.jpg'),// 아랫면01
        backBottom: textureLoader.load('./static/img/bottom02.jpg'),// 아랫면02
        left: textureLoader.load('./static/img/left.jpg'),// 왼쪽
        right: textureLoader.load('./static/img/right.jpg')// 오른쪽
    };

    const materials = {
        front: new THREE.MeshStandardMaterial({ map: textures.front, side: THREE.DoubleSide }),
        back: new THREE.MeshStandardMaterial({ map: textures.back, side: THREE.DoubleSide }),
        frontTop: new THREE.MeshStandardMaterial({ map: textures.frontTop, side: THREE.DoubleSide }),
        backTop: new THREE.MeshStandardMaterial({ map: textures.backTop, side: THREE.DoubleSide }),
        frontBottom: new THREE.MeshStandardMaterial({ map: textures.frontBottom, side: THREE.DoubleSide }),
        backBottom: new THREE.MeshStandardMaterial({ map: textures.backBottom, side: THREE.DoubleSide }),
        left: new THREE.MeshStandardMaterial({ map: textures.left, side: THREE.DoubleSide }),
        right: new THREE.MeshStandardMaterial({ map: textures.right, side: THREE.DoubleSide })
    };

    // 박스의 각 메시에 개별적으로 텍스처 적용
    // 앞면과 뒷면 설정
    box.els.frontHalf.width.side.material = materials.front;
    box.els.backHalf.width.side.material = materials.back;

    // 앞면과 뒷면의 윗면
    box.els.frontHalf.width.top.material = materials.frontTop;
    box.els.backHalf.width.top.material = materials.backTop;

    // 앞면과 뒷면의 아랫면
    box.els.frontHalf.width.bottom.material = materials.frontBottom;
    box.els.backHalf.width.bottom.material = materials.backBottom;

    // 좌우면 설정
    box.els.frontHalf.length.side.material = materials.left;
    box.els.backHalf.length.side.material = materials.right;

}


// 기하학 생성 함수
function createGeometries(half, side, sideWidth, flapWidth, flapHeight) {
    const topGeometry = createGeometry(flapWidth, flapHeight); 
    const sideGeometry = createGeometry(sideWidth, box.params.depth);  
    const bottomGeometry = createGeometry(flapWidth, flapHeight);   
    const bottomFlapGeometry = createGeometry(flapWidth,flapHeight);  
    const widthDepthGeometry = createGeometry(box.params.length,box.params.depth);  

    // 각 면의 기하학 설정
    box.els[half][side].top.geometry = topGeometry;
    box.els[half][side].side.geometry = sideGeometry;
    box.els[half][side].bottom.geometry = bottomGeometry;

    // 위치 설정
    setGeometryPosition(topGeometry, 0, 0.5 * flapHeight, 0);
    setGeometryPosition(bottomGeometry, 0, -0.5 * flapHeight, 0);

    // 복사본 추가
    addClonedMesh(topGeometry, box.els[half][side].top.material, { x: 0, y: 22.5, z: 22.4 }, -0.5); //윗면01 복제
    addClonedMesh(topGeometry, box.els[half][side].top.material, { x: 0, y: 22.5, z: -22.4 }, 0.5); //윗면02 복제
    addClonedMesh(sideGeometry, box.els[half][side].top.material, { x: 0, y: 0, z: -22.4 },0); //뒷면 복제
    addClonedMesh(sideGeometry, box.els[half][side].top.material, { x: 0, y: 0, z: 22.4 },0); //앞면 복제
    addClonedMesh(bottomFlapGeometry, box.els[half][side].top.material, { x: 0, y: -22.4, z: 11.3 },4.71); //아랫면 01 복제
    addClonedMesh(bottomFlapGeometry, box.els[half][side].top.material, { x: 0, y: -22.4, z: -11.3 },4.71); //아랫면 02 복제
    addClonedMesh(widthDepthGeometry, box.els[half][side].top.material, { x: -29.4, y: 0, z: 0 }, 0, Math.PI / 2); // 왼쪽 복제
    addClonedMesh(widthDepthGeometry, box.els[half][side].top.material, { x: 29.4, y: 0, z: 0 }, 0, Math.PI / 2); // 오른쪽 복제

    // 최종 위치 설정
    box.els[half][side].top.position.y = 0.5 * box.params.depth;
    box.els[half][side].bottom.position.y = -0.5 * box.params.depth;
}

// 기하학 생성 헬퍼 함수
function createGeometry(width, height) {
    return new THREE.PlaneGeometry(width, height);
}

// 위치 설정 함수
function setGeometryPosition(geometry, x, y, z) {
    geometry.translate(x, y, z);
}

// 복사본 추가 함수
function addClonedMesh(geometry, material, position, rotationX, rotationY = 0) {
    const clonedMesh = new THREE.Mesh(geometry.clone(), material);
    clonedMesh.position.set(position.x, position.y, position.z);
    clonedMesh.rotation.x = rotationX;
    clonedMesh.rotation.y = rotationY;
    box.els.group.add(clonedMesh);
}

