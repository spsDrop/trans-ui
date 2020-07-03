import * as React from 'react'
import styled from "@emotion/styled"
import { secondsToDuration } from "../utils/time";
import axios from 'axios'

export type PlateProfile = {
    GCODE: boolean,
    ID: number,
    LAYER: number,
    NAME: string,
    PROFILE_ID: number,
    SPEND_TIME: number
}

export type ResinProfile =   {
    Z: string,
    burnCure: number,
    burnLayer: number,
    burn_pull_speed: number,
    burn_pull_z: number,
    id: number,
    led_delay: number,
    name: string,
    normalCure: number,
    pull_speed: number,
    pull_z: number,
    push_speed: number
}

const singleColumnBreak = '1100px'

const HorizontalGroup = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
`;
const ContainerBox = styled.div`
    background-color: rgba(64, 64, 64, 0.8);
    padding: 2rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    color: white;
    :last-child {
        @media (min-width: ${singleColumnBreak}) {
            margin-bottom: 0;
        }
    }
`
const Button = styled.button`
    display: inline-block;
    color: white;
    background: #19263a;
    border: 0;
    border-radius: 0.25rem;
    padding: 0.6rem 1rem;
    font-size: 1.25rem;
    margin-right: 0.6rem;
    margin-bottom: 1rem;
    position: relative;

    select& {
        padding-right: 2.5rem;
        appearance: none;
        background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
        background-repeat: no-repeat;
        background-position-x: calc(100% - 0.5rem);
        background-position-y: 50%;
    }

    :last-child {
        margin-right: 0rem;
    }
`
const PlatesWrapper = styled(HorizontalGroup)`
    justify-content: stretch;
    @media (max-width: ${singleColumnBreak}) {
        flex-direction: column-reverse;
        align-items: stretch;
    }
`;
const PlateList = styled.div`
    margin-right: 2rem;
    flex-basis: 80%;
    @media (max-width: ${singleColumnBreak}) {
        margin-right: 0;
    }
`
const Plate = styled(ContainerBox)``
const PreviewWrap = styled.div`
    position: relative;
    margin-bottom: 1rem;
    width: 100%;
    padding-top: 57.25%;
`
const PreviewDetail = styled(ContainerBox)`
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    padding: 0.75rem;
    background-color: rgba(16, 16, 16, 0.9);
`
const Preview = styled.img`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%%;
`
const Details = styled.div``
const Detail = styled.div`
    font-size: 1.25rem;
    margin-bottom: 1rem;
    margin-right: 0.5rem;
    :last-child {
        margin-bottom: 0;
        margin-right: 0;
        
    }
`
const Name = styled(Detail)`
    font-weight: bold;
    font-size: 1.5rem;
`
const DeleteButton = styled(Button)``
const PrintButton = styled(Button)``

const UploadWrapper = styled(ContainerBox)``
const ChooseFileButton = styled(Button)`
    white-space: nowrap;
`
const UploadInput = styled.input`
    width: 1px;
    height: 1px;
    overflow: hidden;
    visibility: hidden;
`
const UploadButton = styled(Button)``
const UploadProgress = styled.div``
const UploadProgressBar = styled.div``

type State = {
    plates: Array<PlateProfile>,
    resin: Array<ResinProfile>
}

export default class Plates extends React.Component<{},State> {
    constructor(props) {
        super(props)
        this.state = {
            plates: [],
            resin: []
        }
    }

    componentDidMount() {
        this.updatePlates();
        this.updateResin();
    }

    updatePlates() {
        fetch('/api/plates').
            then(res => res.json()).
            then(data => {
                this.setState({
                    plates: data
                })
            })
    }

    updateResin() {
        fetch('/api/resin').
            then(res => res.json()).
            then(data => {
                this.setState({
                    resin: data
                })
            })
    }

    changeResin(e, plateId) {
        const resinId = Number(e.target.value)
        axios.post('/api/plates/update', `resinId=${resinId}&plateId=${plateId}`).
            then(res => {
                if(res.data.success){
                    this.updatePlates()
                } else {
                    console.error(res.data.message);
                }
            }).
            catch(error => {
                console.log(error)
            })
    }

    renderResinOption(plate: PlateProfile) {
        const {
            resin
        } = this.state

        return (
            <Button onChange={(e) => this.changeResin(e, plate.ID)} as="select">
                {
                    resin.map((resinProfile: ResinProfile) => {
                        return <option selected={plate.PROFILE_ID === resinProfile.id} value={resinProfile.id}>{resinProfile.name}</option>
                    })
                }
            </Button>
        )

    }

    render() {
        const {
            plates,
            resin
        } = this.state

        return (
            <PlatesWrapper>
                <PlateList>
                {
                    plates.map( (plate: PlateProfile) => {
                        const {
                            days,
                            hours,
                            minutes
                        } = secondsToDuration(plate.SPEND_TIME || 0)
                        return (
                            <Plate>
                                <Name>{plate.NAME}</Name>
                                <PreviewWrap>
                                    <Preview src={`/plates/${plate.ID}/1.png`}/>
                                    <PreviewDetail>
                                        <Detail>
                                            {plate.LAYER} Layers
                                        </Detail>
                                        {(
                                            (plate.SPEND_TIME > 0) && 
                                            <Detail>Duration{days > 0 && ` ${days}d`}{hours > 0 && ` ${hours}h`}{minutes > 0 && ` ${minutes}m`}</Detail>
                                        )}
                                    </PreviewDetail>
                                </PreviewWrap>
                                <HorizontalGroup>
                                    <Details>
                                        {this.renderResinOption(plate)}
                                    </Details>
                                    <Details>
                                        <PrintButton>
                                            Print
                                        </PrintButton>
                                        <DeleteButton>
                                            Delete
                                        </DeleteButton>
                                    </Details>
                                </HorizontalGroup>
                            </Plate>
                        )
                    })
                }
                </PlateList>
                <UploadWrapper>
                    <UploadProgress>
                        <UploadProgressBar/>
                    </UploadProgress>
                    <Detail>No File Selected</Detail>
                    <UploadInput type="file" id="fileInput"/>
                    <ChooseFileButton as="label" for="fileInput">
                        Select File to Upload (Zip, Phz)
                    </ChooseFileButton>
                    <UploadButton>Upload</UploadButton>
                </UploadWrapper>
            </PlatesWrapper>
        )
    }
}