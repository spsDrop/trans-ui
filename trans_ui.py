import os
from flask import render_template_string
fileRoot = os.path.dirname(os.path.abspath(__file__))

class TransUiApi(object):
    printerStatus = {}
    systemStatus = {}

    def __init__(self, app, mqtt, json, time, subprocess, classChiTuPng_v2, chiTuClass, class_wifi_4k, h3info_class, class_gpio ,class_config, tempfile, uuid):
        self.json = json
        self.app = app
        self.mqtt = mqtt
        self.time = time
        self.subprocess = subprocess
        self.classChiTuPng_v2 = classChiTuPng_v2
        self.chiTuClass = chiTuClass
        self.class_wifi_4k = class_wifi_4k
        self.h3info_class = h3info_class
        self.class_gpio = class_gpio
        self.class_config = class_config
        self.tempfile = tempfile
        self.uuid = uuid

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

    def bindRoutes(self):
        self.app.add_url_rule('/transui', 'transIndex', self.transIndex)
        self.app.add_url_rule('/transui/', 'transIndex', self.transIndex)
        self.app.add_url_rule('/transui/<path:page>', 'transPage', self.transIndex)
        self.app.add_url_rule('/api/status', 'apiStatus', self.apiStatus)

    def readFile(self, filePath):
        file = open(filePath, 'r', encoding='utf8')
        fileContents =  file.read()
        file.close()
        return fileContents

    def updateStatus(self):
        config = self.class_config.CONFIG()
        status = {}
        h3 = self.h3info_class.h3()
        status['cpuLoad'] = h3.cpu_load()
        status['diskUsage'] = h3.disk_usage()
        status['cpuTemp'] = h3.cpu_temp()
        status['uptime'] = h3.uptime()
        status['printStatus'] = self.printerStatus
        status['version'] = config.hostname
        status['language'] = config.language

        self.systemStatus = status

    def transIndex(self, page=''):
        return render_template_string(self.readFile('trans-ui/index.html'))

    def apiStatus(self):
        self.updateStatus()
        return self.json.dumps(self.systemStatus)