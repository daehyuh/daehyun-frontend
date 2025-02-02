import React from 'react';
import styled from 'styled-components';

const AdContainer = styled.div`
  display: none; // 기본적으로 숨김

  @media (min-width: 1000px) {
    display: block; // 1000px 이상일 때 보이도록 설정
    width: 100%; // 광고의 너비 설정
    height: 100vh; // 광고의 높이 설정
    background-color: #242426; // 광고 배경색
  }
`;

const GoogleAdSense: React.FC = () => {
  return (
    <AdContainer>
      
    </AdContainer>
  );
};

export default GoogleAdSense;
