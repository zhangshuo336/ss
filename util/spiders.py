#encoding=utf-8
import urllib2
from bs4 import BeautifulSoup
import time
import mongoapi
from config import *
import uuid
import random


def get_page(col,name):
    page = mongoapi.mongoFindQuery(col,name)
    data_list = list(page)
    # print data_list
    if data_list:
        try:
            num = data_list[0]["val"]
            newnum = int(num) + 1
            mongoapi.mongoUpdateOne(col,name,newnum)
            #print num
            return str(num)
        except Exception as e:
            # print e
            return False
    else:
        try:
            mongoapi.mongoSave(col,name,2)
            #print 1
            return str(1)
        except Exception as e:
            # print e
            return False

def get_user_agent():
    user_agent = [
        "UBrowser/4.0.3214.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122",
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E; LBBROWSER)",
        "3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)",
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR",
        "LBBROWSER",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1",
        "Safari/536.11",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
        "Safari/534.16",
        "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        "Opera/8.0 (Windows NT 5.1; U; en)",
        "OPR/26.0.1656.60",
        "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10",
        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 9.50",
        "Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 9.50",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
    ]
    headers = {'User-Agent': random.choice(user_agent)}
    return headers

def baidu_zhidao_spider():
    loop = 0
    while loop<5:
        index = get_page(baiduzhidaopage,baiduzhidaopage)
        url = 'https://zhidao.baidu.com/question/'+str(index)+'.html'
        try:
            request = urllib2.Request(url,headers=get_user_agent())
            h = urllib2.urlopen(request)
            html = BeautifulSoup(h)
            title = html.title.string
            #print title
            if title == u'百度知道 - 信息提示':
                loop += 1
                continue
            if title[-5:] == u'_百度知道':
                title  = title[:-5]
            answer_num = len(html.select("div[accuse='aContent']"))
            answer_list = []
            for i in range(answer_num):
                content = html.select("div[accuse='aContent']")[i].get_text().replace("\n","")
                if content[0:4] == u'展开全部':
                    content = content[4:]
                    answer_list.append(content)
            data = {
                    "title":title,
                    "answer":answer_list,
                    "page_num":index
                    }
            #print data
            mongoapi.mongoSave(baiduzhidao,str(uuid.uuid4()),data)
            break
        except Exception as e:
            #print 'err'
            mongoapi.mongoUpdateOne(baiduzhidaopage,baiduzhidaopage,index)
            # loop += 1
            # time.sleep(3)
            # continue
            break

def baidu_baike_spider():
    loop = 0
    while loop<5:
        index = get_page(baidubaikepage,baidubaikepage)
        url = 'https://baike.baidu.com/view/'+str(index)+'.htm'
        # print url
        try:
            # print '1'
            request = urllib2.Request(url,headers=get_user_agent())
            # print '2'
            h = urllib2.urlopen(request)
            html = BeautifulSoup(h)
            title = html.title.string
            # print title
            # print '3'
            if title == u'百度百科——全球最大中文百科全书':
                loop += 1
                continue
            else:
                # print '4'
                title = title[:-5]
                # print title
                # print html.select("div[class='para']")
                resp_num = len(html.select("div[class='para']"))
                # print resp_num
                resp_str = ""
                for i in range(resp_num):
                    resp_str += html.select("div[class='para']")[i].get_text().replace("\n","")
                data = {
                    "title":title,
                    "content":resp_str,
                    "page_num":index
                }
                # print data
                mongoapi.mongoSave(baidubaike,str(uuid.uuid4()),data)
                # loop += 1
                # time.sleep(3)
                # continue
                break
        except Exception as e:
            # print 'err'
            # print e
            mongoapi.mongoUpdateOne(baidubaikepage,baidubaikepage,index)
            break
            



# baidu_baike_spider()
#spider()



