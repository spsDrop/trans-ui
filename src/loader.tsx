import * as React from 'react'
import styled from "@emotion/styled";

const Loader = styled<'div', {size?: number}>('div')`
margin: ${props => props.size ? props.size/4 : 1}rem ${props => props.size ? props.size/4 : 1}rem;
width: ${props => props.size ? props.size : 4}rem;
height: ${props => props.size ? props.size : 4}rem;
position: relative;
transform: rotateZ(45deg);

div {
    float: left;
    width: 50%;
    height: 50%;
    position: relative;
    transform: scale(1.1);
}
div:before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    width: 100%;
    height: 100%;
    border: 2px solid #FF1493;
    animation: foldCubeAngle 2.4s infinite linear both;
    transform-origin: 100% 100%;
    border-radius: 0.5rem;
    box-sizing: border-box;
}
.cube2 {
    transform: scale(1.1) rotateZ(90deg);
}
.cube3 {
    transform: scale(1.1) rotateZ(180deg);
}
.cube4 {
    transform: scale(1.1) rotateZ(270deg);
}
.cube2:before {
    animation-delay: 0.3s;
}
.cube3:before {
    animation-delay: 0.6s; 
}
.cube4:before {
    animation-delay: 0.9s;
}
@-webkit-keyframes foldCubeAngle {
  0%, 10% {
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0; 
  } 25%, 75% {
    transform: perspective(140px) rotateX(0deg);
    opacity: 1; 
  } 90%, 100% {
    transform: perspective(140px) rotateY(180deg);
    opacity: 0; 
  } 
}

@keyframes foldCubeAngle {
  0%, 10% {
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0; 
  } 25%, 75% {
    transform: perspective(140px) rotateX(0deg);
    opacity: 1; 
  } 90%, 100% {
    transform: perspective(140px) rotateY(180deg);
    opacity: 0; 
  }
}
`

export default ({size}) => (
    <Loader size={size}>
        <div className="cube1"></div>
        <div className="cube2"></div>
        <div className="cube4"></div>
        <div className="cube3"></div>
    </Loader>
)