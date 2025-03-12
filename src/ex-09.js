import * as THREE from 'three';  // Three.js 라이브러리 가져오기
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';  // OrbitControls로 카메라 조작 기능 가져오기

// HTML의 container와 canvas 요소 가져오기
const container = document.querySelector('.container');
const boxCanvas = document.querySelector('#box-canvas');

// 박스의 기본 파라미터와 관련된 요소들 정의
let box = {
    params: {
        width: 60,   // 박스의 너비
        length: 45,  // 박스의 길이
        depth: 45,   // 박스의 깊이
        thickness: 1, // 박스 두께
        flapGap: 0.0  // 플랩 사이의 간격
    },
    els: {
        group: new THREE.Group(),  // 박스를 구성할 요소들을 그룹화한 객체
        backHalf: {  // 뒤쪽 절반 박스
            width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
            length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() }
        },
        frontHalf: {  // 앞쪽 절반 박스
            width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
            length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() }
        }
    },
    animated: {
        openingAngle: 0,  // 박스가 열리는 애니메이션의 각도
    }
};

// 전역 변수들 정의
let renderer, scene, camera, orbit, lightHolder;

// 앱 초기화 실행
initScene();
window.addEventListener('resize', updateSceneSize);  // 화면 크기 변경 시 업데이트

// --------------------------------------------------
// Three.js 씬 초기화
function initScene() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: boxCanvas });  // 렌더러 초기화
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // 디바이스의 픽셀 비율 설정

    scene = new THREE.Scene();  // 씬 생성
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 10, 1000);  // 카메라 설정
    camera.position.set(0, 20, 140);  // 카메라 위치 설정

    updateSceneSize();  // 초기 화면 크기 업데이트
    scene.add(box.els.group);  // 씬에 박스 그룹 추가
    setGeometryHierarchy();  // 박스의 기하학적 구조 설정

    // 조명 추가
    addLights();
    // 카메라 조작을 위한 OrbitControls 설정
    setupOrbitControls();
    // 박스 메쉬 생성
    createBoxElements();
    // 패널 위치 업데이트
    updatePanelsTransform();
    // 렌더링 시작
    render();
    
    // 박스의 기본 재질 설정
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x9C8D7B), side: THREE.DoubleSide });
    box.els.group.traverse(c => { if (c.isMesh) c.material = material; });  // 박스의 각 메쉬에 재질 적용

    const textureLoader = new THREE.TextureLoader();  // 텍스처 로더 생성
    const material02 = new THREE.MeshStandardMaterial({
        map: textureLoader.load('./static/img/boxTexture.jpg'),  // 텍스처 적용
        side: THREE.DoubleSide
    });
    // 박스의 메쉬에 두 번째 재질 적용
    box.els.group.traverse(c => {
        if (c.isMesh) {
            c.material = material02;
        }
    });
}

// --------------------------------------------------
// 씬에 조명 추가
function addLights() {
    // 주변광(Ambient Light) 추가: 씬 전체에 일정한 밝기를 제공
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);  // 밝기 0.55로 설정
    scene.add(ambientLight);
    
    lightHolder = new THREE.Group();  // 조명을 담을 그룹 생성

    // 포인트 라이트(Point Light) 추가: 특정 위치에서 빛을 방출
    const topLight = new THREE.PointLight(0xffffff, 0.5);  // 강도 0.5로 설정
    topLight.position.set(150, 150, 30);  // 위치 설정
    lightHolder.add(topLight);

    const sideLight = new THREE.PointLight(0xffffff, 0.55);  // 강도 0.55로 설정
    sideLight.position.set(50, 0, 150);  // 위치 설정
    lightHolder.add(sideLight);

    scene.add(lightHolder);  // 씬에 라이트 추가
}

// --------------------------------------------------
// OrbitControls 설정 (카메라 이동, 확대/축소, 회전)
function setupOrbitControls() {
    orbit = new OrbitControls(camera, boxCanvas);  // 카메라와 캔버스를 연결
    orbit.enableZoom = true;  // 줌 기능 활성화
    orbit.enablePan = true;  // 팬 기능 활성화
    orbit.enableDamping = true;  // 감속 효과 활성화
    orbit.autoRotate = true;  // 자동 회전 활성화
    orbit.autoRotateSpeed = 0.25;  // 자동 회전 속도 설정
}

// --------------------------------------------------
// 씬을 렌더링
function render() {
    orbit.update();  // OrbitControls 업데이트
    lightHolder.quaternion.copy(camera.quaternion);  // 카메라의 쿼터니언 복사 (조명 회전 동기화)
    renderer.render(scene, camera);  // 씬 렌더링
    requestAnimationFrame(render);  // 애니메이션 프레임 요청
}

// --------------------------------------------------
// 화면 크기 조정
function updateSceneSize() {
    camera.aspect = container.clientWidth / container.clientHeight;  // 카메라 비율 업데이트
    camera.updateProjectionMatrix();  // 카메라의 투영 행렬 업데이트
    renderer.setSize(container.clientWidth, container.clientHeight);  // 렌더러 크기 설정
}

// --------------------------------------------------
// 박스의 기하학적 구조 설정
function setGeometryHierarchy() {
    box.els.group.add(
        box.els.frontHalf.width.side,
        box.els.frontHalf.length.side,
        box.els.backHalf.width.side,
        box.els.backHalf.length.side
    );

    // 측면에 플랩 추가
    addFlapsToSides();
}

// --------------------------------------------------
// 플랩을 측면에 추가
function addFlapsToSides() {
    // 플랩을 각각의 측면에 추가
    box.els.frontHalf.width.side.add(box.els.frontHalf.width.top, box.els.frontHalf.width.bottom);
    box.els.frontHalf.length.side.add(box.els.frontHalf.length.top, box.els.frontHalf.length.bottom);
    box.els.backHalf.width.side.add(box.els.backHalf.width.top, box.els.backHalf.width.bottom);
    box.els.backHalf.length.side.add(box.els.backHalf.length.top, box.els.backHalf.length.bottom);
}

// --------------------------------------------------
// 박스 패널의 위치와 회전 업데이트
function updatePanelsTransform() {
    const cos = Math.cos(box.animated.openingAngle);
    const sin = Math.sin(box.animated.openingAngle);

    // 패널의 위치와 회전 값 업데이트
    updatePanelPositions(cos, sin);
    updatePanelRotations();
}

// --------------------------------------------------
// 패널의 위치 업데이트
function updatePanelPositions(cos, sin) {
    // 앞쪽 너비 측면 위치 설정
    box.els.frontHalf.width.side.position.set(0, 0, 0.5 * box.params.length);

    // 뒤쪽 너비 측면 위치 설정
    box.els.backHalf.width.side.position.set(0, 0, -0.5 * box.params.length);

    // 앞쪽 길이 측면 위치 설정 (열리는 애니메이션 적용)
    box.els.frontHalf.length.side.position.set(-0.5 * cos * box.params.width, 0, 0.5 * sin * box.params.width);

    // 뒤쪽 길이 측면 위치 설정 (열리는 애니메이션 적용)
    box.els.backHalf.length.side.position.set(0.5 * cos * box.params.width, 0, -0.5 * sin * box.params.width);
}

// --------------------------------------------------
// 패널의 회전 업데이트
function updatePanelRotations() {
    // 너비 측면 회전 값 설정
    box.els.frontHalf.width.side.rotation.y = box.animated.openingAngle;
    box.els.backHalf.width.side.rotation.y = -box.animated.openingAngle;

    // 길이 측면 회전 값 설정
    box.els.frontHalf.length.side.rotation.y = Math.PI / 2;
    box.els.backHalf.length.side.rotation.y = -Math.PI / 2;

    // 플랩 회전 값 설정
    setFlapRotations();
}

// --------------------------------------------------
// 플랩의 회전 값 설정
function setFlapRotations() {
    const angle = 29.8;

    // 뒤쪽 플랩 회전 값 설정
    box.els.backHalf.width.bottom.rotation.x = angle;
    box.els.backHalf.length.bottom.rotation.x = angle;

    // 앞쪽 플랩 회전 값 설정
    box.els.frontHalf.width.bottom.rotation.x = -angle;
    box.els.frontHalf.length.bottom.rotation.x = angle;

    // 상단 플랩 회전 값 설정
    box.els.backHalf.width.top.rotation.x = 0.5;
    box.els.backHalf.length.top.rotation.x = -angle;
    box.els.frontHalf.width.top.rotation.x = -0.5;
    box.els.frontHalf.length.top.rotation.x = -angle;

    // 플랩 위치 조정
    setFlapPositions();
}

// --------------------------------------------------
// 플랩의 위치 설정
function setFlapPositions() {
    const depthOffset = 0.5 * box.params.depth;
    box.els.backHalf.width.bottom.position.y = -depthOffset;
    box.els.backHalf.length.bottom.position.y = -depthOffset;
    box.els.frontHalf.width.bottom.position.y = -depthOffset;
    box.els.frontHalf.length.bottom.position.y = -depthOffset;
}

// --------------------------------------------------
// 박스의 메쉬(기하학적 형태) 생성
function createBoxElements() {
    // 앞/뒤 및 너비/길이 측면에 대해 반복하여 메쉬 생성
    for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
        for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
            const half = halfIdx ? 'frontHalf' : 'backHalf';  // 앞쪽 또는 뒤쪽 절반
            const side = sideIdx ? 'width' : 'length';  // 너비 또는 길이

            const sideWidth = side === 'width' ? box.params.width : box.params.length;
            const flapWidth = sideWidth - 2 * box.params.flapGap;
            const flapHeight = 0.375 * box.params.width - 0.75 * box.params.flapGap;

            // 각 측면과 플랩의 지오메트리 생성
            createGeometries(half, side, sideWidth, flapWidth, flapHeight);
        }
    }

    updatePanelsTransform();  // 패널 위치 및 회전 업데이트
}

// --------------------------------------------------
// 각 면의 지오메트리 생성
function createGeometries(half, side, sideWidth, flapWidth, flapHeight) {
    const sidePlaneGeometry = new THREE.PlaneGeometry(sideWidth, box.params.depth);  // 측면 지오메트리 생성
    const flapPlaneGeometry = new THREE.PlaneGeometry(flapWidth, flapHeight);  // 플랩 지오메트리 생성

    const sideGeometry = sidePlaneGeometry.clone();  // 측면 지오메트리 복제
    const topGeometry = flapPlaneGeometry.clone();  // 플랩 지오메트리 복제
    const bottomGeometry = flapPlaneGeometry.clone();  // 플랩 지오메트리 복제

    // 플랩의 위치 조정
    topGeometry.translate(0, 0.5 * flapHeight, 0);
    bottomGeometry.translate(0, -0.5 * flapHeight, 0);

    // 각 면의 지오메트리 설정
    box.els[half][side].top.geometry = topGeometry;
    box.els[half][side].side.geometry = sideGeometry;
    box.els[half][side].bottom.geometry = bottomGeometry;

    // 플랩의 초기 위치 설정
    box.els[half][side].top.position.y = 0.5 * box.params.depth;
    box.els[half][side].bottom.position.y = -0.5 * box.params.depth;
}
