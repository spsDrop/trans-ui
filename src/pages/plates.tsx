/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import styled from "@emotion/styled"
import { AppStatus, getPath } from '../app'
import { secondsToTimeString, calculatePrintTime } from "../utils/time";
import { 
    Detail,
    Details,
    HorizontalGroup,
    ContainerBox,
    PreviewWrap,
    Preview,
    PreviewDetail,
    Button,
    RedButton,
    GreenButton,
    UploadInput,
    ChooseFileButton,
    singleColumnBreak
} from '../commonStyledComponents'
import Modal from '../modal'
import PlateViewer from '../plateViewer'
import axios from 'axios'
import { ResinProfile } from './profiles'
const CancelToken = axios.CancelToken;

export type PlateProfile = {
    GCODE: boolean,
    ID: number,
    LAYER: number,
    NAME: string,
    PROFILE_ID: number,
    SPEND_TIME?: number,
    printDuration?: number
}

const LinkedRedButton = RedButton.withComponent(Link)
const LinkedGreenButton = GreenButton.withComponent(Link)
const LinkedButton = Button.withComponent(Link)

const PreviewLink = styled(Preview)`
    cursor: pointer;
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

const UploadWrapper = styled(ContainerBox)`
    min-width: 19rem;
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
    plateToPrint?: number,
    plateToView?: number
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

    deletePlate(plateId) {
        axios.post(`/api/plates/delete/${plateId}`).
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

    printPlate(plateId) {
        axios.post(`/api/plates/print/${plateId}`).
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

    cancelModal() {
        history.replaceState({}, '', getPath('plates'))
        history.back()
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
                            <Link to={getPath(`plates/preview/${plate.ID}`)}>
                                <PreviewWrap
                                    tabIndex={-1}
                                    previewUrl={`/plates/${plate.ID}/preview.png`}
                                >
                                    <PreviewLink src={`/plates/${plate.ID}/1.png`}/>
                                    <PreviewDetail>
                                        <Detail>
                                            {plate.LAYER} Layers
                                        </Detail>
                                        <Detail>
                                            Projected Duration {secondsToTimeString(projectedTime)}
                                        </Detail>
                                        {!!plate.SPEND_TIME && (
                                            <Detail>
                                                Previous Duration {secondsToTimeString(plate.printDuration || plate.SPEND_TIME)}
                                            </Detail>
                                        )}
                                    </PreviewDetail>
                                </PreviewWrap>
                            </Link>
                            <HorizontalGroup>
                                <Details>
                                    {this.renderResinOption(plate)}
                                </Details>
                                <Details>
                                    <LinkedGreenButton disabled={uploading} to={getPath(`plates/print/${plate.ID}`)}>
                                        Print
                                    </LinkedGreenButton>
                                    <LinkedRedButton disabled={uploading} to={getPath(`plates/delete/${plate.ID}`)}>
                                        Delete
                                    </LinkedRedButton>
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

    renderViewModal(plateId) {
        const plateData: PlateProfile = this.state.plates.filter(plate => plate.ID === plateId)[0]
        return (
            <Modal shown={true}>
                <Details>
                    <PlateViewer plateName={plateData.NAME} plateId={plateId} totalLayers={plateData.LAYER}/>
                </Details>
                <Details>
                    <Button onClick={()=> this.cancelModal()}>Close</Button>
                </Details>
            </Modal>
        )
    }

    render() {
        const {
            plates,
            fileName,
            uploading,
            uploadProgress,
            plateToDelete,
            plateToPrint,
            plateToView,
            resin
        } = this.state

        const uploadComplete = uploadProgress == 1;
        const progress = uploadProgress * 100

        return (
            <PlatesWrapper>
                <Router>
                    <Route
                        path={getPath('plates/delete/:plateId')}
                        render={({match:{params:{plateId}}}) => {
                            return this.renderModal('Delete', RedButton, () => {this.deletePlate(parseInt(plateId, 10))})
                        }}
                    />
                    <Route
                        path={getPath('plates/print/:plateId')}
                        render={({match:{params:{plateId}}}) => {
                            return this.renderModal('Print', GreenButton, () => {this.printPlate(parseInt(plateId, 10))})
                        }}
                    />
                    <Route
                        path={getPath('plates/preview/:plateId')}
                        render={({match:{params:{plateId}}}) => {
                            return !!plates?.length && this.renderViewModal(parseInt(plateId, 10))
                        }}
                    />
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
                                Select File to Upload (zip, phz)
                            </ChooseFileButton>
                            <UploadButton disabled={!fileName} onClick={() => this.uploadFile()}>Upload</UploadButton>
                        </Detail>
                    </UploadWrapper>
                </Router>
            </PlatesWrapper>
        )
    }
}