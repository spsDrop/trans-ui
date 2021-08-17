import * as React from 'react'
import ReactDOM from 'react-dom'
import styled from "@emotion/styled";
import {ContainerBox} from './commonStyledComponents'

const ModalBase = styled<'div', {shown?: boolean}>('div')`
    display: ${props => props.shown ? 'block' : 'none'}
`
const ModalBackground = styled.div`
    position: fixed;
    top: 0;
    width: 100%;
    left: 0;
    height: 100%;
    background: hsla(0, 0%, 5%, 0.8);
    animation: fadeIn 0.25s ease-out;
    z-index: 3;

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
`
const ModalWrapper = styled.div`
    position: fixed;
    top: 5vh;
    left: 0;
    width: 100%;
    z-index: 4;
`
const ModalContent = styled(ContainerBox)`
    width: max-content;
    max-width: 90%;
    max-height: 90vh;
    overflow: auto;
    box-sizing: border-box;
    margin: auto;
    animation: slideIn 0.25s cubic-bezier(0.5, 1, 0.89, 1);

    @keyframes slideIn {
        0% {
            opacity: 0;
            transform: translateY(-100%);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

export default class Modal extends React.Component<{shown: boolean}> {
    el: HTMLDivElement

    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        document.body.appendChild(this.el);
        this.el.focus();
    }

    componentWillUnmount() {
        document.body.removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(
        (
            <ModalBase shown={this.props.shown}>
                <ModalBackground>
                </ModalBackground>
                <ModalWrapper>
                    <ModalContent>
                        {this.props.children}
                    </ModalContent>
                </ModalWrapper>
            </ModalBase>
        ),
        this.el,
        );
    }
}