import * as React from 'react'
import styled from "@emotion/styled"
import { AppStatus } from '../app'
import { secondsToDuration } from "../utils/time";
import { Detail, Details, HorizontalGroup, ContainerBox, Button, RedButton, GreenButton, singleColumnBreak } from '../commonStyledComponents'
import Modal from '../modal'
import axios from 'axios'
const CancelToken = axios.CancelToken;

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
    height: 100%;
`
const Name = styled(Detail)`
    font-weight: bold;
    font-size: 1.5rem;
`

const UploadWrapper = styled(ContainerBox)`
    min-width: 19rem;
`
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
const UploadProgress = styled.div`
    margin: 2rem 0;
    border-radius: 1rem;
    background-color: hsl(216, 25%, 76%);
    border: 2px solid hsl(216, 25%, 20%);
    width: 100%;
    box-sizing: border-box;
`
const UploadProgressBar = styled<'div', {progress: number}>('div')`
    box-sizing: border-box;
    padding: 0.25rem 1rem;
    border-radius: 1rem;
    color: white;
    background-color: hsl(124, 40%, 55%);
    width: ${props => props.progress * 100}%;
    min-width: 4rem;
    text-align: right;
    border: 1px solid hsl(124,40%,40%);
`

type State = {
    plates: Array<PlateProfile>,
    resin: Array<ResinProfile>
    fileName?: string,
    uploading: boolean,
    uploadProgress: number,
    plateToDelete?: number
}

export default class Plates extends React.Component<{status: AppStatus},State> {
    constructor(props) {
        super(props)
        this.state = {
            plates: [],
            resin: [],
            fileName: undefined,
            uploading: false,
            uploadProgress: 0
        }
    }

    componentDidMount() {
        this.updatePlates();
        this.updateResin();
    }

    componentWillUpate(nextProps) {
        if(this.props.status.processingUpload && !nextProps.status.processingUpload) {
            this.updatePlates()
        }
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

    uploadEl: HTMLInputElement
    cancelCallback: undefined | Function

    uploadFile() {
        const formData = new FormData()
        const { fileName } = this.state

        formData.append('file', this.uploadEl.files[0], fileName)
        formData.append('fileName', fileName)

        this.setState({
            uploading: true
        })

        axios.post('/api/plates/upload',
            formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                cancelToken: new CancelToken((cancelCallback) => {
                    this.cancelCallback = cancelCallback
                }),
                onUploadProgress: ( progress ) => {
                    this.setState({
                        uploadProgress: progress.loaded / progress.total
                    })
                }
            }
        ).then(() => {
            console.log('SUCCESS!!');
            this.cancelCallback = undefined;
            this.setState({
                uploading: false,
                uploadProgress: 0
            })
            this.updatePlates();
        })
        .catch(() => {
            console.log('FAILURE!!');
            this.cancelCallback = undefined;
            this.setState({
                uploading: false,
                uploadProgress: 0
            })
        });
    }

    cancelUpload() {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
    }

    changeFile() {
        if (this.uploadEl.files[0]) {
            this.setState({
                fileName: this.uploadEl.files[0].name
            })
        }
    }

    promptDeletePlate(plateId) {
        this.setState({
            plateToDelete: plateId
        })
    }

    cancelDelete() {
        this.setState({
            plateToDelete: undefined
        })
    }

    deletePlate() {
        axios.post('/api/plates/delete', `plateId=${this.state.plateToDelete}`).
            then(res => {
                if(res.data.success){
                    this.cancelDelete()
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
            resin,
            uploading
        } = this.state

        return (
            <Button disabled={uploading} onChange={(e) => this.changeResin(e, plate.ID)} as="select">
                {
                    resin.map((resinProfile: ResinProfile) => {
                        return <option selected={plate.PROFILE_ID === resinProfile.id} value={resinProfile.id}>{resinProfile.name}</option>
                    })
                }
            </Button>
        )

    }

    renderPlates(plates, uploading) {
        return (
            <PlateList>{
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
                                    <GreenButton disabled={uploading}>
                                        Print
                                    </GreenButton>
                                    <RedButton onClick={()=> this.promptDeletePlate(plate.ID)} disabled={uploading}>
                                        Delete
                                    </RedButton>
                                </Details>
                            </HorizontalGroup>
                        </Plate>
                    )
                })
            }</PlateList>
        )
    }

    render() {
        const {
            plates,
            fileName,
            uploading,
            uploadProgress,
            plateToDelete
        } = this.state

        const uploadComplete = uploadProgress == 1;
        const progress = uploadProgress * 100

        return (
            <PlatesWrapper>
                <Modal shown={!!plateToDelete}>
                    <Detail>Are you sure your want to delete this plate?</Detail>
                    <Details align="right">
                        <Button onClick={()=> this.cancelDelete()}>Cancel</Button>
                        <RedButton onClick={()=> this.deletePlate()}>Delete</RedButton>
                    </Details>
                </Modal>
                {(plates &&  this.renderPlates(plates, uploading))}
                <UploadWrapper>
                    <Detail hidden={!uploading}>
                        <Detail hidden={uploadComplete}>Uploading '{fileName}'</Detail>
                        <Detail hidden={!uploadComplete}>Upload Complete</Detail>
                        <UploadProgress>
                            <UploadProgressBar style={{width: progress+'%'}}>
                                {Math.round(progress)}%
                            </UploadProgressBar>
                        </UploadProgress>
                        <RedButton disabled={uploadComplete} onClick={() => this.cancelUpload()}>Cancel Upload</RedButton>
                    </Detail>
                    <Detail hidden={uploading}>
                        <Detail>{fileName || 'No File Selected'}</Detail>
                        <UploadInput
                            onChange={() => this.changeFile()}
                            ref={el => this.uploadEl = el}
                            type="file"
                            accept=".zip,.phz"
                            id="fileInput"
                        />
                        <ChooseFileButton disabled={uploading} as="label" for="fileInput">
                            Select File to Upload (Zip, Phz)
                        </ChooseFileButton>
                        <UploadButton disabled={!fileName} onClick={() => this.uploadFile()}>Upload</UploadButton>
                    </Detail>
                </UploadWrapper>
            </PlatesWrapper>
        )
    }
}