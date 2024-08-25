import pandas  as pd
from sqlalchemy import create_engine

userDB = 'root'
passDB = 'root'
hostDB = 'localhost'
portDB = '3306'
nameDB = 'prueba'


cosulta='mysql+pymysql://'+userDB+':'+passDB+'@'+hostDB+':'+portDB+'/'+nameDB
engine = create_engine(cosulta)

print(engine)
