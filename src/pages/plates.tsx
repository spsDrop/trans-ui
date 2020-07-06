/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import styled from "@emotion/styled"
import { AppStatus } from '../app'
import { secondsToTimeString, calculatePrintTime } from "../utils/time";
import { Detail, Details, HorizontalGroup, ContainerBox, PreviewWrap, Preview, PreviewDetail, Button, RedButton, GreenButton, singleColumnBreak } from '../commonStyledComponents'
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
const UploadProgressBar = styled.div`
    box-sizing: border-box;
    padding: 0.25rem 1rem;
    border-radius: 1rem;
    color: white;
    background-color: hsl(124, 40%, 55%);
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
    plateToDelete?: number,
    plateToPrint?: number
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
        axios.post(`/api/plates/updateResin/${plateId}/${resinId}`).
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
        ).then(res => {
            this.cancelCallback = undefined;
            this.setState({
                uploading: false,
                uploadProgress: 0
            })
            if (res.data.success) {
                this.updatePlates();
            }else {
                console.error(res.data.message)
            }
        })
        .catch(error => {
            console.log(error);
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

    cancelModal() {
        this.setState({
            plateToDelete: undefined,
            plateToPrint: undefined
        })
    }

    deletePlate() {
        axios.post(`/api/plates/delete/${this.state.plateToDelete}`).
            then(res => {
                if(res.data.success){
                    this.cancelModal()
                    this.updatePlates()
                } else {
                    console.error(res.data.message);
                }
            }).
            catch(error => {
                console.error(error)
            })
    }

    promptPrintPlate(plateId) {
        this.setState({
            plateToPrint: plateId
        })
    }

    printPlate() {
        axios.post(`/api/plates/print/${this.state.plateToPrint}`).
            then(res => {
                if(res.data.success){
                    this.cancelModal()
                } else {
                    console.error(res.data.message);
                }
            }).
            catch(error => {
                console.error(error)
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
        const { resin:resinList } = this.state; 
        return (
            <PlateList>{
                plates.map( (plate: PlateProfile) => {
                    const resin = resinList.filter(resinProfile => resinProfile.id === plate.PROFILE_ID)[0]
                    const projectedTime = calculatePrintTime(resin, plate.LAYER)
                    
                    return (
                        <Plate>
                            <Detail size="large">{plate.NAME}</Detail>
                            <PreviewWrap
                                tabIndex={-1}
                                previewUrl={`/plates/${plate.ID}/preview.png`}
                            >
                                <Preview src={`/plates/${plate.ID}/1.png`}/>
                                <PreviewDetail>
                                    <Detail>
                                        {plate.LAYER} Layers
                                    </Detail>
                                    <Detail>
                                        Duration {secondsToTimeString(plate.SPEND_TIME || projectedTime)}
                                    </Detail>
                                </PreviewDetail>
                            </PreviewWrap>
                            <HorizontalGroup>
                                <Details>
                                    {this.renderResinOption(plate)}
                                </Details>
                                <Details>
                                    <GreenButton onClick={()=>this.promptPrintPlate(plate.ID)} disabled={uploading}>
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

    renderModal(action: string, ConfirmButton, confirmAction: ()=> void) {
        return (
            <Modal shown={true}>
                <Detail>Are you sure your want to {action.toLowerCase()} this plate?</Detail>
                <Details align="right">
                    <Button css={css({marginBottom: 0})} onClick={()=> this.cancelModal()}>Cancel</Button>
                    <ConfirmButton css={css({marginBottom: 0})} onClick={confirmAction}>{action}</ConfirmButton>
                </Details>
            </Modal>
        );
    }

    render() {
        const {
            plates,
            fileName,
            uploading,
            uploadProgress,
            plateToDelete,
            plateToPrint,
            resin
        } = this.state

        const uploadComplete = uploadProgress == 1;
        const progress = uploadProgress * 100

        return (
            <PlatesWrapper>
                {plateToDelete && this.renderModal('Delete', RedButton, ()=> this.deletePlate())}
                {plateToPrint && this.renderModal('Print', GreenButton, ()=> this.printPlate())}
                {(!!plates?.length && !!resin?.length &&  this.renderPlates(plates, uploading))}
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
                        />{/* 
                        // We don't care about this 'for' input error
                        // @ts-ignore */}
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