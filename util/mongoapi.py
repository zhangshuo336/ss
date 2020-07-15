#coding=utf-8
from pymongo import *

client = MongoClient("mongodb://localhost:27017/")

db = client["ss"]

# 集合中所有的数据形式{_id:ObjectId("5e5d170374fece146addfee3"),name:'ss',val:objects}
# name为此集合中数据唯一的文档表示，val对应name表示的真实数据

def mongoSave(col,name,args):
	"""向MongoDB插入一条数据col为集合(表)的名字，标识符为name参数为args的文档"""
	mycol = db[col]
	return mycol.insert_one({"name":name,"val":args})

def mongoSaveMany(col,args):
	"""向MongoDB插入多条数据col为集合(表)的名字args为参数样式为[{},{},{}]"""
	mycol = db[col]
	if type(args) == list:
			return mycol.insert_many(args)
	else:
			return {"err":"params error"}

def mongoFindOne(col):
	"""查询MongoDB制定集合(表)为参数col的第一条数据"""
	mycol = db[col]
	return mycol.find_one()

def mongoFindAll(col):
	"""查询MongoDB指定集合col下所有的文档，返回数据为列表用于迭代"""
	mycol = db[col]
	return mycol.find()

def mongoFindQuery(col,args):
	"""查询指定字段的数据例如args='ss'返回的数据中name为ss的val数据"""
	mycol = db[col]
	data_base = mycol.find({"name":args})
	# print data_base
	return data_base
def mongoFindPage(col,offset,count):
	"""查询指定集合col下的数据并根据偏移量offset和数量count进行分页查询"""
	mycol = db[col]
	return mycol.find().skip(offset).limit(count)

def mongoUpdateOne(col,name,newvalues):
	"""更新指定集合col下的某一条数据查询条件name标识符为name的，新值val为newvalues"""
	mycol = db[col]
	return mycol.update_one({"name":name},{"$set":{"val":newvalues}})

def mongoUpdateMany(col,query,newvalues):
	"""更新指定集合col下的多条数据"""
	mycol = db[col]
	return mycol.update_many(query,newvalues)

def mongoDeleteOne(col,query):
	"""删除某一条指定col集合下的数据query为查询条件query={_id:1}删除_id为1的这条数据"""
	mycol = db[col]
	return mycol.delete_one(query)

def mongoDeleteMany(col,query):
	"""删除指定集合col下的多条数据"""
	mycol = db[col]
	return mycol.delete_many(query)

def mongoDeleteAll(col):
	"""删除指定col集合下的所有数据"""
	mycol = db[col]
	return mycol.delete_many({})

def mongoDeleteCol(col):
	"""删除指定集合col"""
	mycol = db[col]
	return mycol.drop()
