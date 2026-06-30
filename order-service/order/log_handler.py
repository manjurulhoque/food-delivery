import json

from logstash import TCPLogstashHandler


class CustomTCPLogstashHandler(TCPLogstashHandler):

    def format(self, record):
        message = super().format(record)
        return json.dumps(message)

    def send(self, s):
        if isinstance(s, str):
            s = s.encode('utf-8')
        super().send(s)

    def makePickle(self, record):
        return self.formatter.format(record)
