import json

from logstash import TCPLogstashHandler


class CustomTCPLogstashHandler(TCPLogstashHandler):

    def format(self, record):
        message = super().format(record)
        print("Custom log message", type(message))
        return json.dumps(message)

    def send(self, s):
        print("Sending custom logs", s, type(s))
        if isinstance(s, str):
            s = s.encode('utf-8')
        super().send(s)

    def makePickle(self, record):
        return self.formatter.format(record)
