#coding=utf-8
import psutil
import time
import json
import os
import chardet
import dht11
# import six
import RPi.GPIO as GPIO
import urllib2
from bs4 import BeautifulSoup

from ss import settings
from config import *
from mongoapi import *

GPIO.setwarnings(True)
GPIO.setmode(GPIO.BCM)
instance = dht11.DHT11(pin=dht11_gpio_num)

def TimeStampToTime(timestamp):
    """将时间戳变为时间数组"""
    time_struct = time.localtime(timestamp)
    return time.strftime('%Y-%m-%d %H:%M:%S', time_struct)

def GetDirSize(path):
    """传入文件夹路径返回文件夹大小"""
    size = 0
    for root, dirs, files in os.walk(path):
        size += sum([os.path.getsize(os.path.join(root, name)) for name in files])
    return size

# class get_name(object):
#     def __init__(self,name):
#         self.name = name
#     @six.python_2_unicode_compatible
#     def __str__(self):
#         return six.u(self.name)

def ListDir(path):
    """传入路径返回当前目录下的所有文件"""
    # get_names = get_name()
    dir_info = {"ret":0,"err":"","dir_info":[]}
    if path.endswith("/"):
        pass
    else:
        path += "/"
    file_list = os.listdir(path)
    for name in file_list:
        msg = {}
        adchar = chardet.detect(name)
        # msg["name"] = get_names(name)
        # print adchar
        # if adchar["encoding"]:
        #     msg["name"] = name.decode(adchar["encoding"])
        # else:
        #     msg["name"] = name.decode("GBK")
        msg["name"] = name
        if os.path.isdir(path+name):
            msg["type"] = "dir"
            msg["size"] = GetDirSize(path+name)
        else:
            msg["type"] = "file"
            msg["size"] = os.path.getsize(path+name)
        msg["create_time"] = TimeStampToTime(os.path.getctime(path+name))
        msg["visit_time"] = TimeStampToTime(os.path.getatime(path+name))
        msg["modify_time"] = TimeStampToTime(os.path.getmtime(path+name))
        dir_info["dir_info"].append(msg)
    return dir_info


def hardWare():
    """返回当前主机硬件信息"""
    try:
        monitor = {"ret":0,"cpu_info":{},"memory":{},"disk":{},"network":{}}
        monitor["cpu_info"]["percent"] = psutil.cpu_percent(percpu=False)
        monitor["memory"]["total"] = psutil.virtual_memory()[0]
        monitor["memory"]["used"] = psutil.virtual_memory()[3]
        monitor["memory"]["available"] = psutil.virtual_memory()[1]
        monitor["memory"]["percent"] = psutil.virtual_memory()[2]
        monitor["disk"]["total"] = psutil.disk_usage("/")[0]
        monitor["disk"]["used"] = psutil.disk_usage("/")[1]
        monitor["disk"]["available"] = psutil.disk_usage("/")[2]
        monitor["disk"]["percent"] = psutil.disk_usage("/")[3]
        monitor["disk"]["read_conut"] = psutil.disk_io_counters()[0]
        monitor["disk"]["write_conut"] = psutil.disk_io_counters()[1]
        monitor["disk"]["read_bytes"] = psutil.disk_io_counters()[2]
        monitor["disk"]["write_bytes"] = psutil.disk_io_counters()[3]
        monitor["disk"]["read_time"] = psutil.disk_io_counters()[4]
        monitor["disk"]["write_time"] = psutil.disk_io_counters()[5]
        monitor["disk"]["busy_time"] = psutil.disk_io_counters()[8]
        monitor["network"]["bytes_sent"] = psutil.net_io_counters()[0]
        monitor["network"]["bytes_recv"] = psutil.net_io_counters()[1]
        monitor["network"]["packets_sent"] = psutil.net_io_counters()[2]
        monitor["network"]["packets_recv"] = psutil.net_io_counters()[3]
        monitor["network"]["errin"] = psutil.net_io_counters()[4]
        monitor["network"]["errout"] = psutil.net_io_counters()[5]
        monitor["cpu_info"]["temperature"] = psutil.sensors_temperatures()["cpu-thermal"][0][1]
        monitor["boot_time"] = time.strftime("%Y-%m-%d %X",time.localtime(psutil.boot_time()))
        monitor["users"] = len(psutil.users())
        monitor["pids"] = len(psutil.pids())
        while True:
            result = instance.read()
            temperature = result.temperature
            humidity = result.humidity
            if temperature != 0 and humidity != 0:
                break
        monitor["temperature"] = temperature
        monitor["humidity"] = humidity
        temperature_humidity_list = []
        if mongoFindOne(temperature_humidity_key):
            temperature_humidity_list = mongoFindOne(temperature_humidity_key)["val"][-9:]
        t_h_time_list = []
        t_list = []
        h_list = []
        for msg in temperature_humidity_list:
            a = msg["time"]
            # print a
            # print time.strftime('%H',time.localtime(a))
            t_h_time_list.append(time.strftime('%H',time.localtime(msg["time"])))
            t_list.append(msg["temperature"])
            h_list.append(msg["humidity"])
            # print t_h_time_list
        monitor["t_h_time_list"] = t_h_time_list
        monitor["t_list"] = t_list
        monitor["h_list"] = h_list

    except:
        monitor = {"ret":1001,"err":"[Hardware]Get Monitor Status Failed"}
    finally:
        monitor["time"] = int(time.time())
    # print monitor
    # print '--------------------------------------------------'
    return monitor

def save_temperature_humidity():
    while True:
        result = instance.read()
        temperature = result.temperature
        humidity = result.humidity
        data = {
            "temperature":temperature,
            "humidity":humidity,
            "time":time.time()
        }
        if temperature != 0 and humidity != 0:
            break
    data_base = {}
    for x in mongoFindQuery(temperature_humidity_key,temperature_humidity_key):
        data_base = x
    if not data_base:
        mongoSave(temperature_humidity_key,temperature_humidity_key,[data])
    elif len(data_base["val"]) > 8760:
        data_base["val"].pop(0)
        data_base["val"].append(data)
        mongoUpdateOne(temperature_humidity_key,temperature_humidity_key,data_base["val"])
    else:
        data_base["val"].append(data)
        mongoUpdateOne(temperature_humidity_key,temperature_humidity_key,data_base["val"])
    # print "seccess!"
    return True

def DeleteFile(path):
    # 判断路径是否存在
    ret = {"ret":0,"err":"","msg":""}
    try:
        if os.path.exists(path):
            if os.path.isfile(path):
                os.remove(path)
            else:
                os.removedirs(path)
        else:
            pass
    except Exception as e:
        ret["ret"] = 1003
        ret["err"] = "[DeleteFile]delete file or dir err"
        ret["msg"] = e
    return ret






if __name__ == "__main__":
    # hardWare()
    # get_baidu_yiqing_data()
    pass
