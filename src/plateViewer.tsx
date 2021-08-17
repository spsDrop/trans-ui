/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import styled from "@emotion/styled"
import { AppStatus } from './app'
import Loader from './loader'
import { Detail, Details, HorizontalGroup, ContainerBox, PreviewWrap, Preview, PreviewDetail, Button, RedButton, GreenButton, singleColumnBreak } from './commonStyledComponents'
import { secondsToTimeString } from "./utils/time";


const Stepper = styled(Button.withComponent('input'))`
    width: 6.8rem;
`

const Slider = styled.div`
    margin: 2rem 0;
    border-radius: 2rem;
    background-color: hsl(216, 25%, 76%);
    border: 2px solid hsl(216, 25%, 20%);
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
`
const SliderKnob = styled.div`
    background: hsl(216,80%,30%);
    border-radius: 2em;
    width: 2em;
    height: 2em;
    pointer-events: none;
    margin: 1px 0;
`
type State = {
    currentImage: number,
    dragging: boolean
}

type Props = {
    plateName: string,
    plateId: number,
    totalLayers: number
}

export default class PateViewer extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            currentImage: 1,
            dragging: false
        }
    }

    updateLayer(layer: number) {
        let currentImage = Math.max(layer, 1)
        currentImage = Math.min(currentImage, this.props.totalLayers)
        this.setState({
            currentImage
        })
    }

    changeValue(e: React.ChangeEvent<HTMLInputElement>) {
        let nextLayer = parseInt(e.target.value, 10)
        nextLayer = isNaN(nextLayer) ? 1 : nextLayer
        this.updateLayer(nextLayer)
    }

    debouceTimeOut
    nextValue

    debouncedUpdateLayer(layer) {
        if (!this.debouceTimeOut) {
            this.nextValue = undefined
            this.debouceTimeOut = setTimeout(() =>{
                this.updateLayer(this.nextValue || layer)
                this.debouceTimeOut = undefined
            }, 33)
        } else {
            this.nextValue = layer
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.currentImage != this.state.currentImage
    }

    slider: HTMLDivElement

    onMove(e: React.MouseEvent, forceUpdate = false) {
        if (this.slider && (this.state.dragging || forceUpdate)) {
            const nextLayer = Math.round(e.nativeEvent.offsetX / this.slider.getBoundingClientRect().width * this.props.totalLayers)
            this.debouncedUpdateLayer(nextLayer)
        }
    }

    render() {
        const {
            currentImage
        } = this.state
        const {
            plateId,
            totalLayers,
            plateName
        } = this.props

        let sliderWidth = 0;
        if (this.slider){
            sliderWidth = this.slider.getBoundingClientRect().width - 45
        }

        return (
            <Details css={css({userSelect:'none'})}>
                <Detail>{plateName}</Detail>
                <Detail>
                    <img css={css({maxWidth: '100%', margin: 'auto', maxHeight: '45vh', display: 'block'})} src={`/plates/${plateId}/${currentImage}.png`} />
                </Detail>
                <Detail>
                    <Slider 
                        onMouseMove={(e) => this.onMove(e)}
                        onMouseDown={(e) => {this.setState({dragging: true}); this.onMove(e, true)}}
                        onMouseUp={() => this.setState({dragging: false})}
                        onMouseLeave={() => this.setState({dragging: false})}
                        ref={(el)=> this.slider = el}
                    >
                        <SliderKnob
                            css={css({
                                transform: `translateX(${sliderWidth * currentImage / totalLayers}px)`
                            })}
                         />
                    </Slider>
                </Detail>
                <Detail>
                    <Button onClick={() => this.updateLayer(currentImage - 100)}>-100</Button>
                    <Button onClick={() => this.updateLayer(currentImage - 10)}>-10</Button>
                    <Stepper type="number" step={1} value={currentImage} onChange={(e)=> this.changeValue(e)} />
                    <Button onClick={() => this.updateLayer(currentImage + 10)}>+10</Button>
                    <Button onClick={() => this.updateLayer(currentImage + 100)}>+100</Button>
                    <span> of {totalLayers}</span>
                </Detail>
            </Details>
        )
    }
}