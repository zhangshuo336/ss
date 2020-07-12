import logging

from exceptions import *
import time
from django.shortcuts import render

from dwebsocket.decorators import require_websocket
from websocket_handler import WebSocketHandler
from utils.data_type import ClientData
from utils.ioloop import IOLoop

from paramiko.ssh_exception import AuthenticationException, SSHException

LOG = logging.getLogger(__name__)


def index_view(request):
    return render(request, 'webssh/templates/index.html')

@require_websocket
def ssh_with_websocket(request):
    ws_handler = WebSocketHandler(request)
    ws_handler.open()
    IOLoop.instance()
    code = 1000
    reason = None
    if not request.is_websocket():
        raise exceptions.requests.InvalidSchema()
    else:
        try:
            while not request.websocket.has_messages():
                time.sleep(0.1)

            for message in request.websocket:
                if message.find('\u0004') > -1:
                    break
                _send_message(message, ws_handler)

        except AuthenticationException as e:
            code = 4000
            reason = 'Authentication failed:' + str(e.message)

        except SSHException as e:
            code = 4001
            reason = 'SSHException:' + str(e.message)

        except SSHShellException as e:
            code = 4001
            reason = 'SSHShellException:' + str(e.message)

        except AttributeError:
            pass

        finally:
            ws_handler.close(code=code, reason=reason)





def _send_message(message, ws_handler):
    client_data = ClientData(message)
    bridge = ws_handler.get_client()

    if ws_handler._is_init_data(client_data):
        if ws_handler._check_init_param(client_data.data):
            try:
                bridge.open(client_data.data)
            except AuthenticationException as e:
                raise e

            except SSHException as e:
                raise e

    else:
        try:
            if bridge:
                bridge.trans_forward(client_data.data)

        except SSHShellException as e:
            raise e
