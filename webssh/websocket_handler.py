import logging
from utils.daemon import Bridge
from utils.utils import *

LOG = logging.getLogger(__name__)


class WebSocketHandler:
    clients = dict()

    def __init__(self, request):
        self.request = request

    def get_client(self):
        return self.clients.get(self._id(), None)

    def _put_client(self):
        bridge = Bridge(self)
        self.clients[self._id()] = bridge

    def remove_client(self, code=1000, reason=None):
        bridge = self.get_client()
        if bridge:
            bridge.destroy(code=code, reason=reason)
            del self.clients[self._id()]

    @staticmethod
    def _check_init_param(data):
        return check_ip(data["host"]) and check_port(data["port"])

    @staticmethod
    def _is_init_data(data):
        return data.get_type() == 'init'

    def _id(self):
        return id(self)

    def open(self):
        self._put_client()

    def close(self, code=1000, reason=None):
        self.remove_client(code=code, reason=reason)
        LOG.debug('client close the connection: %s' % self._id())
