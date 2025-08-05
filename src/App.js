// React를 사용할 수 있게 불러와요.
// 이 줄은 React 컴포넌트를 만들기 위해 꼭 필요해요.
import React from 'react';

// 우리가 만든 컴포넌트(화면 요소)를 가져와요.
// ./components 폴더 안에 있는 BarcodeIntro.jsx 파일을 가져오는 거예요.
import BarcodeIntro from './components/BarcodeIntro';

// 이건 App이라는 이름의 컴포넌트를 정의하는 부분이에요.
// 컴포넌트는 웹페이지에서 화면에 그려질 내용을 말해요.
function App() {
  // 화면에 보여줄 내용을 return으로 반환해요.
  // 여기서는 우리가 만든 <BarcodeIntro /> 컴포넌트를 보여주고 있어요.
  return <BarcodeIntro />;
}

// 이 App 컴포넌트를 다른 파일에서도 사용할 수 있도록 내보내요.
// 보통 index.js 또는 main.jsx에서 이 App을 불러와서 전체 웹사이트를 구성해요.
export default App;
