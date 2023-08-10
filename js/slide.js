(function($){  // 매개변수(파라미터 Parameter)
    // 즉시표현함수는 제이쿼리 달러 사인기호의 
    // 외부 플러그인(라이브러리)와 충돌을 피하기 위해 사용하는 함수식

    // 객체(Object 오브젝트) 선언 {} : 섹션별 변수 중복을 피할 수 있다.
    // const obj = new Object(); // 객체 생성자 방식
    //       obj = {}  

    const obj = {  // 객체 리터럴 방식 권장
        init(){  // 대표 메서드
            this.header();
            this.section1();
            this.section2();
            this.section3();
        },
        header(){},
        section1(){
            let cnt=0;
            let setId=0;
            const slideContainer = $('#section1 .slide-container');
            const slideWrap = $('#section1 .slide-wrap');
            const slideView = $('#section1 .slide-view');
            const slideImg = $('#section1 .slide-view .slide img');
            const pageBtn = $('#section1 .page-btn');
            const stopBtn = $('#section1 .stop-btn');
            const playBtn = $('#section1 .play-btn');
            const n = ($('#section1 .slide').length-2)-1;
            let mouseDown = null;
            let mouseUp = null;
            let dragStart = null;
            let dragEnd = null;
            let mDown = false;
            let winW = $(window).innerWidth();
            let sizeX = winW / 2;
            // 1. 슬라이드 창크기에 반응하는 이미지 크기 반응형 만들기
            //    ? = 2560(이미지크기) / 창크기(1903) 최초의 기준비율 고정값 구하기
            const imgRate = 1.345244351;
            // 2. 이미지 translateX(-320px) 반응형 적용하기
            //    ? = 320 / 이미지크기 최초의 기준비율 고정값 구하기
            const transRate = 0.125;

            // 이미지크기 width = 이미지비율 * 창너비
            // 트랜스레이트 translateX(?px)
            slideImg.css({width:imgRate * winW, transform: `translateX(${-(imgRate * winW)*transRate}px)`});

            $(window).resize(function(){
                winW = $(window).innerWidth();
                slideImg.css({width:imgRate * winW, transform: `translateX(${-(imgRate * winW)*transRate}px)`});
            })

            // 터치 스와이프 이벤트
            // 데스크탑 : 마우스 터치 스와이프 이벤트
            // 데스크탑 : 마우스 터치 드래그 앤 드롭
            slideContainer.on({
                mousedown(e){
                    winW = $(window).innerWidth(); // 마우스 다운하면 창너비 가져오기
                    sizeX = winW / 2;
                    console.log(winW);
                    console.log(sizeX);
                    mouseDown = e.clientX; 
                    // 슬라이드랩퍼박스 좌측 좌표값 -1903
                    // 계속 드래그시 슬라이드 박스 좌측값 설정한다.
                    dragStart = e.clientX - (slideWrap.offset().left+winW);  // 좌측끝 0 시작
                    mDown = true; // 1. 드래그 시작 
                    slideView.css({ cursor: 'grabbing' }); // 잡는다 (드래그)
                },
                mouseup(e){
                    mouseUp = e.clientX;        
                    
                    if( mouseDown-mouseUp > sizeX ){ // 900초과 => 900 이하
                        clearInterval(setId); // 클릭시 일시중지
                        if(!slideWrap.is(':animated')){
                            nextCount();
                        }                            
                    }
                    
                    if( mouseDown-mouseUp < -sizeX ){  // -900 미만 => -900이상
                        clearInterval(setId); // 클릭시 일시중지
                        if(!slideWrap.is(':animated')){
                            prevCount();
                        }                            
                    }

                    // -900 >= 이상이고 <= 900 이하이면 원래대로 제자리로 찾아간다.
                    if(  mouseDown-mouseUp >= -sizeX  &&  mouseDown-mouseUp <= sizeX ){
                        mainSlide();
                    }

                    mDown = false;  // 2. 드래그 끝을 알려주는 마우스 업상태
                    slideView.css({ cursor: 'grab' }); // 놓는다 손바닥 펼친다.
                },
                mousemove(e){
                    if(!mDown) return;   // 3. true가 아니면 마우스 다운이 있어야만 드래그 가능                 
                    // if(mDown!==true) return;   // true가 아니면 마우스 다운이 있어야만 드래그 가능                 
                    // if(mDown===false) return;   // false 이면 마우스 다운이 있어야만 드래그 가능                 
                                         
                    dragEnd = e.clientX; // 4. 드래그 끝 좌표값
                    slideWrap.css({left:  dragEnd-dragStart }); // 5. 슬라이드 드래그 이동 디롭( 드래그끝 좌표값 - 드래그시작 좌표값 )
                }
            })

            // slideContainer 영역을 벗어나면  mouseup의 예외처리
            // 데스크탑 도큐먼트에서 예외처리
            $(document).on({
                mouseup(e){
                    if(!mDown) return;
                    mouseUp = e.clientX;        
                    
                    if( mouseDown-mouseUp > sizeX ){
                        clearInterval(setId); // 클릭시 일시중지
                        if(!slideWrap.is(':animated')){
                            nextCount();
                        }                            
                    }
                    
                    if( mouseDown-mouseUp < -sizeX ){
                        clearInterval(setId); // 클릭시 일시중지
                        if(!slideWrap.is(':animated')){
                            prevCount();
                        }                            
                    }
                    if(  mouseDown-mouseUp >= -sizeX  &&  mouseDown-mouseUp <= sizeX ){
                        mainSlide();
                    }

                    mDown = false;  // 2. 드래그 끝을 알려주는 마우스 업상태
                    slideView.css({ cursor: 'grab' }); // 놓는다 손바닥 펼친다.
                }
            });

            // 테블릿 & 모바일 : 손가락(핑거링) 터치 스와이프 이벤트
            // 테블릿 & 모바일 : 손가락(핑거링) 드래그 앤 드롭
            slideContainer.on({
                touchstart(e){
                    winW = $(window).innerWidth(); // 마우스 다운하면 창너비 가져오기
                    sizeX = winW / 2;
                    mouseDown = e.originalEvent.changedTouches[0].clientX; 
                    // 슬라이드랩퍼박스 좌측 좌표값 -1903
                    // 계속 드래그시 슬라이드 박스 좌측값 설정한다.
                    dragStart = e.originalEvent.changedTouches[0].clientX - (slideWrap.offset().left+winW);  // 좌측끝 0 시작
                    mDown = true; // 1. 드래그 시작 
                    slideView.css({ cursor: 'grabbing' }); // 잡는다 (드래그)
                },
                touchend(e){
                    mouseUp = e.originalEvent.changedTouches[0].clientX;        
                    
                    if( mouseDown-mouseUp > sizeX ){ // 900초과 => 900 이하
                        clearInterval(setId); // 클릭시 일시중지
                        if(!slideWrap.is(':animated')){
                            nextCount();
                        }                            
                    }
                    
                    if( mouseDown-mouseUp < -sizeX ){  // -900 미만 => -900이상
                        clearInterval(setId); // 클릭시 일시중지
                        if(!slideWrap.is(':animated')){
                            prevCount();
                        }                            
                    }

                    // -900 >= 이상이고 <= 900 이하이면 원래대로 제자리로 찾아간다.
                    if(  mouseDown-mouseUp >= -sizeX  &&  mouseDown-mouseUp <= sizeX ){
                        mainSlide();
                    }

                    mDown = false;  // 2. 드래그 끝을 알려주는 마우스 업상태
                    slideView.css({ cursor: 'grab' }); // 놓는다 손바닥 펼친다.
                },
                touchmove(e){
                    if(!mDown) return;   // 3. true가 아니면 마우스 다운이 있어야만 드래그 가능                 
                    // if(mDown!==true) return;   // true가 아니면 마우스 다운이 있어야만 드래그 가능                 
                    // if(mDown===false) return;   // false 이면 마우스 다운이 있어야만 드래그 가능                 
                                         
                    dragEnd = e.originalEvent.changedTouches[0].clientX; // 4. 드래그 끝 좌표값
                    slideWrap.css({left:  dragEnd-dragStart }); // 5. 슬라이드 드래그 이동 디롭( 드래그끝 좌표값 - 드래그시작 좌표값 )
                }
            })
            // 손가락 터치 이벤트 확인하기 => 테블릿과 모바일에서만 이벤트 동작
            // originalEvent: TouchEvent, type: 'touchstart'
            // slideContainer.on({
            //     touchstart(e){
            //         console.log(e.originalEvent.changedTouches[0].clientX);
            //     },
            //     touchend(e){
            //         console.log(e.originalEvent.changedTouches[0].clientX);
            //     },
            //     touchmove(e){
            //         console.log(e.originalEvent.changedTouches[0].clientX);
            //     }
            // });


            // 1. 메인슬라이드함수
            function mainSlide(){
                slideWrap.stop().animate({left: `${-100*cnt}%`}, 600, 'easeInOutExpo', function(){
                    if(cnt>n){cnt=0}
                    if(cnt<0){cnt=n}
                    slideWrap.stop().animate({left: `${-100*cnt}%`}, 0);
                });
                pageEvent();
            }

            // 2-1. 다음카운트함수
            function nextCount(){
                cnt++;
                mainSlide();
            }
            // 2-2. 이전카운트함수
            function prevCount(){
                cnt--;
                mainSlide();
            }

            // 3. 자동타이머함수(7초 후 7초간격 계속)
            function autoTimer(){
                setId = setInterval(nextCount, 7000);
            }
            autoTimer();

            // 4. 페이지 이벤트 함수
            function pageEvent(){
                pageBtn.removeClass('on');
                pageBtn.eq( cnt>n ? 0 : cnt).addClass('on');
            }

            // 5. 페이지버튼클릭
            pageBtn.each(function(idx){
                $(this).on({
                    click(e){
                        e.preventDefault();
                        cnt=idx;
                        mainSlide();
                        clearInterval(setId); // 클릭시 일시중지
                    }
                });
            });

            // 6-1. 스톱 버튼 클릭이벤트
            stopBtn.on({
                click(e){
                    e.preventDefault();
                    stopBtn.addClass('on');
                    playBtn.addClass('on');
                    clearInterval(setId); // 클릭시 일시중지
                }
            })

            // 6-2. 플레이 버튼 클릭이벤트
            playBtn.on({
                click(e){
                    e.preventDefault();
                    stopBtn.removeClass('on');
                    playBtn.removeClass('on');
                    autoTimer(); // 클릭시 재실행 7초후실행
                }
            })

            
        },
        section2(){
            // 0. 변수설정
            let cnt = 0;
            const slideContainer = $('#section2 .slide-container');
            const section2Container = $('#section2 .container');
            const slideWrap = $('#section2 .slide-wrap');
            const slideView = $('#section2 .slide-view');
            const slide = $('#section2 .slide-view .slide');
            const slideH3 = $('#section2 .slide-view .slide h3');
            const slideH4 = $('#section2 .slide-view .slide h4');
            const pageBtn = $('#section2 .page-btn');
            const selectBtn = $('#section2 .select-btn');
            const subMenu = $('#section2 .sub-menu');
            const materialIcons = $('#section2  .select-btn .material-icons');
            const heightRate = 0.884545392;
            let n = slide.length;

            // 터치스와이프
            let touchStart = null;
            let touchEnd = null;

            // 드래그시작
            // 드래그끝
            let dragStart = null;
            let dragEnd = null;
            let mDown = false;
            let winW = $(window).innerWidth(); // 창너비=> 슬라이드1개의 너비
            let sizeX = 100;  // 드래그 길이
            let offsetL =   slideWrap.offset().left;  // 318 
            let slideWidth;
            // slideWrap.offset().left 좌측 좌표값
            // console.log(  slideWrap.offset().left );

            resizeFn(); // 로딩시
            // 함수는 명령어의 묶음
            function resizeFn(){
                // 창너비(window)가 1642px 이하에서 padding-left 0으로 설정
                winW = $(window).innerWidth(); // 창크기 계속 값을 보여준다.
                if(winW <= 1642){
                    // 1280 초과에서는 슬라이드 3개
                    // 1280 이하에서는 슬라이드 1개
                    if(winW > 920){
                        slideWidth = (section2Container.innerWidth()-0+20+20) / 3;
                        n = slide.length-2; // 8개
                        console.log(n);
                        pageBtn.css({display: 'none'});
                        for(let i=0; i<n; i++){
                            pageBtn.eq(i).css({display: 'block'}); // 8개보임
                        }
                        cnt=0;
                    }
                    else{
                        slideWidth = (section2Container.innerWidth()-0+20+20) / 1;
                        n = slide.length; // 10개
                        pageBtn.css({display: 'none'});
                        for(let i=0; i<n; i++){
                            pageBtn.eq(i).css({display: 'block'}); // 10개보임
                        }

                        if(cnt>7){
                            cnt=7;
                        }
                    
                    }
                }
                else{ // 1642 초과 (같다)
                    slideWidth = (section2Container.innerWidth()-198+20+20) / 3;
                }
                slideWrap.css({width: slideWidth * 10});
                slide.css({width: slideWidth, height: slideWidth*heightRate});
                slideH3.css({fontSize: slideWidth*0.084758364});
                slideH4.css({fontSize: slideWidth*0.035687732});

                mainSlide();
            }
            $(window).resize(function(){
                resizeFn();
            })

            // 데스크탑 터치 스와이프 드래그 앤 드롭
            slideContainer.on({
                mousedown(e){
                    slideView.css({ cursor: 'grabbing' }); // 잡는다
                    mDown = true;
                    touchStart = e.clientX;
                    dragStart = e.clientX - (slideWrap.offset().left-offsetL);
                },
                mouseup(e){
                    touchEnd = e.clientX;
                    if(touchStart-touchEnd > sizeX){
                        nextCount();
                    }
                    if(touchStart-touchEnd < -sizeX){
                        prevCount();
                    }
                    mDown = false;
                    // -300 >= 이상이고 <= 300 이하이면 원래대로 제자리로 찾아간다.
                    if(  touchStart-touchEnd >= -sizeX  &&  touchStart-touchEnd <= sizeX ){
                        mainSlide();
                    }
                    slideView.css({ cursor: 'grab' }); // 놓는다
                },
                mousemove(e){
                    if(!mDown) return;

                    dragEnd = e.clientX;

                    slideWrap.css({left: dragEnd - dragStart });

                }
            });    

            $(document).on({
                mouseup(e){
                    // mDown = ture; 상태에서
                    // mouseup 에서 mDown = false; 변경
                    // 그러면 이미 실행한거임
                    // 그래서 실행 못하게 막아야한다.
                    if(!mDown) return; // 마우스 다운 상태에서 마우스 업이 실행이 안된상태에서만 실행하라
                    touchEnd = e.clientX;
                    if(touchStart-touchEnd > sizeX){
                        nextCount();
                    }
                    if(touchStart-touchEnd < -sizeX){
                        prevCount();
                    }
                    mDown = false;
                    // -300 >= 이상이고 <= 300 이하이면 원래대로 제자리로 찾아간다.
                    if( touchStart-touchEnd >= -sizeX  &&  touchStart-touchEnd <= sizeX ){
                        mainSlide();
                    }
                    slideView.css({ cursor: 'grab' }); // 놓는다

                }
            })


            // 테블릿 & 모바일 터치 스와이프 드래그 앤 드롭
            slideContainer.on({
                touchstart(e){
                    slideView.css({ cursor: 'grabbing' }); // 잡는다
                    mDown = true;
                    touchStart = e.originalEvent.changedTouches[0].clientX;
                    dragStart = e.originalEvent.changedTouches[0].clientX - (slideWrap.offset().left-offsetL);
                },
                touchend(e){
                    touchEnd = e.originalEvent.changedTouches[0].clientX;
                    if(touchStart-touchEnd > sizeX){
                        nextCount();
                    }
                    if(touchStart-touchEnd < -sizeX){
                        prevCount();
                    }
                    mDown = false;
                    // -300 >= 이상이고 <= 300 이하이면 원래대로 제자리로 찾아간다.
                    if(  touchStart-touchEnd >= -sizeX  &&  touchStart-touchEnd <= sizeX ){
                        mainSlide();
                    }
                    slideView.css({ cursor: 'grab' }); // 놓는다
                },
                touchmove(e){
                    if(!mDown) return;

                    dragEnd = e.originalEvent.changedTouches[0].clientX;

                    slideWrap.css({left: dragEnd - dragStart });

                }
            });    



            selectBtn.on({
                click(e){
                    e.preventDefault();
                    subMenu.toggleClass('on');  // 서브메뉴
                    materialIcons.toggleClass('on'); // 아이콘
                }
            })


            // 1. 메인슬라이드함수
            mainSlide();
            function mainSlide(){
                slideWrap.stop().animate({left: -slideWidth * cnt }, 600, 'easeInOutExpo');          
                pageBtnEvent();
            }

            // 다음카운트함수
            function nextCount(){
                cnt++;
                if(cnt>n-1) {cnt=n-1};
                mainSlide();
            }

            // 이전카운트함수
            function prevCount(){
                cnt--
                if(cnt<0) {cnt=0};
                mainSlide();
            }


            // 2. 페이지버튼 클릭이벤트
            // each() 메서드
            pageBtn.each(function(idx){
                $(this).on({
                    click(e){
                        e.preventDefault();
                        cnt=idx;
                        mainSlide();
                    }
                })
            });

            //  3. 페이지버튼 이벤트 함수
            function pageBtnEvent(){
                pageBtn.removeClass('on');
                pageBtn.eq(cnt).addClass('on');
            }


        },
        section3(){},
    }
    obj.init();

})(jQuery); // 전달인수(아규먼트 Argument)
