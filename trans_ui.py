import os
import json
import sys
import time
import subprocess
from flask import render_template_string, request
fileRoot = os.path.dirname(os.path.abspath(__file__))

def log(msg):
    print(msg, file=sys.stdout, flush=True)

ALLOWED_EXTENSIONS = set(['zip','phz'])

class TransUiApi(object):
    printerStatus = {}
    systemStatus = {}

    def __init__(self, app, mqtt, request, fileRoot, classChiTuPng_v2, chiTuClass, class_wifi_4k, h3info_class, class_gpio ,class_config, tempfile, uuid):
        self.app = app
        self.mqtt = mqtt
        self.request = request
        self.fileRoot = fileRoot
        self.classChiTuPng_v2 = classChiTuPng_v2
        self.chiTuClass = chiTuClass
        self.class_wifi_4k = class_wifi_4k
        self.h3info_class = h3info_class
        self.class_gpio = class_gpio
        self.class_config = class_config
        self.tempfile = tempfile
        self.uuid = uuid

        self.config = class_config.CONFIG()
        self.platesFilePath = os.path.join(self.fileRoot, 'plates_chitu_v2.json')
        self.resinsFilePath = os.path.join(self.fileRoot, 'ressin.json')
        self.stateFilePath = os.path.join(self.fileRoot, 'serverState.json')
        self.platesDirPath = os.path.join(self.fileRoot, 'plates')
        self.platesTempDirPath = os.path.join(self.fileRoot, 'plates', 'tmp')

        self.updateServerState({
            'processingUpload': False,
            'printInitializing': False
        })

        self.updateStatus()

        # May not need this connect line
        @mqtt.on_connect()
        def handle_connect(client, userdata, flags, rc):
            mqtt.subscribe('printer')

        @mqtt.on_message()
        def handleMessage(client, userdata, message):
            payload = message.payload.decode()
            self.printerStatus = json.loads(payload)
            self.updateStatus()

    # Internal Buisness and State

    def bindRoutes(self):
        self.app.add_url_rule('/transui', 'transIndex', self.transIndex)
        self.app.add_url_rule('/transui/', 'transIndex', self.transIndex)
        self.app.add_url_rule('/transui/<path:page>', 'transPage', self.transIndex)

        self.app.add_url_rule('/api/status', 'apiStatus', self.apiStatus)
        self.app.add_url_rule('/api/plates', 'apiPlates', self.apiPlates)
        self.app.add_url_rule(rule='/api/plates/update', view_func=self.apiPlatesUpdate, methods=['GET', 'POST'])
        self.app.add_url_rule(rule='/api/plates/upload', view_func=self.apiPlatesUpload, methods=['POST'])
        self.app.add_url_rule(rule='/api/plates/delete', view_func=self.apiPlatesDelete, methods=['GET', 'POST'])
        self.app.add_url_rule('/api/resin', 'apiResin', self.apiResin)

    def updateStatus(self):
        h3 = self.h3info_class.h3()
        serverState = self.loadServerState()
        status = {
            'cpuLoad': h3.cpu_load(),
            'diskUsage': h3.disk_usage(),
            'cpuTemp': h3.cpu_temp(),
            'uptime': h3.uptime(),
            'printStatus': self.printerStatus,
            'version': self.config.hostname,
            'language': self.config.language,
            'processingUpload': serverState['processingUpload'],
            'processingStatus': serverState['processingStatus'],
            'printInitializing': serverState['printInitializing']
        }

        self.systemStatus = status

    # File Opperations

    def readFile(self, filePath):
        file = open(filePath, 'r', encoding='utf8')
        fileContents =  file.read()
        file.close()
        return fileContents

    def writeJsonFile(self, filePath, contents):
        log(filePath)
        log("contents: {}".format(contents))
        file = open(filePath, 'w')
        json.dump(contents, file, sort_keys = True, indent = 4, separators=(',', ': '))
        file.close()

    def readJsonFile(self, filePath):
        return json.loads(self.readFile(filePath))

    def loadResins(self):
        return self.readJsonFile(self.resinsFilePath)

    def loadPlates(self):
        return self.readJsonFile(self.platesFilePath)

    def loadServerState(self):
        try:
            savedState = self.readJsonFile(self.stateFilePath)
        except:
            savedState = {}
            self.writeServerState(savedState)
        return savedState

    def writePlates(self, plates):
        self.writeJsonFile(self.platesFilePath, plates)

    def writeResins(self, resins):
        self.writeJsonFile(self.resinsFilePath, resins)

    def writeServerState(self, state):
        self.writeJsonFile(self.stateFilePath, state)

    def updateServerState(self, state):
        savedState = self.loadServerState()
        savedState.update(state)
        self.writeServerState(savedState)

    def allowedFile(self, fileName):
        return '.' in fileName and \
            fileName.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

    def writeNewPlate(self, id, layers, plateName, gcode, resinId):
        platesData = self.loadPlates()
        arry_upload = {
            "ID": int(id),
            "LAYER": layers,
            "NAME": plateName,
            "GCODE": gcode, 
            "PROFILE_ID": resinId, 
            "SPEND_TIME":0
        }
        platesData.append(arry_upload)
        platesData.sort(key=lambda s: s['ID'], reverse=True)
        self.writePlates(platesData)

    def resetDir(self, path):
        subprocess.call(["rm", "-rf", path])
        time.sleep(0.1)
        subprocess.check_call(['mkdir', path])

    def writeUploadedFile(self, file, fileName):
        self.resetDir(self.platesTempDirPath)

        file.save(os.path.join(self.platesTempDirPath, fileName))

    def setupChituPng(self, id, fileName):
        chituPng = self.classChiTuPng_v2.UnChiTuPng()
        chituPng.zipfile = os.path.join(self.platesTempDirPath, fileName)
        chituPng.destPath = os.path.join(self.platesDirPath, id)
        return chituPng

    def validateChituPng(self, chituPng):
        if self.config.is_check_png == True:
            PNG_RES = chituPng.GetResolution()
            
            return (PNG_RES[0] != self.config.resx) or (PNG_RES[0] != self.config.resx)
        return True

    def generateGcode(self, id):
        ChiGcodeFile = self.chiTuClass.ChiTuGcode()
        ChiGcodeFile.srcPatch = os.path.join(self.platesDirPath, id, 'run.gcode')
        ChiGcodeFile.destPatch = os.path.join(self.platesDirPath, id, 'gcode.txt')
        ChiGcodeFile.CreateGcode()

    # Logic Utilities

    def isValidResinId(self, id, resins=[]):
        if bool(resins):
            resins = self.loadResins()
        return bool(self.getResinById(id, resins))

    def isValidPlateId(self, id, plates=[]):
        if bool(plates):
            plates = self.loadPlates()
        return bool(self.getPlateById(id, plates))

    def getResinById(self, id, plates):
        return next(filter(lambda r: r.get('id') == id, plates))

    def getPlateById(self, id, plates):
        return next(filter(lambda r: r.get('ID') == id, plates))

    def renderError(self, message):
        status = {
            'success': False,
            'message': message
        }
        return json.dumps(status)

    # Template Route Handlers

    def transIndex(self, page=''):
        self.updateServerState({
            'processingUpload': False
        })
        return render_template_string(self.readFile('trans-ui/index.html'))

    # API Route handlers

    def apiStatus(self):
        self.updateStatus()
        return json.dumps(self.systemStatus)

    def apiPlates(self):
        return json.dumps(self.loadPlates())

    def apiPlatesUpdate(self):
        status = {
            'success': False
        }
        plates = self.loadPlates()
        resins = self.loadResins()

        try:
            resinId = int(request.values.get('resinId'))
            plateId = int(request.values.get('plateId'))
        except:
            status['message'] = 'Invalid inputs'
            return json.dumps(status)


        if not self.isValidPlateId(plateId, plates) or not self.isValidResinId(resinId, resins):
            status['message'] = 'Invalid plate or resin id'
            return json.dumps(status)

        plate = self.getPlateById(plateId, plates)
        plate["PROFILE_ID"] = resinId
        self.writePlates(plates)
        status["success"] = True

        return json.dumps(status)


    def apiPlatesUpload(self):
        if not request.method == 'POST':
            return self.renderError('Only POST method is supported')

        self.updateServerState({
            'processingUpload': True,
            'processingStatus': 'Processing request'
        })
        
        # Setup variables
        file = request.files['file']
        id = str(int(time.time() * 10 ))
        fileType = file.filename[-3:].upper()
        fileName = id + '.zip'
        
        # Validate File and Type
        if not file or not self.allowedFile(file.filename):
            self.updateServerState({'processingUpload': False})
            return self.renderError('Upload error or invalid file type.')

        try:
            # Write Uploaded File to disk
            self.updateServerState({'processingStatus': 'Writing file to disk'})
            self.writeUploadedFile(file, fileName)

            # Instantiate ChituPNG
            self.updateServerState({'processingStatus': 'Validating uploaded file'})
            chituPng = self.setupChituPng(id, fileName)
            
            # Validate File Contents
            if not self.validateChituPng(chituPng):
                self.updateServerState({'processingUpload': False})
                return self.renderError('Resolution mismatch or error reading file.')

            # Setup status variables
            isGcode = chituPng.isChiTU() == False or fileType == 'ZIP'
            resinId = isGcode if 0 else 1

            # Clear output directory
            self.resetDir(os.path.join(self.platesDirPath, id))
            
            # Extract file
            self.updateServerState({'processingStatus': 'Extracting archive'})
            if chituPng.isIncludeDir():
                toZ=chituPng.ExtraX()
            else:
                toZ=chituPng.Extra()

            # Write new plate meta data
            plateName = request.values['fileName']
            self.writeNewPlate(int(id), toZ, plateName, isGcode, resinId)

            # Generate G-Code
            if isGcode == True:
                self.updateServerState({'processingStatus': 'Generating G-Code'})
                self.generateGcode(id)
        except:
            self.updateServerState({'processingUpload': False})
            return self.renderError('Error processing uploaded file.')

        self.updateServerState({'processingUpload': False})
        
        return json.dumps({'success': True, 'plateId': id})


    def apiPlatesDelete(self):
        try:
            plateId = int(request.values.get('plateId'))
        except:
            return self.renderError('Error invalide input plateId.')

        if int(plateId) == 1:
            return self.renderError('Cannot delete default plate.')

        try:
            path = os.path.join(self.platesDirPath, str(plateId))
            subprocess.call(["rm", "-rf", path])
            time.sleep(0.1)
        except:
            return self.renderError('Error deleting plate.')

        try:
            plates = list(filter(lambda plate: plate["ID"] != plateId, self.loadPlates()))

            self.writePlates(plates)
        except:
            return self.renderError('Error writing plates data.')

        return json.dumps({'success': True})


    def apiResin(self):
        return json.dumps(self.loadResins())