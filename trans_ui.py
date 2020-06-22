import os
from flask import render_template_string
fileRoot = os.path.dirname(os.path.abspath(__file__))


class TransUiApi(object):
    def __init__(self, app, json, time, subprocess, classChiTuPng_v2, chiTuClass, class_wifi_4k, h3info_class, class_gpio ,class_config, tempfile, uuid):
        self.json = json
        self.app = app
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

    def bindRoutes(self):
        self.app.add_url_rule('/transui', 'transIndex', self.transIndex)

    def readFile(self, filePath):
        file = open(filePath, 'r', encoding='utf8')
        fileContents =  file.read()
        file.close()
        return fileContents

    def transIndex(self):
        return render_template_string(self.readFile('trans-ui/index.html'))