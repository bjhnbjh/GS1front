// ✅ React에서 제공하는 핵심 기능들을 불러옵니다.
import React, {
    useEffect,      // 📌 화면이 처음 렌더링되거나 특정 값이 바뀔 때 실행되는 side effect 정의 (React에서 제공)
    useRef,         // 📌 HTML 요소를 직접 참조하기 위해 사용 (DOM 접근) (React에서 제공)
    useState,       // 📌 컴포넌트 내부의 상태 값을 정의하고 갱신할 수 있는 hook (React에서 제공)
    useCallback     // 📌 함수를 메모이제이션해서 렌더링 시 재생성 방지 (React에서 제공)
} from 'react';

// ✅ video.js 라이브러리 import (외부 라이브러리)
// HTML5 <video> 태그를 고급스럽게 제어할 수 있는 오픈소스 비디오 플레이어
import videojs from 'video.js';

// ✅ video.js UI에 필요한 CSS 파일 불러오기
import 'video.js/dist/video-js.css'; // 재생 버튼, 타임바 등 video.js UI 구성에 필요

// ✅ 이 컴포넌트 전용 스타일시트 (애니메이션, 배치 등)
import './BarcodeIntro.css';
// import { use } from 'video.js/dist/types/tech/middleware';


// ✅ BarcodeIntro: React 함수형 컴포넌트 정의
const BarcodeIntro = () => {
    // ✅ HTML 요소 참조용 useRef 훅 선언
    const logoRef = useRef(null);     // 로고 텍스트 영역 (<div className="logo">)
    const lineRef = useRef(null);     // 빨간 스캔 라인 (<div className="scan-line">)
    const videoRef = useRef(null);    // <video> 요소 직접 참조
    const playerRef = useRef(null);   // video.js에서 생성된 플레이어 인스턴스 저장

    // ✅ useState 훅으로 동적인 상태들을 정의
    const [started, setStarted] = useState(false);           // START 버튼 클릭 여부
    const [scanned, setScanned] = useState(false);           // 스캔 애니메이션 실행 여부
    const [showPopup, setShowPopup] = useState(false);       // 오른쪽 팝업 패널 열림 여부
    const [showVideo, setShowVideo] = useState(false);       // 영상 영역 표시 여부
    const [isFullScreen, setIsFullScreen] = useState(false); // 현재 전체화면 상태인지 여부
    const [objectClicked, setObjectClicked] = useState(false);            // JSON에서 불러온 아이템 리스트
    const [gs1url, setgs1url] = useState("");            // JSON에서 불러온 아이템 리스트
    const [itemList, setItemList] = useState([]);            // JSON에서 불러온 아이템 리스트
    const [selectedIndex, setSelectedIndex] = useState(null);// 클릭된 항목 인덱스 (펼치기용)

    // ✅ 팝업이 열릴 때마다 video.js의 크기를 다시 계산해줌
    useEffect(() => {
        const timer = setTimeout(() => {
            if (playerRef.current) {
                playerRef.current.trigger('resize'); // video.js에서 크기 갱신
            }
        }, 400); // 0.4초 후 실행

        return () => clearTimeout(timer); // 타이머 정리
    }, [showPopup]); // showPopup이 변경될 때 실행

    // ✅ 전체화면 진입 함수 (브라우저 호환성 포함)
    // const enterFullScreen = () => {
    //     const elem = document.documentElement;
    //     if (elem.requestFullscreen) elem.requestFullscreen();
    //     else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    //     else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    // };

    // ✅ 스캔 애니메이션 실행 함수 (스페이스바 또는 조건 만족 시 실행)
    const handleScan = useCallback(() => {
        if (!scanned && logoRef.current?.classList.contains('show')) {
            setScanned(true); // 스캔 시작 표시
            // lineRef.current?.classList.add('show'); // 스캔 선 보여줌

            setTimeout(() => {
                logoRef.current?.classList.add('hide'); // 로고 사라짐
                logoRef.current?.addEventListener('transitionend', () => {
                    logoRef.current.style.display = 'none';     // 완전히 숨김
                    // lineRef.current.style.display = 'none';
                    setShowVideo(true); // 영상 표시 상태로 전환
                }, { once: true }); // transition 끝날 때 1회 실행
            }, 1000); // 4초 후 실행
        }
    }, [scanned]);

    // ✅ 영상이 표시되면 video.js 플레이어 초기화
    useEffect(() => {
        if (showVideo && videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, {
                controls: true,    // 기본 컨트롤 버튼 표시
                autoplay: true,    // 자동 재생
                preload: 'auto',   // 미리 로딩
                muted: false,
                fluid: false        // 반응형 레이아웃
            });

            playerRef.current.ready(() => {
                playerRef.current.play().catch(err => {
                    console.warn('Autoplay 실패:', err);
                });
            });
        }

        // 컴포넌트 언마운트 시 리소스 정리
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose(); // 메모리 해제
                playerRef.current = null;
            }
        };
    }, [showVideo]);

    // ✅ 스페이스바로 스캔 또는 재생/정지 토글 처리
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // 기본 스크롤 방지

                if (!scanned && logoRef.current?.classList.contains('show')) {
                    handleScan();
                } else if (playerRef.current && playerRef.current.readyState() >= 2) {
                    if (playerRef.current.paused()) {
                        playerRef.current.play();
                    } else {
                        playerRef.current.pause();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleScan, scanned]);

    // ✅ 전체화면 진입/이탈 감지 (브라우저 이벤트)
    // useEffect(() => {
    //     const handleFullScreenChange = () => {
    //         const isFullScreenNow =
    //             document.fullscreenElement ||
    //             document.webkitFullscreenElement ||
    //             document.mozFullScreenElement ||
    //             document.msFullscreenElement;
    //         setIsFullScreen(!!isFullScreenNow); // true/false 저장
    //     };

    //     document.addEventListener("fullscreenchange", handleFullScreenChange);
    //     document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    //     document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    //     document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    //     return () => {
    //         document.removeEventListener("fullscreenchange", handleFullScreenChange);
    //         document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
    //         document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
    //         document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
    //     };
    // }, []);

    // ✅ JSON 데이터 불러오기
    useEffect(() => {
        if (objectClicked && gs1url) {
            fetch(gs1url.split("https://id.oliot.org")[1] + "?linkType=linkset")
                .then((res) => res.json())
                .then((data) => {
                    console.log('✅ JSON 구조:', data);
                    setItemList([data]); // 하나의 객체라도 배열로 만들어 map 사용 가능하게
                })

                .catch((err) => console.error('❌ JSON 로딩 실패:', err));
        }
    }, [objectClicked]);

    useEffect(() => {
        console.log('showVideo:', showVideo);
        if (showVideo) {
            const player = videojs("my-video");
            const video = document.getElementById('my-video');

            const canvas = document.getElementById("overlay");
            const canvas2 = document.getElementById("overlay2");
            const ctx = canvas.getContext("2d");
            const ctx2 = canvas2.getContext("2d");

            const syncCanvasSize = () => {
                const rect = video.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
                canvas2.width = rect.width;
                canvas2.height = rect.height;
                canvas2.style.width = `${rect.width}px`;
                canvas2.style.height = `${rect.height}px`;
            };

            syncCanvasSize(); // 최초 실행
            window.addEventListener('resize', syncCanvasSize); // 창 크기 변경 대응

            let currentPolygons = []; // cue마다 저장된 폴리곤 정보들

            function drawPolygonGlow(currentCtx, polygon, level = 3) {
                currentCtx.beginPath();
                // ctx.moveTo(polygon[0][0] * width, polygon[0][1] * height);
                polygon.slice(1).forEach(([x, y]) => {
                    currentCtx.lineTo(x, y);
                });
                currentCtx.closePath();
                currentCtx.stroke();

                // 후광 효과 (파란색)
                currentCtx.shadowColor = "rgba(0, 250, 255, 1)";
                currentCtx.shadowBlur = 20;
                currentCtx.shadowOffsetX = 0;
                currentCtx.shadowOffsetY = 0;

                currentCtx.strokeStyle = "rgba(0, 150, 255, 1)"; // 거의 보이지 않는 선
                currentCtx.lineWidth = level;
                currentCtx.stroke();

                // shadow 사용 후 반드시 리셋
                currentCtx.shadowBlur = 0;
                currentCtx.shadowColor = "transparent";
            }
            function drawPolygonGlowSelected(currentCtx, polygon, level = 7) {
                currentCtx.beginPath();
                // currentCtx.moveTo(polygon[0][0] * width, polygon[0][1] * height);
                polygon.slice(1).forEach(([x, y]) => {
                    currentCtx.lineTo(x, y);
                });
                currentCtx.closePath();
                currentCtx.stroke();

                // 후광 효과 (파��색)
                currentCtx.shadowColor = "rgba(0, 250, 255, 1)";
                currentCtx.shadowBlur = 10;
                currentCtx.shadowOffsetX = 0;
                currentCtx.shadowOffsetY = 0;

                currentCtx.strokeStyle = "rgba(0, 150, 255, 1)"; // 거의 보이지 않는 선
                currentCtx.lineWidth = level;
                currentCtx.stroke();

                // shadow 사용 후 반드시 리셋
                currentCtx.shadowBlur = 0;
                currentCtx.shadowColor = "transparent";
            }
            let clickHandler = null;

            player.ready(() => {
                const track = player.textTracks()[0];
                track.mode = "hidden";

                track.addEventListener("cuechange", () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx2.clearRect(0, 0, canvas.width, canvas.height);
                    currentPolygons = [];

                    const cues = Array.from(track.activeCues);

                    let scaledPolygon = []; // 현재 활성화된 폴리곤들
                    let data = {}; // 현재 활성화된 폴리곤의 데이터

                    for (let cue of cues) {
                        data = JSON.parse(cue.text);
                        const rect = canvas.getBoundingClientRect();
                        const originalPolygon = data.polygon[0];
                        scaledPolygon = originalPolygon.map(([x, y]) => [
                            x * (rect.width / 1280),
                            y * (rect.height / 720)
                        ]);

                        drawPolygonGlow(ctx, scaledPolygon);
                        currentPolygons.push({ scaledPolygon, cue });
                    }

                    // 이전 핸들러 제거
                    if (clickHandler) {
                        canvas.removeEventListener('click', clickHandler);
                    }

                    // 새로운 핸들러 정의
                    clickHandler = function (e) {
                        const rect = canvas2.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        for (const { scaledPolygon } of currentPolygons) {
                            ctx2.beginPath();
                            ctx2.moveTo(scaledPolygon[0][0], scaledPolygon[0][1]);
                            for (let i = 1; i < scaledPolygon.length; i++) {
                                ctx2.lineTo(scaledPolygon[i][0], scaledPolygon[i][1]);
                            }
                            ctx2.closePath();
                            // setShowPopup(false);
                            setObjectClicked(false);
                            setSelectedIndex(null); // 클릭 시 선택된 인덱스 초기화
                            playerRef.current?.pause();
                            if (ctx2.isPointInPath(x, y)) {
                                setTimeout(() => {
                                    setShowPopup(true);
                                    setgs1url(data.gs1Link)
                                    setObjectClicked(true);
                                    console.log('Polygon clicked:', gs1url);
                                    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                                    drawPolygonGlowSelected(ctx2, scaledPolygon, 5);
                                }, 50);
                                break;
                            }
                        }
                    };
                    canvas2.addEventListener('click', clickHandler);
                });
            });
            return () => window.removeEventListener('resize', syncCanvasSize);
        }
    }, [showVideo, showPopup]);

    useEffect(() => {

    }, []);


    // ✅ 화면 렌더링
    return (
        <div className={`App ${showPopup ? 'sidebar-is-open' : ''}`}>
            {/* 시작 버튼 */}
            {!started && (
                <button className="start-btn" onClick={() => {
                    // enterFullScreen();
                    setStarted(true);
                    logoRef.current?.classList.add('show');
                    // 스페이스바 입력 없이 바로 스캔 진행
                    setTimeout(() => {
                        handleScan();
                    }, 1500); // 로고가 나타난 후 1.5초 뒤 자동 진행
                }}>
                    START
                </button>
            )}

            {/* 전체화면 재진입 버튼 */}
            {/* {!isFullScreen && started && (
                <button className="start-btn reenter-fullscreen" onClick={enterFullScreen}>
                    전체화면 재진입
                </button>
            )} */}

            {/* 로고 및 스캔 줄 */}
            <div className="logo" ref={logoRef}>KAIST & GS1 Media</div>
            {/* <div className="scan-line" ref={lineRef}></div> */}

            <div>
                {/* 비디오 플레이어 영역 */}
                {showVideo && (
                    <div className={`video-container ${showPopup ? 'shrink' : ''} show`} style={{
                        display: 'flex',                        // ✅ 기존과 동일
                        flexDirection: 'row',                   // ✅ 가로 정렬
                        justifyContent: 'center',               // 수평 중앙
                        alignItems: 'center',                   // ✅ 수직 중앙
                        gap: '1rem',                            // ✅ 비디오와 패널 사이 간격
                        width: '100%',
                        height: '100%',
                    }}>
                        <div id="video-container" style={{
                            position: 'relative',
                            aspectRatio: '16 / 9',
                            // width: "100%",
                            // height: "95%",
                            flex: '1',                              // ✅ 가변 크기
                            // maxWidth: showPopup ? '80%' : '100%',         // ✅ 팝업 있을 때만 줄어듦
                            maxWidth: '80%',         // ✅ 팝업 있을 때만 줄어듦
                        }}>
                            <video id="my-video" ref={videoRef} className="video-js vjs-default-skin video show" playsInline>
                                <source src={`${process.env.PUBLIC_URL}/testVid_1.25.mp4`} type="video/mp4" />
                                <track kind="metadata" src={`${process.env.PUBLIC_URL}/gs1media_dl_metadata.vtt`} srcLang="en" label="Polygon" default />
                                <p className="vjs-no-js">
                                    JavaScript를 활성화해야 비디오를 볼 수 있습니다.
                                    <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noreferrer">HTML5 지원 브라우저</a>를 사용하세요.
                                </p>
                            </video>
                            <canvas id="overlay" style={{
                                position: 'absolute',       // ✅ 겹치게 만듦
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                            }}>
                            </canvas>
                            <canvas id="overlay2" style={{
                                position: 'absolute',       // ✅ 겹치게 만듦
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                            }}>
                            </canvas>
                        </div>
                        {/* 오른쪽 바 → 팝업 열기 */}
                        {!showPopup && (
                            <button className="right-bar" onClick={() => {
                                playerRef.current?.pause();
                                setShowPopup(true);
                            }}></button>
                        )}
                        {/* 오른쪽 팝업 영역 */}
                        <div style={{ height: '100%', width: !showPopup ? '0%' : '19%', borderRadius: '10px', overflow: 'hidden', transition: 'width 0.3s ease' }}>
                            {showPopup && (
                                <div className="popup-panel show" style={{
                                    flex: '0 0 40%',                     // ✅ 오른쪽 고정 폭
                                    height: '100%',
                                    overflowY: 'auto',
                                    backgroundColor: '#f9fafe',
                                    borderLeft: '1px solid #ccc',
                                    padding: '1rem',
                                    boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
                                }}>
                                    <button className="popup-close" onClick={() => {
                                        setShowPopup(false);
                                        playerRef.current?.play();
                                    }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.5rem',
                                            float: 'right',
                                            cursor: 'pointer',
                                            color: '#777',
                                            marginBottom: '1rem',
                                        }}>✕</button>
                                    <h3 style={{ margin: '15px 5px' }}>📦 &nbsp;아래 항목을 선택하세요</h3>
                                    <ul>
                                        {itemList.map((item, idx) => (
                                            <li key={idx} style={{ marginBottom: '1rem' }}>
                                                {/* 상단 버튼: name(제품명) + bye(카테고리) */}
                                                <button
                                                    onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        padding: '0.5rem 1rem',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem',
                                                        textAlign: 'left',
                                                        flexDirection: 'column',
                                                        background: selectedIndex === idx ? '#eef6ff' : '#ffffff',
                                                        border: selectedIndex === idx ? '2px solid #4a90e2' : '1px solid #ccc',
                                                        borderRadius: '10px',
                                                        boxShadow: selectedIndex === idx ? '0 2px 8px rgba(0,0,0,0.58)' : 'none',
                                                        transition: 'all 0.2s ease',
                                                        gap: '0.4rem',
                                                    }}
                                                >
                                                    {item.links?.find(link => link.linkType === 'gs1:relatedImage') && (
                                                        <img className="fit-picture"
                                                            src={item.links.find(link => link.linkType === 'gs1:relatedImage').targetURL}
                                                            alt="제품 이미지"
                                                            style={{ width: '100px', height: 'auto', borderRadius: '8px' }}
                                                        />
                                                    )}
                                                    <span style={{ paddingTop: '0.9rem', fontWeight: 'bold', fontSize: '1.3rem', color: '#222' }}>🏷️ {item.entryTitle}</span> {/* 제품 이름 */}
                                                    <p style={{ fontSize: '1.0rem', color: '#666' }}>{item.originalPath}</p> {/* 제품 경로 */}
                                                    <small style={{ fontSize: '0.85rem', fontWeight: '500', color: '#444' }}>{item.description}</small> {/* 카테고리 또는 라벨 */}
                                                </button>

                                                {/* 펼친 내용 영역 */}
                                                {selectedIndex === idx && (
                                                    <div style={{
                                                        marginTop: '0.8rem',
                                                        padding: '1rem',
                                                        border: '1px solid #d0d0d0',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#fff',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                                    }}>
                                                        {/* links 배열 표시 */}
                                                        <h4 style={{ margin: '15px 5px' }}>📋 &nbsp;GS1 디지털링크 서비스 리스트</h4>
                                                        {item.links?.map((link, i) => (
                                                            link.linkType !== 'gs1:relatedImage' && (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => window.open(link.targetURL, '_blank', 'noopener,noreferrer')}
                                                                    style={{
                                                                        marginBottom: '0.5rem',
                                                                        padding: '0.7rem 1rem',
                                                                        fontSize: '0.9rem',
                                                                        backgroundColor: '#fefefe',
                                                                        border: '1px solid #ddd',
                                                                        borderRadius: '6px',
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        cursor: 'pointer',
                                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
                                                                    }}
                                                                >
                                                                    🔗 {link.title} ({link.linkType}) ⇢
                                                                </button>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </li>
                                        ))}

                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ✅ 외부에서 이 컴포넌트를 사용할 수 있게 export
export default BarcodeIntro;
