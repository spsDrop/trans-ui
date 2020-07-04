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
`
const ModalWrapper = styled.div`
    position: fixed;
    top: 20rem;
    width: 100%;
`
const ModalContent = styled(ContainerBox)`
    width: max-content;
    margin: auto;
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